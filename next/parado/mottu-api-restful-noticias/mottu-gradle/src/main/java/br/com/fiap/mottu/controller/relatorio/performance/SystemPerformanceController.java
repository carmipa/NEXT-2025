package br.com.fiap.mottu.controller.relatorio.performance;

import br.com.fiap.mottu.dto.relatorio.performance.SystemPerformanceDto;
import br.com.fiap.mottu.dto.relatorio.performance.ThreadInfoDto;
import br.com.fiap.mottu.service.relatorios.performance.SystemPerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios/performance")
@Tag(name = "Relatórios - Performance (Sistema)", description = "Métricas do sistema e do processo")
public class SystemPerformanceController {

    private final SystemPerformanceService performanceService;

    public SystemPerformanceController(SystemPerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @Operation(summary = "Visão geral do sistema/processo")
    @GetMapping("/system")
    public ResponseEntity<SystemPerformanceDto> system() {
        return ResponseEntity.ok(performanceService.coletarSystemInfo());
    }

    @Operation(summary = "Listar threads da JVM")
    @GetMapping("/threads")
    public ResponseEntity<List<ThreadInfoDto>> threads() {
        return ResponseEntity.ok(performanceService.listarThreads());
    }
}


