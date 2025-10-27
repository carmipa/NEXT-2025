package br.com.fiap.mottu.dashboard.controller;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.dto.dashboard.ResumoOcupacaoDto;
import br.com.fiap.mottu.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/resumo")
    public ResumoOcupacaoDto resumo() {
        return service.getResumoAtual();
    }

    @GetMapping("/ocupacao-por-dia")
    public List<OcupacaoDiaDto> ocupacaoPorDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ini,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.getOcupacaoPorDia(ini, fim);
    }
}
