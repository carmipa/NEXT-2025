package br.com.fiap.mottu.controller.dashboard;

import br.com.fiap.mottu.service.dashboard.MetricasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard/metricas")
@Tag(name = "Dashboard - Métricas", description = "Métricas e indicadores do sistema")
public class MetricasController {

    private static final Logger log = LoggerFactory.getLogger(MetricasController.class);
    private final MetricasService metricasService;

    public MetricasController(MetricasService metricasService) {
        this.metricasService = metricasService;
    }

    @Operation(
            summary = "Obter métricas gerais do sistema",
            description = "Retorna métricas gerais como total de pátios, boxes, ocupação e movimentações."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Métricas gerais obtidas com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/gerais")
    public ResponseEntity<Map<String, Object>> getMetricasGerais() {
        log.info("Solicitação de métricas gerais recebida");
        
        try {
            Map<String, Object> metricas = metricasService.getMetricasGerais();
            log.info("Métricas gerais retornadas com sucesso");
            return ResponseEntity.ok(metricas);
        } catch (Exception e) {
            log.error("Erro ao obter métricas gerais", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Obter métricas de performance",
            description = "Retorna métricas de performance como tempo médio de estacionamento e eficiência do sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Métricas de performance obtidas com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getMetricasPerformance() {
        log.info("Solicitação de métricas de performance recebida");
        
        try {
            Map<String, Object> metricas = metricasService.getMetricasPerformance();
            log.info("Métricas de performance retornadas com sucesso");
            return ResponseEntity.ok(metricas);
        } catch (Exception e) {
            log.error("Erro ao obter métricas de performance", e);
            return ResponseEntity.status(500).build();
        }
    }
}
