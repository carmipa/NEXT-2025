package br.com.fiap.mottu.controller.relatorios;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios/filtros")
@Tag(name = "Relatórios - Filtros", description = "Utilitários para filtros de relatórios")
public class RelatorioFilterController {

    private static final Logger log = LoggerFactory.getLogger(RelatorioFilterController.class);

    @Operation(
            summary = "Obter opções de filtros para ocupação",
            description = "Retorna as opções disponíveis para filtros de ocupação."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Opções de filtros obtidas com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/ocupacao/opcoes")
    public ResponseEntity<Map<String, Object>> getOpcoesFiltroOcupacao() {
        log.info("Solicitação de opções de filtros para ocupação");
        
        Map<String, Object> opcoes = new HashMap<>();
        
        // Opções de ordenação
        opcoes.put("ordenacao", new String[]{
            "nomePatio", "taxaOcupacao", "totalBoxes", "boxesOcupados", "dataCadastro"
        });
        
        // Opções de direção de ordenação
        opcoes.put("direcaoOrdenacao", new String[]{"ASC", "DESC"});
        
        // Opções de status de pátio
        opcoes.put("statusPatio", new String[]{"A", "I", "M"});
        
        // Ranges para filtros numéricos
        Map<String, Object> ranges = new HashMap<>();
        ranges.put("taxaOcupacao", Map.of("min", 0, "max", 100));
        ranges.put("totalBoxes", Map.of("min", 1, "max", 1000));
        ranges.put("boxesOcupados", Map.of("min", 0, "max", 1000));
        opcoes.put("ranges", ranges);
        
        log.info("Opções de filtros para ocupação retornadas com sucesso");
        return ResponseEntity.ok(opcoes);
    }

    @Operation(
            summary = "Obter opções de filtros para movimentação",
            description = "Retorna as opções disponíveis para filtros de movimentação."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Opções de filtros obtidas com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/movimentacao/opcoes")
    public ResponseEntity<Map<String, Object>> getOpcoesFiltroMovimentacao() {
        log.info("Solicitação de opções de filtros para movimentação");
        
        Map<String, Object> opcoes = new HashMap<>();
        
        // Opções de ordenação
        opcoes.put("ordenacao", new String[]{
            "dataHoraMovimentacao", "tipoMovimentacao", "placa", "nomePatio"
        });
        
        // Opções de direção de ordenação
        opcoes.put("direcaoOrdenacao", new String[]{"ASC", "DESC"});
        
        // Opções de tipo de movimentação
        opcoes.put("tipoMovimentacao", new String[]{"ENTRADA", "SAIDA"});
        
        // Opções de dias da semana
        opcoes.put("diaSemana", new String[]{
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
        });
        
        // Opções de horário
        opcoes.put("horarios", new String[]{
            "00:00", "06:00", "12:00", "18:00", "23:59"
        });
        
        log.info("Opções de filtros para movimentação retornadas com sucesso");
        return ResponseEntity.ok(opcoes);
    }

    @Operation(
            summary = "Obter opções de filtros para análise comportamental",
            description = "Retorna as opções disponíveis para filtros de análise comportamental."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Opções de filtros obtidas com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/comportamental/opcoes")
    public ResponseEntity<Map<String, Object>> getOpcoesFiltroComportamental() {
        log.info("Solicitação de opções de filtros para análise comportamental");
        
        Map<String, Object> opcoes = new HashMap<>();
        
        // Opções de tipo de análise
        opcoes.put("tipoAnalise", new String[]{
            "HORARIOS_PICO", "PADROES_SEMANAIS", "FREQUENCIA_USO", "PREFERENCIAS_VEICULO"
        });
        
        // Opções de ordenação
        opcoes.put("ordenacao", new String[]{
            "frequencia", "horarioPico", "diaSemana", "categoriaVeiculo"
        });
        
        // Opções de categoria de veículo
        opcoes.put("categoriaVeiculo", new String[]{
            "CARRO", "MOTO", "CAMINHAO", "ONIBUS"
        });
        
        // Opções de fabricante
        opcoes.put("fabricanteVeiculo", new String[]{
            "TOYOTA", "HONDA", "FORD", "CHEVROLET", "VOLKSWAGEN"
        });
        
        // Opções de sexo
        opcoes.put("sexoCliente", new String[]{"M", "F", "OUTRO"});
        
        // Ranges para idade
        Map<String, Object> ranges = new HashMap<>();
        ranges.put("idade", Map.of("min", 18, "max", 80));
        opcoes.put("ranges", ranges);
        
        log.info("Opções de filtros para análise comportamental retornadas com sucesso");
        return ResponseEntity.ok(opcoes);
    }
}
