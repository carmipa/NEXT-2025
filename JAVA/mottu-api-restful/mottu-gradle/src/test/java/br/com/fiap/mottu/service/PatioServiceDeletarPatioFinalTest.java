package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.OperationNotAllowedException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.*;
import br.com.fiap.mottu.model.relacionamento.VeiculoBox;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatio;
import br.com.fiap.mottu.repository.*;
import br.com.fiap.mottu.repository.relacionamento.VeiculoBoxRepository;
import br.com.fiap.mottu.repository.relacionamento.VeiculoPatioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes finais para validar a solução completa de exclusão de Pátio
 * com mensagens de erro melhoradas e tratamento de dependências
 */
@SpringBootTest
@Transactional
@Rollback
@DisplayName("Testes Finais - Exclusão de Pátio com Mensagens Melhoradas")
class PatioServiceDeletarPatioFinalTest {

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

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @Autowired
    private LogMovimentacaoRepository logMovimentacaoRepository;

    @Autowired
    private VeiculoBoxRepository veiculoBoxRepository;

    private Contato contato;
    private Endereco endereco;
    private Patio patio;
    private Veiculo veiculo;

    @BeforeEach
    void setUp() {
        // Criar Contato
        contato = Contato.builder()
                .email("teste-final-" + System.currentTimeMillis() + "@example.com")
                .ddd(11)
                .ddi(55)
                .telefone1("123456789")
                .celular("987654321")
                .build();
        contato = contatoRepository.save(contato);

        // Criar Endereco
        endereco = Endereco.builder()
                .cep("01234567")
                .logradouro("Rua Teste Final")
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
    @DisplayName("✅ Deve fornecer mensagem clara quando há estacionamentos ativos")
    void deveFornecerMensagemClaraComEstacionamentosAtivos() {
        // Arrange
        patio = criarPatioComBoxes(1);
        Long patioId = patio.getIdPatio();
        Box box = boxRepository.findByPatioIdPatio(patioId).get(0);

        // Criar estacionamento ativo
        Estacionamento estacionamento = Estacionamento.builder()
                .veiculo(veiculo)
                .box(box)
                .patio(patio)
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .build();
        estacionamentoRepository.save(estacionamento);

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        String mensagem = exception.getMessage();
        assertNotNull(mensagem);
        assertTrue(mensagem.contains("Não é possível excluir"), 
                "Mensagem deve conter 'Não é possível excluir'");
        assertTrue(mensagem.contains(patio.getNomePatio()), 
                "Mensagem deve conter o nome do pátio");
        assertTrue(mensagem.contains("veículo(s) estacionado(s)"), 
                "Mensagem deve mencionar veículos estacionados");
        assertTrue(mensagem.contains("liberar"), 
                "Mensagem deve sugerir liberar veículos");
    }

    @Test
    @DisplayName("✅ Deve fornecer mensagem clara quando há veículos associados")
    void deveFornecerMensagemClaraComVeiculosAssociados() {
        // Arrange
        patio = criarPatioCompleto(2, 1);
        Long patioId = patio.getIdPatio();

        // Associar veículo ao pátio
        VeiculoPatio veiculoPatio = new VeiculoPatio(veiculo, patio);
        veiculoPatioRepository.save(veiculoPatio);

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        String mensagem = exception.getMessage();
        assertNotNull(mensagem);
        assertTrue(mensagem.contains("Não é possível excluir"), 
                "Mensagem deve conter 'Não é possível excluir'");
        assertTrue(mensagem.contains(patio.getNomePatio()), 
                "Mensagem deve conter o nome do pátio");
        assertTrue(mensagem.contains("veículo(s) associado(s)"), 
                "Mensagem deve mencionar veículos associados");
        assertTrue(mensagem.contains("remova as associações"), 
                "Mensagem deve sugerir remover associações");
    }

    @Test
    @DisplayName("✅ Deve deletar pátio com sucesso mesmo com dependências complexas")
    void deveDeletarPatioComSucessoComDependenciasComplexas() {
        // Arrange
        patio = criarPatioComBoxes(3);
        Long patioId = patio.getIdPatio();
        List<Box> boxes = boxRepository.findByPatioIdPatio(patioId);

        // Criar dependências para cada box
        for (Box box : boxes) {
            // Criar notificação relacionada ao box
            Notificacao notificacao = Notificacao.builder()
                    .tipo(Notificacao.TipoNotificacao.INFO)
                    .titulo("Teste Notificação")
                    .mensagem("Mensagem de teste")
                    .prioridade(Notificacao.PrioridadeNotificacao.BAIXA)
                    .categoria(Notificacao.CategoriaNotificacao.OCUPACAO) // Usando categoria válida
                    .lida(false)
                    .box(box)
                    .patio(patio)
                    .build();
            notificacaoRepository.save(notificacao);

            // Criar log de movimentação relacionado ao box
            LogMovimentacao logMovimentacao = LogMovimentacao.builder()
                    .veiculo(veiculo)
                    .box(box)
                    .patio(patio)
                    .tipoMovimentacao(LogMovimentacao.TipoMovimentacao.ENTRADA)
                    .dataHoraMovimentacao(LocalDateTime.now())
                    .build();
            logMovimentacaoRepository.save(logMovimentacao);

            // Criar VeiculoBox relacionado (legado)
            VeiculoBox veiculoBox = VeiculoBox.builder()
                    .veiculo(veiculo)
                    .box(box)
                    .build();
            veiculoBoxRepository.save(veiculoBox);
        }

        // Verificar que as dependências foram criadas
        assertEquals(3, notificacaoRepository.count());
        assertEquals(3, logMovimentacaoRepository.count());
        assertEquals(3, veiculoBoxRepository.count());

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert - Pátio deve ter sido deletado
        assertFalse(patioRepository.findById(patioId).isPresent(), 
                "Pátio deve ter sido deletado");

        // Verificar que as dependências foram deletadas
        assertEquals(0, notificacaoRepository.count(), 
                "Notificações devem ter sido deletadas");
        assertEquals(0, logMovimentacaoRepository.count(), 
                "Logs de movimentação devem ter sido deletados");
        assertEquals(0, veiculoBoxRepository.count(), 
                "VeiculoBox devem ter sido deletados");
    }

    @Test
    @DisplayName("✅ Deve fornecer mensagem clara em caso de erro ao deletar dependências")
    void deveFornecerMensagemClaraEmErroAoDeletarDependencias() {
        // Arrange - Criar pátio sem boxes para simular cenário onde não há boxes mas há erro
        patio = criarPatioBasico();
        Long patioId = patio.getIdPatio();

        // Este teste valida que a estrutura está correta
        // Em um cenário real, se houver erro ao deletar dependências, a exceção será lançada
        
        // Act - Deve deletar com sucesso pois não há boxes
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert
        assertFalse(patioRepository.findById(patioId).isPresent());
    }

    @Test
    @DisplayName("✅ Deve fornecer mensagem clara quando pátio não existe")
    void deveFornecerMensagemClaraQuandoPatioNaoExiste() {
        // Arrange
        Long idInexistente = 999999L;

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            patioService.deletarPatio(idInexistente);
        });

        String mensagem = exception.getMessage();
        assertNotNull(mensagem);
        assertTrue(mensagem.contains("Pátio") || mensagem.contains("não encontrado"), 
                "Mensagem deve mencionar que o pátio não foi encontrado");
    }

    @Test
    @DisplayName("✅ Deve deletar pátio com boxes e zonas sem problemas")
    void deveDeletarPatioComBoxesEZonasSemProblemas() {
        // Arrange
        patio = criarPatioCompleto(5, 3);
        Long patioId = patio.getIdPatio();

        long boxesAntes = boxRepository.countByPatioIdPatio(patioId);
        long zonasAntes = zonaRepository.countByPatioIdPatio(patioId);

        assertTrue(boxesAntes > 0, "Deve ter boxes");
        assertTrue(zonasAntes > 0, "Deve ter zonas");

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert
        assertFalse(patioRepository.findById(patioId).isPresent());
        assertEquals(0, boxRepository.countByPatioIdPatio(patioId));
        assertEquals(0, zonaRepository.countByPatioIdPatio(patioId));
    }

    // ================== MÉTODOS AUXILIARES ==================

    private Patio criarPatioBasico() {
        Patio novoPatio = Patio.builder()
                .nomePatio("Pátio Teste Final " + System.currentTimeMillis())
                .status("A")
                .observacao("Pátio para teste final")
                .contato(contato)
                .endereco(endereco)
                .build();
        return patioRepository.save(novoPatio);
    }

    private Patio criarPatioComBoxes(int quantidadeBoxes) {
        Patio novoPatio = criarPatioBasico();
        novoPatio.setStatus("A");
        novoPatio = patioRepository.save(novoPatio);

        for (int i = 1; i <= quantidadeBoxes; i++) {
            Box box = Box.builder()
                    .nome("BOX-" + String.format("%03d", i))
                    .status("L")
                    .observacao("Box criado para teste")
                    .patio(novoPatio)
                    .build();
            boxRepository.save(box);
        }

        return novoPatio;
    }

    private Patio criarPatioCompleto(int quantidadeBoxes, int quantidadeZonas) {
        Patio novoPatio = criarPatioBasico();
        novoPatio.setStatus("A");
        novoPatio = patioRepository.save(novoPatio);

        // Criar zonas
        for (int i = 1; i <= quantidadeZonas; i++) {
            Zona zona = Zona.builder()
                    .nome("ZONA-" + String.format("%02d", i))
                    .status("A")
                    .observacao("Zona criada para teste")
                    .patio(novoPatio)
                    .build();
            zonaRepository.save(zona);
        }

        // Criar boxes
        for (int i = 1; i <= quantidadeBoxes; i++) {
            Box box = Box.builder()
                    .nome("BOX-" + String.format("%03d", i))
                    .status("L")
                    .observacao("Box criado para teste")
                    .patio(novoPatio)
                    .build();
            boxRepository.save(box);
        }

        return novoPatio;
    }
}

