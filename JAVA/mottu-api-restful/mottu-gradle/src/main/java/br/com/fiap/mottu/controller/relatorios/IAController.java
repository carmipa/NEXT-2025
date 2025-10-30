package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;
import java.time.Duration;

@RestController
@RequestMapping("/api/relatorios/ia")
@Tag(name = "Relatórios - IA", description = "Relatórios de IA, previsões e insights inteligentes")
public class IAController {

    private static final Logger log = LoggerFactory.getLogger(IAController.class);
    private final RelatorioService relatorioService;

    public IAController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @Operation(
            summary = "Obter dados do Dashboard IA",
            description = "Retorna dados de análise preditiva e insights inteligentes baseados em dados reais do sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Dados do Dashboard IA obtidos com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardIA() {
        log.info("Solicitação de dados do Dashboard IA recebida");
        
        try {
            Map<String, Object> dadosIA = relatorioService.getDadosDashboardIA();
            log.info("Dados do Dashboard IA retornados com sucesso");
            return ResponseEntity.ok(dadosIA);
        } catch (Exception e) {
            log.error("Erro ao obter dados do Dashboard IA", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Stream Server-Sent Events com snapshots periódicos do Dashboard IA.
     * Atualiza a cada 5 segundos. Frontend pode consumir com EventSource.
     */
    @GetMapping(path = "/dashboard/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Map<String, Object>> streamDashboardIA() {
        log.debug("Cliente conectado ao stream do Dashboard IA");
        return Flux.interval(Duration.ZERO, Duration.ofSeconds(5))
                .map(tick -> relatorioService.getDadosDashboardIA())
                .doOnCancel(() -> log.info("Cliente desconectou do stream do Dashboard IA"))
                .onErrorResume(err -> {
                    log.warn("Erro no stream IA: {}", err.toString());
                    return Flux.empty();
                });
    }

    @Operation(
            summary = "Obter previsões de IA para ocupação",
            description = "Retorna previsões baseadas em IA para ocupação dos pátios, incluindo probabilidades e recomendações."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Previsões de IA obtidas com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/previsoes")
    public ResponseEntity<Map<String, Object>> getPrevisoesIA() {
        log.info("Solicitação de previsões de IA recebida");
        
        try {
            Map<String, Object> dadosIA = relatorioService.getDadosDashboardIA();
            Map<String, Object> previsoes = Map.of(
                "previsao1h", dadosIA.get("previsao1h"),
                "picoMaximo", dadosIA.get("picoMaximo"),
                "confiancaMedia", dadosIA.get("confiancaMedia"),
                "tendencia", dadosIA.get("tendencia"),
                "previsoes", dadosIA.get("previsoes"),
                "timestamp", dadosIA.get("timestamp")
            );
            log.info("Previsões de IA retornadas com sucesso");
            return ResponseEntity.ok(previsoes);
        } catch (Exception e) {
            log.error("Erro ao obter previsões de IA", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Obter insights de IA",
            description = "Retorna insights inteligentes baseados em análise de dados do sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Insights de IA obtidos com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsightsIA() {
        log.info("Solicitação de insights de IA recebida");
        
        try {
            Map<String, Object> dadosIA = relatorioService.getDadosDashboardIA();
            Map<String, Object> insights = Map.of(
                "insights", dadosIA.get("insights"),
                "dadosGrafico", dadosIA.get("dadosGrafico"),
                "timestamp", dadosIA.get("timestamp")
            );
            log.info("Insights de IA retornados com sucesso");
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            log.error("Erro ao obter insights de IA", e);
            return ResponseEntity.status(500).build();
        }
    }
}
