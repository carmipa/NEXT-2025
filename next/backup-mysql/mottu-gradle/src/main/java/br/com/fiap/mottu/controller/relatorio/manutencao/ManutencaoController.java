package br.com.fiap.mottu.controller.relatorio.manutencao;

import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoDto;
import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoPatioDto;
import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.DateRangeTooLargeException;
import br.com.fiap.mottu.service.relatorios.manutencao.ManutencaoService;
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
@RequestMapping("/api/relatorios/manutencao")
@Tag(name = "Relatórios - Manutenção", description = "Consultas de manutenção")
public class ManutencaoController {

    private final ManutencaoService manutencaoService;

    public ManutencaoController(ManutencaoService manutencaoService) {
        this.manutencaoService = manutencaoService;
    }

    @Operation(summary = "Resumo de manutenção")
    @GetMapping("/resumo")
    public ResponseEntity<ManutencaoResumoDto> resumo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false, name = "dias") Integer diasPreset
    ) {
        // presets permitidos
        java.util.Set<Integer> permitidos = java.util.Set.of(15, 30, 60, 90, 120, 180, 360);

        // Se vier preset de dias, calcula intervalo automaticamente
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
            // mantém salvaguarda para ranges muito extensos
            if (dias > 360) {
                throw new DateRangeTooLargeException("Período máximo permitido é de 360 dias.");
            }
        }

        return ResponseEntity.ok(manutencaoService.obterResumo());
    }

    @Operation(summary = "Resumo de manutenção por pátio")
    @GetMapping("/resumo-por-patio")
    public ResponseEntity<java.util.List<ManutencaoResumoPatioDto>> resumoPorPatio() {
        return ResponseEntity.ok(manutencaoService.resumoPorPatio());
    }
}


