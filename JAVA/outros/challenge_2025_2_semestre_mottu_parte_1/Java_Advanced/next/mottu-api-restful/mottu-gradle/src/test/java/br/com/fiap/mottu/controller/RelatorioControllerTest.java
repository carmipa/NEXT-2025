package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.relatorio.*;
import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.service.LogMovimentacaoService;
import br.com.fiap.mottu.service.RelatorioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = RelatorioController.class)
class RelatorioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RelatorioService relatorioService;

    @MockBean
    private LogMovimentacaoService logMovimentacaoService;

    @Autowired
    private ObjectMapper objectMapper;

    private OcupacaoAtualDto ocupacaoAtualDto;
    private MovimentacaoDiariaDto movimentacaoDiariaDto;
    private PerformancePatioDto performancePatioDto;
    private TendenciaOcupacaoDto tendenciaOcupacaoDto;

    @BeforeEach
    void setUp() {
        // Setup OcupacaoAtualDto
        ocupacaoAtualDto = OcupacaoAtualDto.builder()
                .patioId(1L)
                .nomePatio("Patio Teste")
                .totalBoxes(10)
                .boxesOcupados(7)
                .boxesLivres(3)
                .taxaOcupacao(70.0)
                .build();

        // Setup MovimentacaoDiariaDto
        movimentacaoDiariaDto = MovimentacaoDiariaDto.builder()
                .data(LocalDate.of(2024, 1, 15))
                .entradas(25)
                .saidas(23)
                .totalMovimentacoes(48)
                .tempoMedioEstacionamento(120.5)
                .patioMaisMovimentado("Patio Teste")
                .boxMaisUtilizado("BOX001")
                .build();

        // Setup PerformancePatioDto
        performancePatioDto = PerformancePatioDto.builder()
                .patioId(1L)
                .nomePatio("Patio Teste")
                .taxaOcupacaoMedia(75.5)
                .tempoMedioEstacionamento(145.2)
                .totalMovimentacoes(1250L)
                .totalEntradas(625L)
                .totalSaidas(625L)
                .totalBoxes(10)
                .build();

        // Setup TendenciaOcupacaoDto
        tendenciaOcupacaoDto = TendenciaOcupacaoDto.builder()
                .periodoAnalisado("Últimos 30 dias")
                .tendenciaGeral(TendenciaOcupacaoDto.TendenciaGeral.CRESCENTE)
                .ocupacaoMedia(72.5)
                .ocupacaoMaxima(95.0)
                .ocupacaoMinima(45.0)
                .diasAltaOcupacao(8)
                .diasBaixaOcupacao(3)
                .build();
    }

    @Test
    void getOcupacaoAtual_DeveRetornarOcupacaoAtual() throws Exception {
        // Arrange
        List<OcupacaoAtualDto> ocupacao = Arrays.asList(ocupacaoAtualDto);
        when(relatorioService.getOcupacaoAtual()).thenReturn(ocupacao);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/ocupacao/atual")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].patioId").value(1))
                .andExpect(jsonPath("$[0].nomePatio").value("Patio Teste"))
                .andExpect(jsonPath("$[0].totalBoxes").value(10))
                .andExpect(jsonPath("$[0].boxesOcupados").value(7))
                .andExpect(jsonPath("$[0].boxesLivres").value(3))
                .andExpect(jsonPath("$[0].taxaOcupacao").value(70.0));

        verify(relatorioService).getOcupacaoAtual();
    }

    @Test
    void getOcupacaoAtualPorPatio_DeveRetornarOcupacaoDoPatio() throws Exception {
        // Arrange
        when(relatorioService.getOcupacaoAtualPorPatio(1L)).thenReturn(ocupacaoAtualDto);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/ocupacao/atual/patio/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.patioId").value(1))
                .andExpect(jsonPath("$.nomePatio").value("Patio Teste"))
                .andExpect(jsonPath("$.totalBoxes").value(10))
                .andExpect(jsonPath("$.taxaOcupacao").value(70.0));

        verify(relatorioService).getOcupacaoAtualPorPatio(1L);
    }

    @Test
    void getMovimentacaoDiaria_DeveRetornarMovimentacaoDiaria() throws Exception {
        // Arrange
        List<MovimentacaoDiariaDto> movimentacao = Arrays.asList(movimentacaoDiariaDto);
        when(relatorioService.getMovimentacaoDiaria(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(movimentacao);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/movimentacao/diaria")
                        .param("dataInicio", "2024-01-01")
                        .param("dataFim", "2024-01-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].entradas").value(25))
                .andExpect(jsonPath("$[0].saidas").value(23))
                .andExpect(jsonPath("$[0].totalMovimentacoes").value(48))
                .andExpect(jsonPath("$[0].tempoMedioEstacionamento").value(120.5));

        verify(relatorioService).getMovimentacaoDiaria(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void getMovimentacaoDiaria_DataInicioPosteriorDataFim_DeveRetornarBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/relatorios/movimentacao/diaria")
                        .param("dataInicio", "2024-01-31")
                        .param("dataFim", "2024-01-01")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(relatorioService, never()).getMovimentacaoDiaria(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void getHistoricoMovimentacaoVeiculo_DeveRetornarHistorico() throws Exception {
        // Arrange
        List<LogMovimentacao> historico = Arrays.asList();
        when(logMovimentacaoService.getHistoricoMovimentacao(1L)).thenReturn(historico);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/movimentacao/historico/veiculo/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());

        verify(logMovimentacaoService).getHistoricoMovimentacao(1L);
    }

    @Test
    void getPerformancePatios_DeveRetornarPerformance() throws Exception {
        // Arrange
        List<PerformancePatioDto> performance = Arrays.asList(performancePatioDto);
        when(relatorioService.getPerformancePatios()).thenReturn(performance);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/performance/patios")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].patioId").value(1))
                .andExpect(jsonPath("$[0].nomePatio").value("Patio Teste"))
                .andExpect(jsonPath("$[0].taxaOcupacaoMedia").value(75.5))
                .andExpect(jsonPath("$[0].tempoMedioEstacionamento").value(145.2))
                .andExpect(jsonPath("$[0].totalMovimentacoes").value(1250));

        verify(relatorioService).getPerformancePatios();
    }

    @Test
    void getPerformancePatio_DeveRetornarPerformanceDoPatio() throws Exception {
        // Arrange
        List<PerformancePatioDto> performance = Arrays.asList(performancePatioDto);
        when(relatorioService.getPerformancePatios()).thenReturn(performance);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/performance/patio/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.patioId").value(1))
                .andExpect(jsonPath("$.nomePatio").value("Patio Teste"))
                .andExpect(jsonPath("$.taxaOcupacaoMedia").value(75.5));

        verify(relatorioService).getPerformancePatios();
    }

    @Test
    void getPerformancePatio_PatioNaoEncontrado_DeveRetornarNotFound() throws Exception {
        // Arrange
        when(relatorioService.getPerformancePatios()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/performance/patio/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(relatorioService).getPerformancePatios();
    }

    @Test
    void getTendenciasOcupacao_DeveRetornarTendencias() throws Exception {
        // Arrange
        when(relatorioService.getTendenciasOcupacao()).thenReturn(tendenciaOcupacaoDto);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/analytics/tendencias")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.periodoAnalisado").value("Últimos 30 dias"))
                .andExpect(jsonPath("$.tendenciaGeral").value("CRESCENTE"))
                .andExpect(jsonPath("$.ocupacaoMedia").value(72.5))
                .andExpect(jsonPath("$.ocupacaoMaxima").value(95.0))
                .andExpect(jsonPath("$.ocupacaoMinima").value(45.0))
                .andExpect(jsonPath("$.diasAltaOcupacao").value(8))
                .andExpect(jsonPath("$.diasBaixaOcupacao").value(3));

        verify(relatorioService).getTendenciasOcupacao();
    }

    @Test
    void getEstatisticasGerais_DeveRetornarEstatisticas() throws Exception {
        // Arrange
        when(logMovimentacaoService.getTempoMedioEstacionamentoGlobal()).thenReturn(150.0);
        when(logMovimentacaoService.getTopBoxesUtilizados(5)).thenReturn(Arrays.asList());
        when(logMovimentacaoService.getTopVeiculosFrequentes(5)).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/analytics/estatisticas")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.tempoMedioEstacionamentoMinutos").value(150.0))
                .andExpect(jsonPath("$.topBoxesUtilizados").isArray())
                .andExpect(jsonPath("$.topVeiculosFrequentes").isArray())
                .andExpect(jsonPath("$.dataAtualizacao").exists());

        verify(logMovimentacaoService).getTempoMedioEstacionamentoGlobal();
        verify(logMovimentacaoService).getTopBoxesUtilizados(5);
        verify(logMovimentacaoService).getTopVeiculosFrequentes(5);
    }

    @Test
    void getTempoMedioEstacionamentoPatio_DeveRetornarTempoMedio() throws Exception {
        // Arrange
        when(logMovimentacaoService.getTempoMedioEstacionamentoPorPatio(1L)).thenReturn(120.5);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/metricas/tempo-medio-estacionamento/patio/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.patioId").value(1))
                .andExpect(jsonPath("$.tempoMedioEstacionamentoMinutos").value(120.5))
                .andExpect(jsonPath("$.dataCalculo").exists());

        verify(logMovimentacaoService).getTempoMedioEstacionamentoPorPatio(1L);
    }

    @Test
    void getTempoMedioEstacionamentoGlobal_DeveRetornarTempoMedioGlobal() throws Exception {
        // Arrange
        when(logMovimentacaoService.getTempoMedioEstacionamentoGlobal()).thenReturn(150.0);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/metricas/tempo-medio-estacionamento/global")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.tempoMedioEstacionamentoMinutos").value(150.0))
                .andExpect(jsonPath("$.dataCalculo").exists());

        verify(logMovimentacaoService).getTempoMedioEstacionamentoGlobal();
    }
}

