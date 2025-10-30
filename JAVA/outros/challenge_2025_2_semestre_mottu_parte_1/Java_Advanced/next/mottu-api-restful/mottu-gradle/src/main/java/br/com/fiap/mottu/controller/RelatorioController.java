package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.relatorio.*;
import br.com.fiap.mottu.service.LogMovimentacaoService;
import br.com.fiap.mottu.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
@Tag(name = "Relatórios", description = "Sistema de Relatórios e Analytics do MOTTU")
public class RelatorioController {

    private static final Logger log = LoggerFactory.getLogger(RelatorioController.class);

    private final RelatorioService relatorioService;
    private final LogMovimentacaoService logMovimentacaoService;

    public RelatorioController(RelatorioService relatorioService, LogMovimentacaoService logMovimentacaoService) {
        this.relatorioService = relatorioService;
        this.logMovimentacaoService = logMovimentacaoService;
    }

    // ==================== OCUPAÇÃO ====================

    @Operation(
            summary = "Obter ocupação atual de todos os pátios",
            description = "Retorna a ocupação atual de todos os pátios do sistema, incluindo taxa de ocupação, boxes ocupados e livres."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Ocupação atual obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OcupacaoAtualDto.class))
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/ocupacao/atual")
    public ResponseEntity<List<OcupacaoAtualDto>> getOcupacaoAtual() {
        log.info("Solicitação de ocupação atual recebida");
        List<OcupacaoAtualDto> ocupacao = relatorioService.getOcupacaoAtual();
        log.info("Ocupação atual retornada com sucesso. {} pátios", ocupacao.size());
        return ResponseEntity.ok(ocupacao);
    }

    @Operation(
            summary = "Obter ocupação atual de um pátio específico",
            description = "Retorna a ocupação atual de um pátio específico pelo ID."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Ocupação do pátio obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OcupacaoAtualDto.class))
            ),
            @ApiResponse(responseCode = "404", description = "Pátio não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/ocupacao/atual/patio/{patioId}")
    public ResponseEntity<OcupacaoAtualDto> getOcupacaoAtualPorPatio(
            @Parameter(description = "ID do pátio", required = true, example = "1")
            @PathVariable Long patioId) {
        log.info("Solicitação de ocupação do pátio {} recebida", patioId);
        OcupacaoAtualDto ocupacao = relatorioService.getOcupacaoAtualPorPatio(patioId);
        log.info("Ocupação do pátio {} retornada com sucesso", patioId);
        return ResponseEntity.ok(ocupacao);
    }

    // ==================== MOVIMENTAÇÃO ====================

    @Operation(
            summary = "Obter movimentação diária por período",
            description = "Retorna a movimentação diária (entradas e saídas) de veículos em um período específico."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Movimentação diária obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = MovimentacaoDiariaDto.class))
            ),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/movimentacao/diaria")
    public ResponseEntity<List<MovimentacaoDiariaDto>> getMovimentacaoDiaria(
            @Parameter(description = "Data de início (formato: yyyy-MM-dd)", example = "2024-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data de fim (formato: yyyy-MM-dd)", example = "2024-01-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        
        log.info("Solicitação de movimentação diária entre {} e {} recebida", dataInicio, dataFim);
        
        if (dataInicio.isAfter(dataFim)) {
            log.warn("Data de início posterior à data de fim");
            return ResponseEntity.badRequest().build();
        }
        
        List<MovimentacaoDiariaDto> movimentacao = relatorioService.getMovimentacaoDiaria(dataInicio, dataFim);
        log.info("Movimentação diária retornada com sucesso. {} dias analisados", movimentacao.size());
        return ResponseEntity.ok(movimentacao);
    }

    @Operation(
            summary = "Obter histórico de movimentações de um veículo",
            description = "Retorna o histórico completo de movimentações de um veículo específico."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Histórico de movimentações obtido com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = MovimentacaoDetalhadaDto.class))
            ),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/movimentacao/historico/veiculo/{veiculoId}")
    public ResponseEntity<List<br.com.fiap.mottu.model.LogMovimentacao>> getHistoricoMovimentacaoVeiculo(
            @Parameter(description = "ID do veículo", required = true, example = "1")
            @PathVariable Long veiculoId) {
        
        log.info("Solicitação de histórico de movimentações do veículo {} recebida", veiculoId);
        List<br.com.fiap.mottu.model.LogMovimentacao> historico = logMovimentacaoService.getHistoricoMovimentacao(veiculoId);
        log.info("Histórico de movimentações do veículo {} retornado com sucesso. {} registros", veiculoId, historico.size());
        return ResponseEntity.ok(historico);
    }

    // ==================== PERFORMANCE ====================

    @Operation(
            summary = "Obter performance de todos os pátios",
            description = "Retorna métricas de performance de todos os pátios, incluindo taxa de ocupação média, tempo médio de estacionamento e rankings."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Performance dos pátios obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PerformancePatioDto.class))
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/performance/patios")
    public ResponseEntity<List<PerformancePatioDto>> getPerformancePatios() {
        log.info("Solicitação de performance dos pátios recebida");
        List<PerformancePatioDto> performance = relatorioService.getPerformancePatios();
        log.info("Performance dos pátios retornada com sucesso. {} pátios analisados", performance.size());
        return ResponseEntity.ok(performance);
    }

    @Operation(
            summary = "Obter performance de um pátio específico",
            description = "Retorna métricas de performance de um pátio específico."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Performance do pátio obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PerformancePatioDto.class))
            ),
            @ApiResponse(responseCode = "404", description = "Pátio não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/performance/patio/{patioId}")
    public ResponseEntity<PerformancePatioDto> getPerformancePatio(
            @Parameter(description = "ID do pátio", required = true, example = "1")
            @PathVariable Long patioId) {
        
        log.info("Solicitação de performance do pátio {} recebida", patioId);
        
        List<PerformancePatioDto> performancePatios = relatorioService.getPerformancePatios();
        PerformancePatioDto performance = performancePatios.stream()
                .filter(p -> p.getPatioId().equals(patioId))
                .findFirst()
                .orElse(null);
        
        if (performance == null) {
            log.warn("Performance do pátio {} não encontrada", patioId);
            return ResponseEntity.notFound().build();
        }
        
        log.info("Performance do pátio {} retornada com sucesso", patioId);
        return ResponseEntity.ok(performance);
    }

    // ==================== ANALYTICS ====================

    @Operation(
            summary = "Obter tendências de ocupação",
            description = "Retorna análise de tendências de ocupação do sistema, incluindo horários de pico e performance por pátio."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Tendências de ocupação obtidas com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TendenciaOcupacaoDto.class))
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/analytics/tendencias")
    public ResponseEntity<TendenciaOcupacaoDto> getTendenciasOcupacao() {
        log.info("Solicitação de tendências de ocupação recebida");
        TendenciaOcupacaoDto tendencias = relatorioService.getTendenciasOcupacao();
        log.info("Tendências de ocupação retornadas com sucesso");
        return ResponseEntity.ok(tendencias);
    }

    @Operation(
            summary = "Obter estatísticas gerais do sistema",
            description = "Retorna estatísticas gerais do sistema, incluindo tempo médio de estacionamento e totais."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estatísticas obtidas com sucesso"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/analytics/estatisticas")
    public ResponseEntity<java.util.Map<String, Object>> getEstatisticasGerais() {
        log.info("Solicitação de estatísticas gerais recebida");
        
        Double tempoMedioGlobal = logMovimentacaoService.getTempoMedioEstacionamentoGlobal();
        List<Object[]> topBoxes = logMovimentacaoService.getTopBoxesUtilizados(5);
        List<Object[]> topVeiculos = logMovimentacaoService.getTopVeiculosFrequentes(5);
        
        java.util.Map<String, Object> estatisticas = new java.util.HashMap<>();
        estatisticas.put("tempoMedioEstacionamentoMinutos", tempoMedioGlobal);
        estatisticas.put("topBoxesUtilizados", topBoxes);
        estatisticas.put("topVeiculosFrequentes", topVeiculos);
        estatisticas.put("dataAtualizacao", java.time.LocalDateTime.now());
        
        log.info("Estatísticas gerais retornadas com sucesso");
        return ResponseEntity.ok(estatisticas);
    }

    // ==================== MÉTRICAS ESPECÍFICAS ====================

    @Operation(
            summary = "Obter tempo médio de estacionamento por pátio",
            description = "Retorna o tempo médio de estacionamento de um pátio específico."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tempo médio obtido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pátio não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/metricas/tempo-medio-estacionamento/patio/{patioId}")
    public ResponseEntity<java.util.Map<String, Object>> getTempoMedioEstacionamentoPatio(
            @Parameter(description = "ID do pátio", required = true, example = "1")
            @PathVariable Long patioId) {
        
        log.info("Solicitação de tempo médio de estacionamento do pátio {} recebida", patioId);
        
        Double tempoMedio = logMovimentacaoService.getTempoMedioEstacionamentoPorPatio(patioId);
        
        java.util.Map<String, Object> resultado = new java.util.HashMap<>();
        resultado.put("patioId", patioId);
        resultado.put("tempoMedioEstacionamentoMinutos", tempoMedio);
        resultado.put("dataCalculo", java.time.LocalDateTime.now());
        
        log.info("Tempo médio de estacionamento do pátio {} retornado com sucesso", patioId);
        return ResponseEntity.ok(resultado);
    }

    @Operation(
            summary = "Obter tempo médio de estacionamento global",
            description = "Retorna o tempo médio de estacionamento de todo o sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tempo médio global obtido com sucesso"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/metricas/tempo-medio-estacionamento/global")
    public ResponseEntity<java.util.Map<String, Object>> getTempoMedioEstacionamentoGlobal() {
        log.info("Solicitação de tempo médio de estacionamento global recebida");
        
        Double tempoMedio = logMovimentacaoService.getTempoMedioEstacionamentoGlobal();
        
        java.util.Map<String, Object> resultado = new java.util.HashMap<>();
        resultado.put("tempoMedioEstacionamentoMinutos", tempoMedio);
        resultado.put("dataCalculo", java.time.LocalDateTime.now());
        
        log.info("Tempo médio de estacionamento global retornado com sucesso");
        return ResponseEntity.ok(resultado);
    }
}

