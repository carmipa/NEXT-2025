package br.com.fiap.mottu.service;

import br.com.fiap.mottu.model.*;
import br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogMovimentacaoServiceTest {

    @Mock
    private LogMovimentacaoRepository logRepository;

    @Mock
    private VeiculoRepository veiculoRepository;

    @Mock
    private BoxRepository boxRepository;

    @Mock
    private PatioRepository patioRepository;

    @InjectMocks
    private LogMovimentacaoService logMovimentacaoService;

    private Veiculo veiculo;
    private Box box;
    private Patio patio;
    private LogMovimentacao logMovimentacao;

    @BeforeEach
    void setUp() {
        // Setup Veiculo
        veiculo = Veiculo.builder()
                .idVeiculo(1L)
                .placa("ABC123")
                .modelo("CG 160")
                .fabricante("Honda")
                .build();

        // Setup Patio
        patio = Patio.builder()
                .idPatio(1L)
                .nomePatio("Patio Teste")
                .status("A")
                .build();

        // Setup Box
        box = Box.builder()
                .idBox(1L)
                .nome("BOX001")
                .status("L")
                .patio(patio)
                .build();

        // Setup LogMovimentacao
        logMovimentacao = LogMovimentacao.builder()
                .idLogMovimentacao(1L)
                .veiculo(veiculo)
                .box(box)
                .patio(patio)
                .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                .dataHoraMovimentacao(LocalDateTime.now())
                .observacoes("Teste")
                .build();
    }

    @Test
    void registrarEntrada_DeveRegistrarEntradaComSucesso() {
        // Arrange
        LogMovimentacao logSalvo = LogMovimentacao.builder()
                .idLogMovimentacao(1L)
                .veiculo(veiculo)
                .box(box)
                .patio(patio)
                .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                .dataHoraMovimentacao(LocalDateTime.now())
                .build();

        when(logRepository.save(any(LogMovimentacao.class))).thenReturn(logSalvo);

        // Act
        LogMovimentacao resultado = logMovimentacaoService.registrarEntrada(veiculo, box);

        // Assert
        assertNotNull(resultado);
        assertEquals(TipoMovimentacao.ENTRADA, resultado.getTipoMovimentacao());
        assertEquals(veiculo.getIdVeiculo(), resultado.getVeiculo().getIdVeiculo());
        assertEquals(box.getIdBox(), resultado.getBox().getIdBox());
        assertEquals(patio.getIdPatio(), resultado.getPatio().getIdPatio());

        verify(logRepository).save(any(LogMovimentacao.class));
    }

    @Test
    void registrarEntrada_BoxSemPatio_DeveLancarExcecao() {
        // Arrange
        Box boxSemPatio = Box.builder()
                .idBox(2L)
                .nome("BOX002")
                .status("L")
                .patio(null) // Sem pátio
                .build();

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            logMovimentacaoService.registrarEntrada(veiculo, boxSemPatio);
        });

        verify(logRepository, never()).save(any(LogMovimentacao.class));
    }

    @Test
    void registrarSaida_DeveRegistrarSaidaComSucesso() {
        // Arrange
        LogMovimentacao entrada = LogMovimentacao.builder()
                .idLogMovimentacao(1L)
                .veiculo(veiculo)
                .box(box)
                .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                .dataHoraMovimentacao(LocalDateTime.now().minusHours(2))
                .build();

        LogMovimentacao saidaSalva = LogMovimentacao.builder()
                .idLogMovimentacao(2L)
                .veiculo(veiculo)
                .box(box)
                .patio(patio)
                .tipoMovimentacao(TipoMovimentacao.SAIDA)
                .dataHoraMovimentacao(LocalDateTime.now())
                .tempoEstacionamentoMinutos(120L)
                .build();

        when(logRepository.findByVeiculoIdVeiculoAndBoxIdBoxAndTipoMovimentacaoOrderByDataHoraMovimentacaoDesc(
                veiculo.getIdVeiculo(), box.getIdBox(), TipoMovimentacao.ENTRADA))
                .thenReturn(Optional.of(entrada));
        when(logRepository.save(any(LogMovimentacao.class))).thenReturn(saidaSalva);

        // Act
        LogMovimentacao resultado = logMovimentacaoService.registrarSaida(veiculo, box);

        // Assert
        assertNotNull(resultado);
        assertEquals(TipoMovimentacao.SAIDA, resultado.getTipoMovimentacao());
        assertEquals(veiculo.getIdVeiculo(), resultado.getVeiculo().getIdVeiculo());
        assertEquals(box.getIdBox(), resultado.getBox().getIdBox());
        assertEquals(120L, resultado.getTempoEstacionamentoMinutos());

        verify(logRepository).findByVeiculoIdVeiculoAndBoxIdBoxAndTipoMovimentacaoOrderByDataHoraMovimentacaoDesc(
                veiculo.getIdVeiculo(), box.getIdBox(), TipoMovimentacao.ENTRADA);
        verify(logRepository).save(any(LogMovimentacao.class));
    }

    @Test
    void registrarSaida_BoxSemPatio_DeveLancarExcecao() {
        // Arrange
        Box boxSemPatio = Box.builder()
                .idBox(2L)
                .nome("BOX002")
                .status("L")
                .patio(null) // Sem pátio
                .build();

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            logMovimentacaoService.registrarSaida(veiculo, boxSemPatio);
        });

        verify(logRepository, never()).save(any(LogMovimentacao.class));
    }

    @Test
    void getHistoricoMovimentacao_DeveRetornarHistoricoDoVeiculo() {
        // Arrange
        List<LogMovimentacao> historico = Arrays.asList(logMovimentacao);
        when(logRepository.findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(veiculo.getIdVeiculo()))
                .thenReturn(historico);

        // Act
        List<LogMovimentacao> resultado = logMovimentacaoService.getHistoricoMovimentacao(veiculo);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(logMovimentacao.getIdLogMovimentacao(), resultado.get(0).getIdLogMovimentacao());

        verify(logRepository).findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(veiculo.getIdVeiculo());
    }

    @Test
    void getHistoricoMovimentacao_ComIdVeiculo_DeveRetornarHistorico() {
        // Arrange
        List<LogMovimentacao> historico = Arrays.asList(logMovimentacao);
        when(logRepository.findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(1L))
                .thenReturn(historico);

        // Act
        List<LogMovimentacao> resultado = logMovimentacaoService.getHistoricoMovimentacao(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(logMovimentacao.getIdLogMovimentacao(), resultado.get(0).getIdLogMovimentacao());

        verify(logRepository).findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(1L);
    }

    @Test
    void getMovimentacoesPorPeriodo_DeveRetornarMovimentacoesDoPeriodo() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        List<LogMovimentacao> movimentacoes = Arrays.asList(logMovimentacao);

        when(logRepository.findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(inicio, fim))
                .thenReturn(movimentacoes);

        // Act
        List<LogMovimentacao> resultado = logMovimentacaoService.getMovimentacoesPorPeriodo(inicio, fim);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(logMovimentacao.getIdLogMovimentacao(), resultado.get(0).getIdLogMovimentacao());

        verify(logRepository).findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(inicio, fim);
    }

    @Test
    void getMovimentacoesPorPatioEPeriodo_DeveRetornarMovimentacoesDoPatio() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        List<LogMovimentacao> movimentacoes = Arrays.asList(logMovimentacao);

        when(logRepository.findByPatioIdPatioAndDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(1L, inicio, fim))
                .thenReturn(movimentacoes);

        // Act
        List<LogMovimentacao> resultado = logMovimentacaoService.getMovimentacoesPorPatioEPeriodo(1L, inicio, fim);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(logMovimentacao.getIdLogMovimentacao(), resultado.get(0).getIdLogMovimentacao());

        verify(logRepository).findByPatioIdPatioAndDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(1L, inicio, fim);
    }

    @Test
    void contarMovimentacoesPorTipo_DeveRetornarContagem() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        when(logRepository.countByTipoMovimentacaoAndPeriodo(TipoMovimentacao.ENTRADA, inicio, fim))
                .thenReturn(5L);

        // Act
        Long resultado = logMovimentacaoService.contarMovimentacoesPorTipo(TipoMovimentacao.ENTRADA, inicio, fim);

        // Assert
        assertEquals(5L, resultado);
        verify(logRepository).countByTipoMovimentacaoAndPeriodo(TipoMovimentacao.ENTRADA, inicio, fim);
    }

    @Test
    void contarMovimentacoesPorPatioETipo_DeveRetornarContagem() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        when(logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(1L, TipoMovimentacao.ENTRADA, inicio, fim))
                .thenReturn(3L);

        // Act
        Long resultado = logMovimentacaoService.contarMovimentacoesPorPatioETipo(1L, TipoMovimentacao.ENTRADA, inicio, fim);

        // Assert
        assertEquals(3L, resultado);
        verify(logRepository).countByPatioAndTipoMovimentacaoAndPeriodo(1L, TipoMovimentacao.ENTRADA, inicio, fim);
    }

    @Test
    void getTempoMedioEstacionamentoPorPatio_DeveRetornarTempoMedio() {
        // Arrange
        when(logRepository.findTempoMedioEstacionamentoPorPatio(1L)).thenReturn(120.5);

        // Act
        Double resultado = logMovimentacaoService.getTempoMedioEstacionamentoPorPatio(1L);

        // Assert
        assertEquals(120.5, resultado);
        verify(logRepository).findTempoMedioEstacionamentoPorPatio(1L);
    }

    @Test
    void getTempoMedioEstacionamentoGlobal_DeveRetornarTempoMedioGlobal() {
        // Arrange
        when(logRepository.findTempoMedioEstacionamentoGlobal()).thenReturn(150.0);

        // Act
        Double resultado = logMovimentacaoService.getTempoMedioEstacionamentoGlobal();

        // Assert
        assertEquals(150.0, resultado);
        verify(logRepository).findTempoMedioEstacionamentoGlobal();
    }

    @Test
    void getTopBoxesUtilizados_DeveRetornarTopBoxes() {
        // Arrange
        List<Object[]> topBoxes = Arrays.asList(
                new Object[]{1L, "BOX001", 10L},
                new Object[]{2L, "BOX002", 8L}
        );
        when(logRepository.findTopBoxesUtilizados(any())).thenReturn(topBoxes);

        // Act
        List<Object[]> resultado = logMovimentacaoService.getTopBoxesUtilizados(5);

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals(1L, resultado.get(0)[0]);
        assertEquals("BOX001", resultado.get(0)[1]);
        assertEquals(10L, resultado.get(0)[2]);

        verify(logRepository).findTopBoxesUtilizados(any());
    }

    @Test
    void getTopVeiculosFrequentes_DeveRetornarTopVeiculos() {
        // Arrange
        List<Object[]> topVeiculos = Arrays.asList(
                new Object[]{1L, "ABC123", 15L},
                new Object[]{2L, "DEF456", 12L}
        );
        when(logRepository.findTopVeiculosFrequentes(any())).thenReturn(topVeiculos);

        // Act
        List<Object[]> resultado = logMovimentacaoService.getTopVeiculosFrequentes(5);

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals(1L, resultado.get(0)[0]);
        assertEquals("ABC123", resultado.get(0)[1]);
        assertEquals(15L, resultado.get(0)[2]);

        verify(logRepository).findTopVeiculosFrequentes(any());
    }
}

