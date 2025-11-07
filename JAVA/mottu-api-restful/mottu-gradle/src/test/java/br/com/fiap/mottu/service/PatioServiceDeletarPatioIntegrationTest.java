package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.*;
import br.com.fiap.mottu.repository.relacionamento.VeiculoPatioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Teste de integração para PatioService.deletarPatio()
 * Testa o método em um ambiente real com banco de dados
 */
@SpringBootTest
@Transactional
@Rollback
@DisplayName("Testes de Integração - PatioService.deletarPatio")
class PatioServiceDeletarPatioIntegrationTest {

    @Autowired
    private PatioService patioService;

    @Autowired
    private PatioRepository patioRepository;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @Autowired
    private VeiculoPatioRepository veiculoPatioRepository;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private ZonaRepository zonaRepository;

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando pátio não existe")
    void deveLancarExcecaoQuandoPatioNaoExiste() {
        // Arrange
        Long idInexistente = 999999L;

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            patioService.deletarPatio(idInexistente);
        });
    }

    @Test
    @DisplayName("Deve validar que não pode deletar pátio com estacionamentos ativos")
    void deveValidarEstacionamentosAtivos() {
        // Arrange - Buscar um pátio que tenha estacionamentos ativos (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio()) > 0)
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            assertTrue(exception.getMessage().contains("estacionamento"));
        }
    }

    @Test
    @DisplayName("Deve deletar pátio com sucesso mesmo quando há boxes (deletados em cascata)")
    void deveDeletarPatioComSucessoQuandoHaBoxes() {
        // Arrange - Buscar um pátio que tenha boxes mas sem estacionamentos ativos ou veículos (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> {
                    long estacionamentos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio());
                    long veiculos = veiculoPatioRepository.countByPatioIdPatio(p.getIdPatio());
                    long boxes = boxRepository.countByPatioIdPatio(p.getIdPatio());
                    return estacionamentos == 0 && veiculos == 0 && boxes > 0;
                })
                .findFirst()
                .orElse(null);

        if (patio != null) {
            Long patioId = patio.getIdPatio();
            
            // Act - Deve deletar com sucesso mesmo com boxes
            assertDoesNotThrow(() -> {
                patioService.deletarPatio(patioId);
            });
            
            // Assert - Pátio deve ter sido deletado e boxes também (em cascata)
            assertFalse(patioRepository.findById(patioId).isPresent());
            
            // Verifica que os boxes foram deletados em cascata
            long boxesDepois = boxRepository.countByPatioIdPatio(patioId);
            assertEquals(0, boxesDepois, "Boxes devem ter sido deletados em cascata");
        }
    }

    @Test
    @DisplayName("Deve deletar pátio com sucesso mesmo quando há zonas (deletadas em cascata)")
    void deveDeletarPatioComSucessoQuandoHaZonas() {
        // Arrange - Buscar um pátio que tenha zonas mas sem outras dependências (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> {
                    long estacionamentos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio());
                    long boxes = boxRepository.countByPatioIdPatio(p.getIdPatio());
                    long zonas = zonaRepository.countByPatioIdPatio(p.getIdPatio());
                    long veiculos = veiculoPatioRepository.countByPatioIdPatio(p.getIdPatio());
                    return estacionamentos == 0 && boxes == 0 && zonas > 0 && veiculos == 0;
                })
                .findFirst()
                .orElse(null);

        if (patio != null) {
            Long patioId = patio.getIdPatio();
            
            // Act - Deve deletar com sucesso mesmo com zonas
            assertDoesNotThrow(() -> {
                patioService.deletarPatio(patioId);
            });
            
            // Assert - Pátio deve ter sido deletado e zonas também (em cascata)
            assertFalse(patioRepository.findById(patioId).isPresent());
            
            // Verifica que as zonas foram deletadas em cascata
            long zonasDepois = zonaRepository.countByPatioIdPatio(patioId);
            assertEquals(0, zonasDepois, "Zonas devem ter sido deletadas em cascata");
        }
    }

    @Test
    @DisplayName("Deve validar que não pode deletar pátio com veículos associados")
    void deveValidarVeiculosAssociados() {
        // Arrange - Buscar um pátio que tenha veículos associados mas sem outras dependências (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> {
                    long estacionamentos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio());
                    long boxes = boxRepository.countByPatioIdPatio(p.getIdPatio());
                    long zonas = zonaRepository.countByPatioIdPatio(p.getIdPatio());
                    long veiculos = veiculoPatioRepository.countByPatioIdPatio(p.getIdPatio());
                    return estacionamentos == 0 && boxes == 0 && zonas == 0 && veiculos > 0;
                })
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            assertTrue(exception.getMessage().contains("veículo"));
        }
    }

    @Test
    @DisplayName("Deve executar validações na ordem correta")
    void deveExecutarValidacoesNaOrdemCorreta() {
        // Arrange
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio()) > 0)
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert - Deve lançar exceção de estacionamento primeiro
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            // Verifica que a mensagem é sobre estacionamento (primeira validação)
            assertTrue(exception.getMessage().contains("estacionamento"));
        }
    }
}






