package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.relatorio.*;
import br.com.fiap.mottu.mapper.LogMovimentacaoMapper;
import br.com.fiap.mottu.model.*;
import br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    @Mock
    private LogMovimentacaoRepository logRepository;

    @Mock
    private PatioRepository patioRepository;

    @Mock
    private BoxRepository boxRepository;

    @Mock
    private LogMovimentacaoMapper mapper;

    @InjectMocks
    private RelatorioService relatorioService;

    private Patio patio;
    private Box box1, box2, box3;
    private LogMovimentacao logMovimentacao;

    @BeforeEach
    void setUp() {
        // Setup Patio
        patio = Patio.builder()
                .idPatio(1L)
                .nomePatio("Patio Teste")
                .status("A")
                .build();

        // Setup Boxes
        box1 = Box.builder()
                .idBox(1L)
                .nome("BOX001")
                .status("O")
                .patio(patio)
                .build();

        box2 = Box.builder()
                .idBox(2L)
                .nome("BOX002")
                .status("L")
                .patio(patio)
                .build();

        box3 = Box.builder()
                .idBox(3L)
                .nome("BOX003")
                .status("O")
                .patio(patio)
                .build();

        // Setup LogMovimentacao
        logMovimentacao = LogMovimentacao.builder()
                .idLogMovimentacao(1L)
                .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                .dataHoraMovimentacao(LocalDateTime.now())
                .tempoEstacionamentoMinutos(120L)
                .patio(patio) // Adicionar o pátio para evitar NullPointerException
                .veiculo(Veiculo.builder().idVeiculo(1L).placa("ABC123").build())
                .box(box1) // Adicionar o box
                .build();
    }

    @Test
    void getOcupacaoAtual_DeveRetornarListaDeOcupacaoAtual() {
        // Arrange
        List<Patio> patios = Arrays.asList(patio);
        List<br.com.fiap.mottu.model.Box> boxes = Arrays.asList(box1, box2, box3);
        
        OcupacaoAtualDto ocupacaoDto = OcupacaoAtualDto.builder()
                .patioId(1L)
                .nomePatio("Patio Teste")
                .totalBoxes(3)
                .boxesOcupados(2)
                .boxesLivres(1)
                .taxaOcupacao(66.67)
                .build();

        when(patioRepository.findAll()).thenReturn(patios);
        when(boxRepository.findByPatioIdPatio(1L)).thenReturn(boxes);
        when(mapper.toOcupacaoAtualDto(patio, 3, 2)).thenReturn(ocupacaoDto);

        // Act
        List<OcupacaoAtualDto> resultado = relatorioService.getOcupacaoAtual();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(1L, resultado.get(0).getPatioId());
        assertEquals("Patio Teste", resultado.get(0).getNomePatio());
        assertEquals(3, resultado.get(0).getTotalBoxes());
        assertEquals(2, resultado.get(0).getBoxesOcupados());
        assertEquals(1, resultado.get(0).getBoxesLivres());
        assertEquals(66.67, resultado.get(0).getTaxaOcupacao(), 0.01);

        verify(patioRepository).findAll();
        verify(boxRepository).findByPatioIdPatio(1L);
        verify(mapper).toOcupacaoAtualDto(patio, 3, 2);
    }

    @Test
    void getOcupacaoAtualPorPatio_DeveRetornarOcupacaoDoPatio() {
        // Arrange
        List<br.com.fiap.mottu.model.Box> boxes = Arrays.asList(box1, box2, box3);
        
        OcupacaoAtualDto ocupacaoDto = OcupacaoAtualDto.builder()
                .patioId(1L)
                .nomePatio("Patio Teste")
                .totalBoxes(3)
                .boxesOcupados(2)
                .boxesLivres(1)
                .taxaOcupacao(66.67)
                .build();

        when(patioRepository.findById(1L)).thenReturn(Optional.of(patio));
        when(boxRepository.findByPatioIdPatio(1L)).thenReturn(boxes);
        when(mapper.toOcupacaoAtualDto(patio, 3, 2)).thenReturn(ocupacaoDto);

        // Act
        OcupacaoAtualDto resultado = relatorioService.getOcupacaoAtualPorPatio(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getPatioId());
        assertEquals("Patio Teste", resultado.getNomePatio());
        assertEquals(3, resultado.getTotalBoxes());
        assertEquals(2, resultado.getBoxesOcupados());

        verify(patioRepository).findById(1L);
        verify(boxRepository).findByPatioIdPatio(1L);
        verify(mapper).toOcupacaoAtualDto(patio, 3, 2);
    }

    @Test
    void getOcupacaoAtualPorPatio_PatioNaoEncontrado_DeveLancarExcecao() {
        // Arrange
        when(patioRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            relatorioService.getOcupacaoAtualPorPatio(999L);
        });

        assertEquals("Pátio não encontrado com ID: 999", exception.getMessage());
        verify(patioRepository).findById(999L);
        verify(boxRepository, never()).findByPatioIdPatio(any());
    }

    @Test
    void getMovimentacaoDiaria_DeveRetornarMovimentacaoPorPeriodo() {
        // Arrange
        LocalDate dataInicio = LocalDate.of(2024, 1, 1);
        LocalDate dataFim = LocalDate.of(2024, 1, 2);
        
        List<LogMovimentacao> movimentacoes = Arrays.asList(logMovimentacao);
        
        MovimentacaoDetalhadaDto detalheDto = MovimentacaoDetalhadaDto.builder()
                .idMovimentacao(1L)
                .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                .build();
        
        MovimentacaoDiariaDto movimentacaoDto = MovimentacaoDiariaDto.builder()
                .data(dataInicio)
                .entradas(1)
                .saidas(0)
                .totalMovimentacoes(1)
                .tempoMedioEstacionamento(120.0)
                .movimentacoesDetalhadas(Arrays.asList(detalheDto))
                .build();

        when(logRepository.countByTipoMovimentacaoAndPeriodo(eq(TipoMovimentacao.ENTRADA), any(), any()))
                .thenReturn(1L);
        when(logRepository.countByTipoMovimentacaoAndPeriodo(eq(TipoMovimentacao.SAIDA), any(), any()))
                .thenReturn(0L);
        when(logRepository.findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(any(), any()))
                .thenReturn(movimentacoes);
        when(mapper.toMovimentacaoDetalhadaDtoList(movimentacoes))
                .thenReturn(Arrays.asList(detalheDto));
        when(mapper.toMovimentacaoDiariaDto(eq(dataInicio), eq(1), eq(0), anyDouble(), anyString(), anyString(), anyList()))
                .thenReturn(movimentacaoDto);

        // Act
        List<MovimentacaoDiariaDto> resultado = relatorioService.getMovimentacaoDiaria(dataInicio, dataFim);

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size()); // 2 dias
        assertEquals(dataInicio, resultado.get(0).getData());
        assertEquals(1, resultado.get(0).getEntradas());
        assertEquals(0, resultado.get(0).getSaidas());

        verify(logRepository, atLeast(4)).countByTipoMovimentacaoAndPeriodo(any(), any(), any());
        verify(logRepository, atLeast(2)).findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(any(), any());
    }

    @Test
    void getPerformancePatios_DeveRetornarPerformanceDosPatios() {
        // Arrange
        List<Patio> patios = Arrays.asList(patio);
        List<br.com.fiap.mottu.model.Box> boxes = Arrays.asList(box1, box2, box3);
        
        TopBoxDto topBoxDto = TopBoxDto.builder()
                .boxId(1L)
                .nomeBox("BOX001")
                .totalUtilizacoes(10L)
                .build();
        
        TopVeiculoDto topVeiculoDto = TopVeiculoDto.builder()
                .veiculoId(1L)
                .placa("ABC123")
                .totalUtilizacoes(5L)
                .build();
        
        PerformancePatioDto performanceDto = PerformancePatioDto.builder()
                .patioId(1L)
                .nomePatio("Patio Teste")
                .taxaOcupacaoMedia(66.67)
                .tempoMedioEstacionamento(120.0)
                .totalMovimentacoes(100L)
                .totalEntradas(50L)
                .totalSaidas(50L)
                .totalBoxes(3)
                .topBoxes(Arrays.asList(topBoxDto))
                .topVeiculos(Arrays.asList(topVeiculoDto))
                .build();

        when(patioRepository.findAll()).thenReturn(patios);
        when(boxRepository.findByPatioIdPatio(1L)).thenReturn(boxes);
        when(logRepository.findTempoMedioEstacionamentoPorPatio(1L)).thenReturn(120.0);
        when(logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(eq(1L), eq(TipoMovimentacao.ENTRADA), any(), any()))
                .thenReturn(50L);
        when(logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(eq(1L), eq(TipoMovimentacao.SAIDA), any(), any()))
                .thenReturn(50L);
        List<Object[]> boxDataList = new ArrayList<>();
        boxDataList.add(new Object[]{1L, "BOX001", 10L});
        when(logRepository.findTopBoxesUtilizados(any())).thenReturn(boxDataList);
        List<Object[]> veiculoDataList = new ArrayList<>();
        veiculoDataList.add(new Object[]{1L, "ABC123", 5L});
        when(logRepository.findTopVeiculosFrequentes(any())).thenReturn(veiculoDataList);
        when(mapper.toTopBoxDto(any(), anyLong())).thenReturn(topBoxDto);
        when(mapper.toTopVeiculoDto(any())).thenReturn(topVeiculoDto);
        when(mapper.toPerformancePatioDto(eq(patio), anyDouble(), anyDouble(), anyLong(), anyLong(), anyLong(), eq(3), anyList(), anyList()))
                .thenReturn(performanceDto);

        // Act
        List<PerformancePatioDto> resultado = relatorioService.getPerformancePatios();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(1L, resultado.get(0).getPatioId());
        assertEquals("Patio Teste", resultado.get(0).getNomePatio());
        assertEquals(66.67, resultado.get(0).getTaxaOcupacaoMedia());
        assertEquals(120.0, resultado.get(0).getTempoMedioEstacionamento());

        verify(patioRepository).findAll();
        verify(boxRepository, atLeast(1)).findByPatioIdPatio(1L); // Pode ser chamado múltiplas vezes
        verify(logRepository).findTempoMedioEstacionamentoPorPatio(1L);
    }

    @Test
    void getTendenciasOcupacao_DeveRetornarTendencias() {
        // Arrange
        TendenciaOcupacaoDto tendenciaDto = TendenciaOcupacaoDto.builder()
                .periodoAnalisado("Últimos 30 dias")
                .tendenciaGeral(TendenciaOcupacaoDto.TendenciaGeral.ESTAVEL)
                .ocupacaoMedia(70.0)
                .ocupacaoMaxima(90.0)
                .ocupacaoMinima(50.0)
                .build();

        when(patioRepository.findAll()).thenReturn(Arrays.asList(patio));
        when(boxRepository.findByPatioIdPatio(1L)).thenReturn(Arrays.asList(box1, box2, box3));
        when(mapper.toOcupacaoAtualDto(any(), anyInt(), anyInt()))
                .thenReturn(OcupacaoAtualDto.builder()
                        .patioId(1L)
                        .taxaOcupacao(70.0)
                        .build());
        when(mapper.toTendenciaOcupacaoDto(anyString(), anyDouble(), anyDouble(), anyDouble(), anyInt(), anyInt(), any(), anyDouble()))
                .thenReturn(tendenciaDto);

        // Act
        TendenciaOcupacaoDto resultado = relatorioService.getTendenciasOcupacao();

        // Assert
        assertNotNull(resultado);
        assertEquals("Últimos 30 dias", resultado.getPeriodoAnalisado());
        assertEquals(TendenciaOcupacaoDto.TendenciaGeral.ESTAVEL, resultado.getTendenciaGeral());
        assertEquals(70.0, resultado.getOcupacaoMedia());

        verify(patioRepository).findAll();
        verify(mapper).toTendenciaOcupacaoDto(anyString(), anyDouble(), anyDouble(), anyDouble(), anyInt(), anyInt(), any(), anyDouble());
    }
}

