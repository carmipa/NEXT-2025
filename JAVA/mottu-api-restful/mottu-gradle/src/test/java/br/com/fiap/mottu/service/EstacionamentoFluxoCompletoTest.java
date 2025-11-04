package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Contato;
import br.com.fiap.mottu.model.Endereco;
import br.com.fiap.mottu.model.Estacionamento;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.ContatoRepository;
import br.com.fiap.mottu.repository.EnderecoRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Teste completo de integração para validar todos os fluxos de estacionamento:
 * - Estacionar veículo
 * - Liberar veículo
 * - Buscar estacionamento ativo
 * - Prevenção de duplicação
 * - Liberação por boxId específico
 * - Consistência entre TB_BOX e TB_ESTACIONAMENTO
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Teste Completo de Fluxo de Estacionamento")
public class EstacionamentoFluxoCompletoTest {

    @Autowired
    private EstacionamentoService estacionamentoService;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private PatioRepository patioRepository;

    @Autowired
    private ContatoRepository contatoRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Veiculo veiculo1;
    private Veiculo veiculo2;
    private Box box1;
    private Box box2;
    private Box box3;
    private Patio patio;
    private Contato contato;
    private Endereco endereco;

    @BeforeEach
    void setUp() {
        // Criar Contato e Endereco (necessários para criar Patio)
        contato = Contato.builder()
                .email("teste@example.com")
                .ddd(11)
                .ddi(55)
                .telefone1("123456789")
                .celular("987654321")
                .build();
        contato = contatoRepository.save(contato);

        endereco = Endereco.builder()
                .cep("01234567")
                .logradouro("Rua Teste")
                .numero(123)
                .complemento("Apto 45")
                .bairro("Centro")
                .cidade("São Paulo")
                .estado("SP")
                .pais("Brasil")
                .build();
        endereco = enderecoRepository.save(endereco);

        // Criar veículos de teste
        veiculo1 = Veiculo.builder()
                .placa("TEST001")
                .renavam("12345678901")
                .chassi("9BW12345678901234")
                .modelo("Honda CB600")
                .fabricante("Honda")
                .ano(2020)
                .combustivel("FLEX")
                .status("OPERACIONAL")
                .build();
        veiculo1 = veiculoRepository.save(veiculo1);

        veiculo2 = Veiculo.builder()
                .placa("TEST002")
                .renavam("12345678902")
                .chassi("9BW12345678901235")
                .modelo("Yamaha MT07")
                .fabricante("Yamaha")
                .ano(2021)
                .combustivel("FLEX")
                .status("OPERACIONAL")
                .build();
        veiculo2 = veiculoRepository.save(veiculo2);

        // Criar pátio de teste
        patio = Patio.builder()
                .nomePatio("Pátio Teste Completo")
                .status("A")
                .dataCadastro(LocalDateTime.now().toLocalDate())
                .contato(contato)
                .endereco(endereco)
                .build();
        patio = patioRepository.save(patio);

        // Criar boxes de teste
        box1 = Box.builder()
                .nome("teste001")
                .status("L")
                .patio(patio)
                .build();
        box1 = boxRepository.save(box1);

        box2 = Box.builder()
                .nome("teste002")
                .status("L")
                .patio(patio)
                .build();
        box2 = boxRepository.save(box2);

        box3 = Box.builder()
                .nome("teste003")
                .status("L")
                .patio(patio)
                .build();
        box3 = boxRepository.save(box3);
    }

    @Test
    @DisplayName("Cenário 1: Estacionar veículo e verificar consistência")
    void testarEstacionarVeiculo() {
        // 1. Estacionar veículo no box1
        var resultado = estacionamentoService.estacionarVeiculo("TEST001", box1.getIdBox(), null, "Teste inicial");
        
        assertNotNull(resultado);
        assertEquals(box1.getIdBox(), resultado.getBox().getIdBox());
        assertTrue(resultado.getEstaEstacionado());

        // 2. Verificar TB_ESTACIONAMENTO
        Long countEstacionamento = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(1, countEstacionamento, "Deve haver apenas 1 estacionamento ativo");

        // 3. Verificar TB_BOX
        String statusBox = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box1.getIdBox()
        );
        assertEquals("O", statusBox, "Box deve estar ocupado");

        // 4. Verificar busca por placa
        var estacionamentoAtivo = estacionamentoService.buscarAtivoPorPlaca("TEST001");
        assertNotNull(estacionamentoAtivo);
        assertEquals(box1.getIdBox(), estacionamentoAtivo.getBox().getIdBox());
    }

    @Test
    @DisplayName("Cenário 2: Liberar veículo e verificar consistência")
    void testarLiberarVeiculo() {
        // 1. Estacionar primeiro
        estacionamentoService.estacionarVeiculo("TEST001", box1.getIdBox(), null, "Teste");
        
        // 2. Verificar que está estacionado
        var estacionamentoAtivo = estacionamentoService.buscarAtivoPorPlaca("TEST001");
        assertNotNull(estacionamentoAtivo);

        // 3. Liberar
        var resultadoLiberacao = estacionamentoService.liberarVeiculo("TEST001", "Saída de teste");
        
        assertNotNull(resultadoLiberacao);
        assertFalse(resultadoLiberacao.getEstaEstacionado());
        assertNotNull(resultadoLiberacao.getDataSaida());

        // 4. Verificar TB_ESTACIONAMENTO
        Long countAtivo = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(0, countAtivo, "Não deve haver estacionamentos ativos");

        // 5. Verificar TB_BOX
        String statusBox = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box1.getIdBox()
        );
        assertEquals("L", statusBox, "Box deve estar livre");

        // 6. Verificar busca por placa retorna null
        var estacionamentoDepois = estacionamentoService.buscarAtivoPorPlaca("TEST001");
        assertNull(estacionamentoDepois, "Não deve encontrar estacionamento ativo após liberação");
    }

    @Test
    @DisplayName("Cenário 3: Liberar box específico (liberarPorBoxId)")
    void testarLiberarPorBoxId() {
        // 1. Estacionar veículo no box1
        estacionamentoService.estacionarVeiculo("TEST001", box1.getIdBox(), null, "Teste");

        // 2. Verificar que está estacionado
        var estacionamentoAtivo = estacionamentoService.buscarAtivoPorPlaca("TEST001");
        assertNotNull(estacionamentoAtivo);
        assertEquals(box1.getIdBox(), estacionamentoAtivo.getBox().getIdBox());

        // 3. Liberar usando liberarPorBoxId
        var resultado = estacionamentoService.liberarPorBoxId(box1.getIdBox(), "Liberação por boxId");

        assertNotNull(resultado);
        assertFalse(resultado.getEstaEstacionado());
        assertEquals(box1.getIdBox(), resultado.getBox().getIdBox());

        // 4. Verificar consistência
        Long countAtivo = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(0, countAtivo, "Não deve haver estacionamentos ativos");

        String statusBox = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box1.getIdBox()
        );
        assertEquals("L", statusBox, "Box deve estar livre");
    }

    @Test
    @DisplayName("Cenário 4: Prevenção de duplicação - estacionar mesmo veículo em box diferente")
    void testarPrevencaoDuplicacao() {
        // 1. Estacionar veículo no box1
        estacionamentoService.estacionarVeiculo("TEST001", box1.getIdBox(), null, "Primeira estacionada");

        // 2. Verificar que há apenas 1 ativo
        Long countAntes = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(1, countAntes);

        // 3. Tentar estacionar no box2 (deve liberar box1 e criar no box2)
        estacionamentoService.estacionarVeiculo("TEST001", box2.getIdBox(), null, "Segunda estacionada");

        // 4. Verificar que há apenas 1 ativo (do box2)
        Long countDepois = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(1, countDepois, "Deve haver apenas 1 estacionamento ativo");

        // 5. Verificar que é do box2
        var estacionamentoAtivo = estacionamentoService.buscarAtivoPorPlaca("TEST001");
        assertNotNull(estacionamentoAtivo);
        assertEquals(box2.getIdBox(), estacionamentoAtivo.getBox().getIdBox());

        // 6. Verificar que box1 foi liberado
        String statusBox1 = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box1.getIdBox()
        );
        assertEquals("L", statusBox1, "Box1 deve estar livre");

        // 7. Verificar que box2 está ocupado
        String statusBox2 = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box2.getIdBox()
        );
        assertEquals("O", statusBox2, "Box2 deve estar ocupado");
    }

    @Test
    @DisplayName("Cenário 5: Correção automática de duplicação existente")
    void testarCorrecaoAutomaticaDuplicacao() {
        // 1. Criar manualmente dois estacionamentos ativos (simulando bug)
        Estacionamento est1 = Estacionamento.builder()
                .veiculo(veiculo1)
                .box(box1)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .dataUltimaAtualizacao(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est1);

        Estacionamento est2 = Estacionamento.builder()
                .veiculo(veiculo1)
                .box(box2)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .dataUltimaAtualizacao(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est2);

        // 2. Verificar que há 2 ativos (duplicação)
        Long countAntes = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(2, countAntes, "Deve haver 2 estacionamentos ativos (duplicação)");

        // 3. Estacionar novamente (deve corrigir duplicação)
        estacionamentoService.estacionarVeiculo("TEST001", box3.getIdBox(), null, "Correção duplicação");

        // 4. Verificar que duplicação foi corrigida
        Long countDepois = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(1, countDepois, "Duplicação deve ser corrigida - apenas 1 ativo");

        // 5. Verificar que é do box3
        var estacionamentoAtivo = estacionamentoService.buscarAtivoPorPlaca("TEST001");
        assertNotNull(estacionamentoAtivo);
        assertEquals(box3.getIdBox(), estacionamentoAtivo.getBox().getIdBox());

        // 6. Verificar que boxes anteriores foram liberados
        String statusBox1 = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box1.getIdBox()
        );
        String statusBox2 = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box2.getIdBox()
        );
        assertEquals("L", statusBox1, "Box1 deve estar livre");
        assertEquals("L", statusBox2, "Box2 deve estar livre");
    }

    @Test
    @DisplayName("Cenário 6: Estacionamento automático por patioId")
    void testarEstacionamentoAutomaticoPorPatioId() {
        // 1. Estacionar veículo automaticamente no pátio (sem especificar box)
        var resultado = estacionamentoService.estacionarVeiculo("TEST001", null, patio.getIdPatio(), "Auto");

        assertNotNull(resultado);
        assertTrue(resultado.getEstaEstacionado());
        assertNotNull(resultado.getBox());
        assertEquals(patio.getIdPatio(), resultado.getPatio().getIdPatio());

        // 2. Verificar que o box foi ocupado
        Long boxIdOcupado = resultado.getBox().getIdBox();
        String statusBox = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                boxIdOcupado
        );
        assertEquals("O", statusBox, "Box atribuído automaticamente deve estar ocupado");

        // 3. Verificar consistência
        Long countAtivo = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(1, countAtivo, "Deve haver apenas 1 estacionamento ativo");
    }

    @Test
    @DisplayName("Cenário 7: Liberar múltiplos estacionamentos duplicados")
    void testarLiberarMultiplosDuplicados() {
        // 1. Criar manualmente dois estacionamentos ativos
        Estacionamento est1 = Estacionamento.builder()
                .veiculo(veiculo1)
                .box(box1)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .dataUltimaAtualizacao(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est1);

        Estacionamento est2 = Estacionamento.builder()
                .veiculo(veiculo1)
                .box(box2)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .dataUltimaAtualizacao(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est2);

        // 2. Verificar que há 2 ativos
        Long countAntes = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(2, countAntes);

        // 3. Liberar veículo (deve liberar ambos)
        estacionamentoService.liberarVeiculo("TEST001", "Liberação múltipla");

        // 4. Verificar que ambos foram liberados
        Long countDepois = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo1.getIdVeiculo()
        );
        assertEquals(0, countDepois, "Todos os estacionamentos devem ser liberados");

        // 5. Verificar que ambos os boxes foram liberados
        String statusBox1 = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box1.getIdBox()
        );
        String statusBox2 = jdbcTemplate.queryForObject(
                "SELECT STATUS FROM TB_BOX WHERE ID_BOX = ?",
                String.class,
                box2.getIdBox()
        );
        assertEquals("L", statusBox1, "Box1 deve estar livre");
        assertEquals("L", statusBox2, "Box2 deve estar livre");
    }

    @Test
    @DisplayName("Cenário 8: Tentar liberar box que não está ocupado")
    void testarLiberarBoxNaoOcupado() {
        // Tentar liberar box livre deve lançar exceção
        assertThrows(ResourceNotFoundException.class, () -> {
            estacionamentoService.liberarPorBoxId(box1.getIdBox(), "Tentativa");
        }, "Deve lançar exceção ao tentar liberar box não ocupado");
    }

    @Test
    @DisplayName("Cenário 9: Estacionar dois veículos diferentes simultaneamente")
    void testarEstacionarDoisVeiculosDiferentes() {
        // 1. Estacionar veículo1 no box1
        var resultado1 = estacionamentoService.estacionarVeiculo("TEST001", box1.getIdBox(), null, "Veículo 1");
        assertNotNull(resultado1);

        // 2. Estacionar veículo2 no box2
        var resultado2 = estacionamentoService.estacionarVeiculo("TEST002", box2.getIdBox(), null, "Veículo 2");
        assertNotNull(resultado2);

        // 3. Verificar que ambos estão ativos
        var est1 = estacionamentoService.buscarAtivoPorPlaca("TEST001");
        var est2 = estacionamentoService.buscarAtivoPorPlaca("TEST002");

        assertNotNull(est1);
        assertNotNull(est2);
        assertEquals(box1.getIdBox(), est1.getBox().getIdBox());
        assertEquals(box2.getIdBox(), est2.getBox().getIdBox());

        // 4. Verificar consistência
        Long countTotal = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE ESTA_ESTACIONADO = 1",
                Long.class
        );
        assertEquals(2, countTotal, "Deve haver 2 estacionamentos ativos (um para cada veículo)");
    }
}

