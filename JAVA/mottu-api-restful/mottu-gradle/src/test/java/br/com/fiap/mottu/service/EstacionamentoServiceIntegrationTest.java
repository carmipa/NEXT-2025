package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Teste de integração para EstacionamentoService
 * Foca no problema de múltiplas referências ao Patio causando erro de orphanRemoval
 */
@SpringBootTest
@Transactional
@Rollback
@DisplayName("Testes de Integração - EstacionamentoService")
class EstacionamentoServiceIntegrationTest {

    @Autowired
    private EstacionamentoService estacionamentoService;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private PatioRepository patioRepository;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    private Veiculo veiculo;
    private Box box;
    private Patio patio;

    @BeforeEach
    void setUp() {
        // Buscar um veículo existente
        veiculo = veiculoRepository.findAll().stream()
                .filter(v -> v.getPlaca().equalsIgnoreCase("EGX1D92"))
                .findFirst()
                .orElse(null);

        if (veiculo == null) {
            // Se não encontrar, usar qualquer veículo disponível
            veiculo = veiculoRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Nenhum veículo encontrado no banco de dados"));
        }

        // Buscar um box livre
        box = boxRepository.findByStatus("L").stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Nenhum box livre encontrado"));

        // Obter o pátio do box
        patio = box.getPatio();
        assertNotNull(patio, "Box deve ter um pátio associado");
    }

    @Test
    @DisplayName("Deve estacionar veículo sem erro de orphanRemoval")
    void deveEstacionarVeiculoSemErroOrphanRemoval() {
        // Arrange
        String placa = veiculo.getPlaca();
        Long boxId = box.getIdBox();

        // Garantir que o veículo não está estacionado
        if (estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo())) {
            // Liberar o veículo primeiro
            estacionamentoService.liberarVeiculo(placa, null);
        }

        // Act & Assert - Não deve lançar exceção
        assertDoesNotThrow(() -> {
            var resultado = estacionamentoService.estacionarVeiculo(placa, boxId, patio.getIdPatio(), "Teste de integração");
            assertNotNull(resultado);
            assertEquals(placa, resultado.getVeiculo().getPlaca());
            assertEquals(boxId, resultado.getBox().getIdBox());
            assertTrue(resultado.getEstaEstacionado());
        });
    }

    @Test
    @DisplayName("Deve estacionar veículo sem especificar box (automático)")
    void deveEstacionarVeiculoSemEspecificarBox() {
        // Arrange
        String placa = veiculo.getPlaca();

        // Garantir que o veículo não está estacionado
        if (estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo())) {
            estacionamentoService.liberarVeiculo(placa, null);
        }

        // Act & Assert
        assertDoesNotThrow(() -> {
            var resultado = estacionamentoService.estacionarVeiculo(placa, null, patio.getIdPatio(), null);
            assertNotNull(resultado);
            assertEquals(placa, resultado.getVeiculo().getPlaca());
            assertTrue(resultado.getEstaEstacionado());
        });
    }

    @Test
    @DisplayName("Deve lançar exceção quando veículo já está estacionado")
    void deveLancarExcecaoQuandoVeiculoJaEstaEstacionado() {
        // Arrange
        String placa = veiculo.getPlaca();
        Long boxId = box.getIdBox();

        // Garantir que o veículo não está estacionado
        if (estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo())) {
            estacionamentoService.liberarVeiculo(placa, null);
        }

        // Estacionar pela primeira vez
        estacionamentoService.estacionarVeiculo(placa, boxId, patio.getIdPatio(), null);

        // Act & Assert - Deve lançar DuplicatedResourceException
        assertThrows(DuplicatedResourceException.class, () -> {
            estacionamentoService.estacionarVeiculo(placa, boxId, patio.getIdPatio(), null);
        });
    }

    @Test
    @DisplayName("Deve lançar exceção quando box já está ocupado")
    void deveLancarExcecaoQuandoBoxJaEstaOcupado() {
        // Arrange
        String placa = veiculo.getPlaca();
        Long boxId = box.getIdBox();

        // Garantir que o veículo não está estacionado
        if (estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo())) {
            estacionamentoService.liberarVeiculo(placa, null);
        }

        // Buscar outro veículo para ocupar o box
        Veiculo outroVeiculo = veiculoRepository.findAll().stream()
                .filter(v -> !v.getIdVeiculo().equals(veiculo.getIdVeiculo()))
                .filter(v -> !estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(v.getIdVeiculo()))
                .findFirst()
                .orElse(null);

        if (outroVeiculo != null) {
            // Ocupar o box com outro veículo
            estacionamentoService.estacionarVeiculo(outroVeiculo.getPlaca(), boxId, patio.getIdPatio(), null);

            // Act & Assert - Deve lançar InvalidInputException
            assertThrows(InvalidInputException.class, () -> {
                estacionamentoService.estacionarVeiculo(placa, boxId, patio.getIdPatio(), null);
            });
        }
    }

    @Test
    @DisplayName("Deve verificar múltiplas referências ao Patio não causam erro")
    void deveVerificarMultiplasReferenciasPatioNaoCausamErro() {
        // Arrange
        String placa = veiculo.getPlaca();
        Long boxId = box.getIdBox();

        // Garantir que o veículo não está estacionado
        if (estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo())) {
            estacionamentoService.liberarVeiculo(placa, null);
        }

        // Verificar que o box tem Patio carregado
        Box boxCarregado = boxRepository.findById(boxId).orElseThrow();
        Patio patioDoBox = boxCarregado.getPatio();
        assertNotNull(patioDoBox, "Box deve ter Patio carregado");

        // Act & Assert - Não deve lançar JpaSystemException ou HibernateException
        assertDoesNotThrow(() -> {
            var resultado = estacionamentoService.estacionarVeiculo(placa, boxId, patio.getIdPatio(), "Teste múltiplas referências");
            assertNotNull(resultado);
            assertEquals(patioDoBox.getIdPatio(), resultado.getPatio().getIdPatio());
        });
    }
}

