package br.com.fiap.mottu.service;

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
 * Teste de integração para verificar prevenção de duplicação de estacionamentos
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class EstacionamentoDuplicacaoTest {

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

    private Veiculo veiculo;
    private Box box1;
    private Box box2;
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

        // Criar veículo de teste
        veiculo = Veiculo.builder()
                .placa("TEST123")
                .renavam("12345678901")
                .chassi("9BW12345678901234")
                .modelo("Teste")
                .fabricante("Teste")
                .ano(2020)
                .combustivel("FLEX")
                .status("OPERACIONAL")
                .build();
        veiculo = veiculoRepository.save(veiculo);

        // Criar pátio de teste
        patio = Patio.builder()
                .nomePatio("Pátio Teste")
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
    }

    @Test
    void testarPrevencaoDuplicacaoAoEstacionar() {
        // 1. Estacionar veículo no box1
        estacionamentoService.estacionarVeiculo("TEST123", box1.getIdBox(), null, "Teste 1");
        
        // 2. Verificar que há apenas 1 estacionamento ativo
        List<Estacionamento> estacionamentosAtivos = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        assertEquals(1, estacionamentosAtivos.size(), "Deve haver apenas 1 estacionamento ativo após primeira estacionada");

        // 3. Tentar estacionar novamente no box2 (deve liberar o box1 e criar no box2)
        estacionamentoService.estacionarVeiculo("TEST123", box2.getIdBox(), null, "Teste 2");

        // 4. Verificar que há apenas 1 estacionamento ativo (o do box2)
        estacionamentosAtivos = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        assertEquals(1, estacionamentosAtivos.size(), "Deve haver apenas 1 estacionamento ativo após segunda estacionada");
        
        Estacionamento estacionamentoAtivo = estacionamentosAtivos.get(0);
        assertEquals(box2.getIdBox(), estacionamentoAtivo.getBox().getIdBox(), 
                "O estacionamento ativo deve ser do box2");

        // 5. Verificar que box1 foi liberado
        Box box1Atualizado = boxRepository.findById(box1.getIdBox()).orElseThrow();
        assertEquals("L", box1Atualizado.getStatus(), "Box1 deve estar livre");

        // 6. Verificar que box2 está ocupado
        Box box2Atualizado = boxRepository.findById(box2.getIdBox()).orElseThrow();
        assertEquals("O", box2Atualizado.getStatus(), "Box2 deve estar ocupado");
    }

    @Test
    void testarDetecaoDuplicacaoExistente() {
        // 1. Criar manualmente dois estacionamentos ativos (simulando bug anterior)
        Estacionamento est1 = Estacionamento.builder()
                .veiculo(veiculo)
                .box(box1)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est1);

        Estacionamento est2 = Estacionamento.builder()
                .veiculo(veiculo)
                .box(box2)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est2);

        // 2. Verificar que há 2 estacionamentos ativos (duplicação)
        List<Estacionamento> estacionamentosAtivos = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        assertEquals(2, estacionamentosAtivos.size(), "Deve haver 2 estacionamentos ativos (duplicação)");

        // 3. Tentar estacionar novamente (deve detectar e corrigir duplicação)
        Box box3 = Box.builder()
                .nome("teste003")
                .status("L")
                .patio(patio)
                .build();
        box3 = boxRepository.save(box3);

        estacionamentoService.estacionarVeiculo("TEST123", box3.getIdBox(), null, "Teste correção");

        // 4. Verificar que duplicação foi corrigida (deve haver apenas 1 estacionamento ativo)
        estacionamentosAtivos = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        assertEquals(1, estacionamentosAtivos.size(), 
                "Duplicação deve ser corrigida - deve haver apenas 1 estacionamento ativo");

        // 5. Verificar que é o box3
        Estacionamento estacionamentoAtivo = estacionamentosAtivos.get(0);
        assertEquals(box3.getIdBox(), estacionamentoAtivo.getBox().getIdBox(), 
                "O estacionamento ativo deve ser do box3");

        // 6. Verificar que boxes anteriores foram liberados
        Box box1Atualizado = boxRepository.findById(box1.getIdBox()).orElseThrow();
        Box box2Atualizado = boxRepository.findById(box2.getIdBox()).orElseThrow();
        assertEquals("L", box1Atualizado.getStatus(), "Box1 deve estar livre");
        assertEquals("L", box2Atualizado.getStatus(), "Box2 deve estar livre");
    }

    @Test
    void testarVerificacaoDuplicacaoViaSQL() {
        // Criar dois estacionamentos ativos
        Estacionamento est1 = Estacionamento.builder()
                .veiculo(veiculo)
                .box(box1)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est1);

        Estacionamento est2 = Estacionamento.builder()
                .veiculo(veiculo)
                .box(box2)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(est2);

        // Verificar via SQL direto
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculo.getIdVeiculo()
        );

        assertEquals(2, count, "Deve haver 2 estacionamentos ativos");
    }
}

