package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.dto.relatorio.MovimentacaoDiariaDto;
import br.com.fiap.mottu.service.relatorios.MovimentacaoService;
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
@RequestMapping("/api/relatorios/movimentacao")
@Tag(name = "Relatórios - Movimentação", description = "Relatórios de movimentação de veículos")
public class MovimentacaoController {

    private static final Logger log = LoggerFactory.getLogger(MovimentacaoController.class);
    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

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
    @GetMapping("/diaria")
    public ResponseEntity<List<MovimentacaoDiariaDto>> getMovimentacaoDiaria(
            @Parameter(description = "Data de início (formato: yyyy-MM-dd)", example = "2024-01-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data de fim (formato: yyyy-MM-dd)", example = "2024-01-31")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        
        // Usar valores padrão se não fornecidos
        if (dataInicio == null) {
            dataInicio = LocalDate.now().minusDays(7); // Últimos 7 dias
        }
        if (dataFim == null) {
            dataFim = LocalDate.now(); // Hoje
        }
        
        log.info("Solicitação de movimentação diária entre {} e {} recebida", dataInicio, dataFim);
        
        if (dataInicio.isAfter(dataFim)) {
            log.warn("Data de início posterior à data de fim");
            return ResponseEntity.badRequest().build();
        }
        
        List<MovimentacaoDiariaDto> movimentacao = movimentacaoService.getMovimentacaoDiaria(dataInicio, dataFim);
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
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/veiculo/{veiculoId}")
    public ResponseEntity<List<MovimentacaoDiariaDto>> getMovimentacaoPorVeiculo(@PathVariable Long veiculoId) {
        log.info("Solicitação de movimentação para veículo ID: {}", veiculoId);
        
        try {
            List<MovimentacaoDiariaDto> movimentacao = movimentacaoService.getMovimentacaoPorVeiculo(veiculoId);
            log.info("Movimentação do veículo {} retornada com sucesso. {} registros", veiculoId, movimentacao.size());
            return ResponseEntity.ok(movimentacao);
        } catch (Exception e) {
            log.error("Erro ao obter movimentação do veículo {}", veiculoId, e);
            return ResponseEntity.notFound().build();
        }
    }
}
