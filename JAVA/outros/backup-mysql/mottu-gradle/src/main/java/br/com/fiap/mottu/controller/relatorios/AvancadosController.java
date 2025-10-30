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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios/avancados")
@Tag(name = "Relatórios - Avançados", description = "Relatórios avançados de performance, segurança e manutenção")
public class AvancadosController {

    private static final Logger log = LoggerFactory.getLogger(AvancadosController.class);
    private final RelatorioService relatorioService;

    public AvancadosController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @Operation(
            summary = "Obter lista de relatórios avançados disponíveis",
            description = "Retorna a lista de todos os relatórios avançados disponíveis no sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de relatórios avançados obtida com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getRelatoriosAvancados() {
        log.info("Solicitação de relatórios avançados recebida");
        
        try {
            List<Map<String, Object>> relatorios = relatorioService.getRelatoriosAvancados();
            log.info("Relatórios avançados retornados com sucesso");
            return ResponseEntity.ok(relatorios);
        } catch (Exception e) {
            log.error("Erro ao obter relatórios avançados", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Executar relatório de performance do sistema",
            description = "Executa análise de performance do sistema e retorna métricas detalhadas."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Relatório de performance executado com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/performance-sistema")
    public ResponseEntity<Map<String, Object>> executarRelatorioPerformance() {
        log.info("Executando relatório de performance do sistema");
        
        try {
            Map<String, Object> resultado = relatorioService.executarRelatorioPerformanceSistema(Map.of());
            log.info("Relatório de performance executado com sucesso");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao executar relatório de performance", e);
            return ResponseEntity.status(500).build();
        }
    }


    @Operation(
            summary = "Executar relatório de manutenção preditiva",
            description = "Executa análise de manutenção preditiva e retorna recomendações."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Relatório de manutenção executado com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/manutencao")
    public ResponseEntity<Map<String, Object>> executarRelatorioManutencao() {
        log.info("Executando relatório de manutenção preditiva");
        
        try {
            Map<String, Object> resultado = relatorioService.executarRelatorioManutencao(Map.of());
            log.info("Relatório de manutenção executado com sucesso");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao executar relatório de manutenção", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Executar relatório de analytics avançado",
            description = "Executa análise avançada de dados e retorna insights detalhados."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Relatório de analytics executado com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/analytics-avancado")
    public ResponseEntity<Map<String, Object>> executarRelatorioAnalytics() {
        log.info("Executando relatório de analytics avançado");
        
        try {
            Map<String, Object> resultado = relatorioService.executarRelatorioAnalyticsAvancado(Map.of());
            log.info("Relatório de analytics executado com sucesso");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao executar relatório de analytics", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Executar relatório de ocupação inteligente",
            description = "Executa análise inteligente de ocupação e retorna previsões e recomendações."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Relatório de ocupação inteligente executado com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @PostMapping("/ocupacao-inteligente")
    public ResponseEntity<Map<String, Object>> executarRelatorioOcupacaoInteligente() {
        log.info("Executando relatório de ocupação inteligente");
        
        try {
            Map<String, Object> resultado = relatorioService.executarRelatorioOcupacaoInteligente(Map.of());
            log.info("Relatório de ocupação inteligente executado com sucesso");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao executar relatório de ocupação inteligente", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Executar relatório de monitoramento SLA",
            description = "Executa análise de monitoramento de SLA e retorna métricas de disponibilidade."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Relatório de monitoramento SLA executado com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @PostMapping("/monitoramento-sla")
    public ResponseEntity<Map<String, Object>> executarRelatorioMonitoramentoSLA() {
        log.info("Executando relatório de monitoramento SLA");
        
        try {
            Map<String, Object> resultado = relatorioService.executarRelatorioMonitoramentoSLA(Map.of());
            log.info("Relatório de monitoramento SLA executado com sucesso");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao executar relatório de monitoramento SLA", e);
            return ResponseEntity.status(500).build();
        }
    }
}
