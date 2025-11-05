package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.*;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatio;
import br.com.fiap.mottu.repository.*;
import br.com.fiap.mottu.repository.relacionamento.VeiculoPatioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes completos para PatioService.deletarPatio()
 * Valida a solução implementada e verifica se não afetou outras áreas do sistema
 */
@SpringBootTest
@Transactional
@Rollback
@DisplayName("Testes Completos - PatioService.deletarPatio - Validação da Solução")
class PatioServiceDeletarPatioCompletoTest {

    @Autowired
    private PatioService patioService;

    @Autowired
    private PatioRepository patioRepository;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private ZonaRepository zonaRepository;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @Autowired
    private VeiculoPatioRepository veiculoPatioRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private ContatoRepository contatoRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    private Contato contato;
    private Endereco endereco;
    private Patio patio;
    private List<Box> boxes;
    private List<Zona> zonas;
    private Veiculo veiculo;

    @BeforeEach
    void setUp() {
        // Criar Contato
        contato = Contato.builder()
                .email("teste-delete-" + System.currentTimeMillis() + "@example.com")
                .ddd(11)
                .ddi(55)
                .telefone1("123456789")
                .celular("987654321")
                .build();
        contato = contatoRepository.save(contato);

        // Criar Endereco diretamente (evitando chamada reativa ao ViaCEP em testes)
        endereco = Endereco.builder()
                .cep("01234567")
                .logradouro("Rua Teste Delete")
                .numero(123)
                .complemento("Apto 45")
                .bairro("Centro")
                .cidade("São Paulo")
                .estado("SP")
                .pais("Brasil")
                .build();
        endereco = enderecoRepository.save(endereco);

        // Criar Veículo para testes
        veiculo = Veiculo.builder()
                .placa("TEST" + System.currentTimeMillis())
                .renavam("12345678901")
                .chassi("9BW12345678901234")
                .modelo("Teste")
                .fabricante("Teste")
                .ano(2020)
                .combustivel("FLEX")
                .status("OPERACIONAL")
                .build();
        veiculo = veiculoRepository.save(veiculo);
    }

    @Test
    @DisplayName("✅ Deve deletar pátio com boxes associados (deletados em cascata)")
    void deveDeletarPatioComBoxesAssociados() {
        // Arrange - Criar pátio com boxes
        patio = criarPatioComBoxes(5);

        Long patioId = patio.getIdPatio();
        long boxesAntes = boxRepository.countByPatioIdPatio(patioId);

        assertTrue(boxesAntes > 0, "Deve ter boxes criados");

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert - Pátio e boxes devem ter sido deletados
        assertFalse(patioRepository.findById(patioId).isPresent(), 
                "Pátio deve ter sido deletado");
        assertEquals(0, boxRepository.countByPatioIdPatio(patioId), 
                "Boxes devem ter sido deletados em cascata");
    }

    @Test
    @DisplayName("✅ Deve deletar pátio com zonas associadas (deletadas em cascata)")
    void deveDeletarPatioComZonasAssociadas() {
        // Arrange - Criar pátio com zonas
        patio = criarPatioComZonas(3);

        Long patioId = patio.getIdPatio();
        long zonasAntes = zonaRepository.countByPatioIdPatio(patioId);

        assertTrue(zonasAntes > 0, "Deve ter zonas criadas");

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert - Pátio e zonas devem ter sido deletados
        assertFalse(patioRepository.findById(patioId).isPresent(), 
                "Pátio deve ter sido deletado");
        assertEquals(0, zonaRepository.countByPatioIdPatio(patioId), 
                "Zonas devem ter sido deletadas em cascata");
    }

    @Test
    @DisplayName("✅ Deve deletar pátio com boxes e zonas associados (deletados em cascata)")
    void deveDeletarPatioComBoxesEZonasAssociados() {
        // Arrange - Criar pátio com boxes e zonas
        patio = criarPatioCompleto(5, 3);

        Long patioId = patio.getIdPatio();
        long boxesAntes = boxRepository.countByPatioIdPatio(patioId);
        long zonasAntes = zonaRepository.countByPatioIdPatio(patioId);

        assertTrue(boxesAntes > 0, "Deve ter boxes criados");
        assertTrue(zonasAntes > 0, "Deve ter zonas criadas");

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert - Pátio, boxes e zonas devem ter sido deletados
        assertFalse(patioRepository.findById(patioId).isPresent(), 
                "Pátio deve ter sido deletado");
        assertEquals(0, boxRepository.countByPatioIdPatio(patioId), 
                "Boxes devem ter sido deletados em cascata");
        assertEquals(0, zonaRepository.countByPatioIdPatio(patioId), 
                "Zonas devem ter sido deletadas em cascata");
    }

    @Test
    @DisplayName("✅ Deve deletar pátio com registros históricos de estacionamentos (deletados em cascata)")
    void deveDeletarPatioComRegistrosHistoricosEstacionamentos() {
        // Arrange - Criar pátio com boxes e registros históricos de estacionamentos
        patio = criarPatioComBoxes(3);
        Long patioId = patio.getIdPatio();

        // Criar registros históricos de estacionamentos (inativos)
        boxes = new ArrayList<>(boxRepository.findByPatioIdPatio(patioId));
        
        for (Box box : boxes) {
            Estacionamento estacionamentoHistorico = Estacionamento.builder()
                    .veiculo(veiculo)
                    .box(box)
                    .patio(patio)
                    .estaEstacionado(false) // Histórico (inativo)
                    .dataEntrada(LocalDateTime.now().minusDays(10))
                    .dataSaida(LocalDateTime.now().minusDays(5))
                    .build();
            estacionamentoRepository.save(estacionamentoHistorico);
        }

        long estacionamentosHistoricosAntes = estacionamentoRepository.count();
        long estacionamentosAtivosAntes = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId);

        assertEquals(0, estacionamentosAtivosAntes, 
                "Não deve ter estacionamentos ativos");
        assertTrue(estacionamentosHistoricosAntes > 0, 
                "Deve ter registros históricos criados");

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert - Pátio e registros históricos devem ter sido deletados
        assertFalse(patioRepository.findById(patioId).isPresent(), 
                "Pátio deve ter sido deletado");
        
        // Verificar se os registros históricos foram deletados em cascata
        long estacionamentosDepois = estacionamentoRepository.findAll().stream()
                .filter(e -> e.getPatio().getIdPatio().equals(patioId))
                .count();
        assertEquals(0, estacionamentosDepois, 
                "Registros históricos de estacionamentos devem ter sido deletados em cascata");
    }

    @Test
    @DisplayName("❌ Deve impedir exclusão quando há estacionamentos ativos")
    void deveImpedirExclusaoComEstacionamentosAtivos() {
        // Arrange - Criar pátio com estacionamento ativo
        patio = criarPatioComBoxes(1);
        Long patioId = patio.getIdPatio();
        Box box = boxes.get(0);

        // Criar estacionamento ativo
        Estacionamento estacionamentoAtivo = Estacionamento.builder()
                .veiculo(veiculo)
                .box(box)
                .patio(patio)
                .estaEstacionado(true) // ATIVO
                .dataEntrada(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(estacionamentoAtivo);

        long estacionamentosAtivos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId);
        assertEquals(1, estacionamentosAtivos, "Deve ter 1 estacionamento ativo");

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        assertTrue(exception.getMessage().contains("estacionamento"), 
                "Mensagem deve mencionar estacionamento");
        assertTrue(exception.getMessage().contains("ativo"), 
                "Mensagem deve mencionar ativo");

        // Verificar que o pátio NÃO foi deletado
        assertTrue(patioRepository.findById(patioId).isPresent(), 
                "Pátio NÃO deve ter sido deletado");
    }

    @Test
    @DisplayName("❌ Deve impedir exclusão quando há veículos associados")
    void deveImpedirExclusaoComVeiculosAssociados() {
        // Arrange - Criar pátio e associar veículo
        patio = criarPatioCompleto(2, 1);
        Long patioId = patio.getIdPatio();

        // Associar veículo ao pátio
        VeiculoPatio veiculoPatio = new VeiculoPatio(veiculo, patio);
        veiculoPatioRepository.save(veiculoPatio);

        long veiculosAssociados = veiculoPatioRepository.countByPatioIdPatio(patioId);
        assertEquals(1, veiculosAssociados, "Deve ter 1 veículo associado");

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        assertTrue(exception.getMessage().contains("veículo"), 
                "Mensagem deve mencionar veículo");

        // Verificar que o pátio NÃO foi deletado
        assertTrue(patioRepository.findById(patioId).isPresent(), 
                "Pátio NÃO deve ter sido deletado");
    }

    @Test
    @DisplayName("✅ Deve deletar pátio sem dependências")
    void deveDeletarPatioSemDependencias() {
        // Arrange - Criar pátio sem boxes, zonas ou outras dependências
        patio = criarPatioBasico();

        Long patioId = patio.getIdPatio();

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert
        assertFalse(patioRepository.findById(patioId).isPresent(), 
                "Pátio deve ter sido deletado");
    }

    @Test
    @DisplayName("❌ Deve lançar exceção quando pátio não existe")
    void deveLancarExcecaoQuandoPatioNaoExiste() {
        // Arrange
        Long idInexistente = 999999L;

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            patioService.deletarPatio(idInexistente);
        });
    }

    // ================== MÉTODOS AUXILIARES ==================

    private Patio criarPatioBasico() {
        Patio novoPatio = Patio.builder()
                .nomePatio("Pátio Teste Delete " + System.currentTimeMillis())
                .status("A")
                .observacao("Pátio para teste de exclusão")
                .contato(contato)
                .endereco(endereco)
                .build();
        return patioRepository.save(novoPatio);
    }

    private Patio criarPatioComBoxes(int quantidadeBoxes) {
        Patio novoPatio = criarPatioBasico();
        boxes = new ArrayList<>();

        for (int i = 1; i <= quantidadeBoxes; i++) {
            Box box = Box.builder()
                    .nome("BOX-" + String.format("%03d", i))
                    .status("L")
                    .observacao("Box criado para teste")
                    .patio(novoPatio)
                    .build();
            box = boxRepository.save(box);
            boxes.add(box);
        }

        return novoPatio;
    }

    private Patio criarPatioComZonas(int quantidadeZonas) {
        Patio novoPatio = criarPatioBasico();
        // Garantir que o STATUS do pátio está correto antes de criar zonas
        novoPatio.setStatus("A");
        novoPatio = patioRepository.save(novoPatio);
        zonas = new ArrayList<>();

        for (int i = 1; i <= quantidadeZonas; i++) {
            Zona zona = Zona.builder()
                    .nome("ZONA-" + String.format("%02d", i))
                    .status("A")
                    .observacao("Zona criada para teste")
                    .patio(novoPatio)
                    .build();
            zona = zonaRepository.save(zona);
            zonas.add(zona);
        }

        return novoPatio;
    }

    private Patio criarPatioCompleto(int quantidadeBoxes, int quantidadeZonas) {
        Patio novoPatio = criarPatioBasico();
        // Garantir que o STATUS do pátio está correto antes de criar zonas
        novoPatio.setStatus("A");
        novoPatio = patioRepository.save(novoPatio);
        boxes = new ArrayList<>();
        zonas = new ArrayList<>();

        // Criar zonas primeiro
        for (int i = 1; i <= quantidadeZonas; i++) {
            Zona zona = Zona.builder()
                    .nome("ZONA-" + String.format("%02d", i))
                    .status("A")
                    .observacao("Zona criada para teste")
                    .patio(novoPatio)
                    .build();
            zona = zonaRepository.save(zona);
            zonas.add(zona);
        }

        // Criar boxes
        for (int i = 1; i <= quantidadeBoxes; i++) {
            Box box = Box.builder()
                    .nome("BOX-" + String.format("%03d", i))
                    .status("L")
                    .observacao("Box criado para teste")
                    .patio(novoPatio)
                    .build();
            box = boxRepository.save(box);
            boxes.add(box);
        }

        return novoPatio;
    }
}

