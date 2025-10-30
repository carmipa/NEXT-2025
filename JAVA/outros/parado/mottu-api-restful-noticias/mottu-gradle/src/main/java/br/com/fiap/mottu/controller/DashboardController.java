package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.dto.dashboard.ResumoOcupacaoDto;
import br.com.fiap.mottu.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard e Relatórios do Sistema MOTTU")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @Operation(
            summary = "Obter resumo de ocupação atual",
            description = "Retorna um resumo completo da ocupação atual do sistema, incluindo total de veículos estacionados, pátios ocupados e estatísticas gerais."
    )
    @ApiResponse(
            responseCode = "200", 
            description = "Resumo de ocupação retornado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResumoOcupacaoDto.class))
    )
    @GetMapping("/resumo")
    public ResumoOcupacaoDto resumo() {
        log.info("Buscando resumo de ocupação atual do sistema");
        ResumoOcupacaoDto resumo = service.getResumoAtual();
        log.info("Resumo de ocupação obtido com sucesso");
        return resumo;
    }

    @Operation(
            summary = "Obter ocupação por período",
            description = "Retorna a ocupação do sistema por dia dentro de um período específico."
    )
    @Parameter(name = "ini", description = "Data inicial do período (formato: YYYY-MM-DD)", required = true, in = ParameterIn.QUERY, schema = @Schema(type = "string", format = "date"))
    @Parameter(name = "fim", description = "Data final do período (formato: YYYY-MM-DD)", required = true, in = ParameterIn.QUERY, schema = @Schema(type = "string", format = "date"))
    @ApiResponse(
            responseCode = "200", 
            description = "Ocupação por período retornada com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class))
    )
    @GetMapping("/ocupacao-por-dia")
    public List<OcupacaoDiaDto> ocupacaoPorDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ini,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.info("Buscando ocupação por período: {} até {}", ini, fim);
        List<OcupacaoDiaDto> ocupacao = service.getOcupacaoPorDia(ini, fim);
        log.info("Ocupação por período obtida com {} registros", ocupacao.size());
        return ocupacao;
    }

    @Operation(
            summary = "Obter total de veículos cadastrados",
            description = "Retorna o número total de veículos cadastrados no sistema."
    )
    @ApiResponse(
            responseCode = "200", 
            description = "Total de veículos retornado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(type = "integer"))
    )
    @GetMapping("/total-veiculos")
    public long getTotalVeiculos() {
        log.info("Buscando total de veículos cadastrados");
        long total = service.getTotalVeiculos();
        log.info("Total de veículos: {}", total);
        return total;
    }

    @Operation(
            summary = "Obter total de clientes cadastrados",
            description = "Retorna o número total de clientes cadastrados no sistema."
    )
    @ApiResponse(
            responseCode = "200", 
            description = "Total de clientes retornado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(type = "integer"))
    )
    @GetMapping("/total-clientes")
    public long getTotalClientes() {
        log.info("Buscando total de clientes cadastrados");
        long total = service.getTotalClientes();
        log.info("Total de clientes: {}", total);
        return total;
    }
}
