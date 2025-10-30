package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.dto.relatorio.PerformancePatioDto;
import br.com.fiap.mottu.service.LogMovimentacaoService;
import br.com.fiap.mottu.service.relatorios.PerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios/performance")
@Tag(name = "Relatórios - Performance", description = "Relatórios de performance e métricas do sistema")
public class PerformanceController {

    private static final Logger log = LoggerFactory.getLogger(PerformanceController.class);
    private final PerformanceService performanceService;
    private final LogMovimentacaoService logMovimentacaoService;

    public PerformanceController(PerformanceService performanceService, LogMovimentacaoService logMovimentacaoService) {
        this.performanceService = performanceService;
        this.logMovimentacaoService = logMovimentacaoService;
    }

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
    @GetMapping("/patios")
    public ResponseEntity<List<PerformancePatioDto>> getPerformancePatios() {
        log.info("Solicitação de performance dos pátios recebida");
        List<PerformancePatioDto> performance = performanceService.getPerformancePatios();
        log.info("Performance dos pátios retornada com sucesso. {} pátios analisados", performance.size());
        return ResponseEntity.ok(performance);
    }

    @Operation(
            summary = "Obter performance de um pátio específico",
            description = "Retorna métricas de performance de um pátio específico, incluindo taxa de ocupação média, tempo médio de estacionamento e comparações."
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
    @GetMapping("/patios/{patioId}")
    public ResponseEntity<PerformancePatioDto> getPerformancePatio(@PathVariable Long patioId) {
        log.info("Solicitação de performance do pátio ID: {}", patioId);
        
        try {
            PerformancePatioDto performance = performanceService.getPerformancePatio(patioId);
            log.info("Performance do pátio {} retornada com sucesso", patioId);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            log.error("Erro ao obter performance do pátio {}", patioId, e);
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Obter tempo médio de estacionamento global",
            description = "Retorna o tempo médio de estacionamento de todo o sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tempo médio global obtido com sucesso"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/tempo-medio-estacionamento/global")
    public ResponseEntity<Map<String, Object>> getTempoMedioEstacionamentoGlobal() {
        log.info("Solicitação de tempo médio de estacionamento global recebida");
        
        Double tempoMedio = logMovimentacaoService.getTempoMedioEstacionamentoGlobal();
        
        Map<String, Object> resultado = Map.of(
            "tempoMedioEstacionamentoMinutos", tempoMedio,
            "dataCalculo", java.time.LocalDateTime.now()
        );
        
        log.info("Tempo médio de estacionamento global retornado com sucesso");
        return ResponseEntity.ok(resultado);
    }
}
