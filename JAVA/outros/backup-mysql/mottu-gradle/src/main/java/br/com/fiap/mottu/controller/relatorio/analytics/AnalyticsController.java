package br.com.fiap.mottu.controller.relatorio.analytics;

import br.com.fiap.mottu.dto.relatorio.analytics.AnalyticsKpiDto;
import br.com.fiap.mottu.dto.relatorio.analytics.TopVeiculoDto;
import br.com.fiap.mottu.dto.relatorio.analytics.TopBoxDto;
import br.com.fiap.mottu.dto.relatorio.analytics.TopPatioDto;
import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.DateRangeTooLargeException;
import br.com.fiap.mottu.exception.ReportNotReadyException;
import br.com.fiap.mottu.service.relatorios.analytics.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/relatorios/analytics")
@Tag(name = "Relatórios - Analytics", description = "KPIs e métricas analíticas")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Operation(summary = "KPIs básicos de analytics")
    @GetMapping("/kpis")
    public ResponseEntity<AnalyticsKpiDto> kpis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false, name = "dias") Integer diasPreset
    ) {
        java.util.Set<Integer> permitidos = java.util.Set.of(15, 30, 60, 90, 120, 180, 360);

        if (diasPreset != null) {
            if (!permitidos.contains(diasPreset)) {
                throw new InvalidInputException("Valor de 'dias' inválido. Permitidos: 15, 30, 60, 90, 120, 180, 360.");
            }
            LocalDate fimCalc = (fim != null) ? fim : LocalDate.now();
            LocalDate inicioCalc = fimCalc.minusDays(diasPreset.longValue());
            inicio = inicio != null ? inicio : inicioCalc;
            fim = fimCalc;
        }

        if (inicio != null && fim != null) {
            if (fim.isBefore(inicio)) {
                throw new InvalidInputException("Período inválido: 'fim' não pode ser antes de 'inicio'.");
            }
            long dias = java.time.temporal.ChronoUnit.DAYS.between(inicio, fim);
            if (dias > 360) {
                throw new DateRangeTooLargeException("Período máximo permitido é de 360 dias.");
            }
        }
        if (inicio != null && fim != null) {
            return ResponseEntity.ok(
                    analyticsService.obterKpisPeriodo(
                            inicio.atStartOfDay(),
                            fim.atTime(23, 59, 59)
                    )
            );
        }
        return ResponseEntity.ok(analyticsService.obterKpis());
    }

    @Operation(summary = "Gerar relatório assíncrono (simulado)")
    @GetMapping("/async-status")
    public ResponseEntity<Void> asyncStatus(
            @RequestParam String jobId
    ) {
        // Simula um job que ainda não ficou pronto (retorna 202 Accepted)
        if (!"done".equalsIgnoreCase(jobId)) {
            throw new ReportNotReadyException("Relatório ainda não está pronto. Tente novamente em instantes.");
        }
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Top veículos mais frequentes")
    @GetMapping("/top-veiculos")
    public ResponseEntity<java.util.List<TopVeiculoDto>> topVeiculos(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.topVeiculos(Math.max(1, Math.min(limit, 100))));
    }

    @Operation(summary = "Top boxes mais utilizados")
    @GetMapping("/top-boxes")
    public ResponseEntity<java.util.List<TopBoxDto>> topBoxes(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.topBoxes(Math.max(1, Math.min(limit, 100))));
    }

    @Operation(summary = "Top pátios com mais movimentações")
    @GetMapping("/top-patios")
    public ResponseEntity<java.util.List<TopPatioDto>> topPatios(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.topPatios(Math.max(1, Math.min(limit, 100))));
    }
}
