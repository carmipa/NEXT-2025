package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.dto.relatorio.OcupacaoAtualDto;
import br.com.fiap.mottu.dto.datatable.DataTableRequest;
import br.com.fiap.mottu.dto.datatable.DataTableResponse;
import br.com.fiap.mottu.filter.relatorios.OcupacaoFilter;
import br.com.fiap.mottu.service.relatorios.OcupacaoService;
import br.com.fiap.mottu.service.datatable.DataTableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios/ocupacao")
@Tag(name = "Relatórios - Ocupação", description = "Relatórios de ocupação e heatmap dos pátios")
public class OcupacaoController {

    private static final Logger log = LoggerFactory.getLogger(OcupacaoController.class);
    private final OcupacaoService ocupacaoService;
    private final DataTableService dataTableService;

    public OcupacaoController(OcupacaoService ocupacaoService, DataTableService dataTableService) {
        this.ocupacaoService = ocupacaoService;
        this.dataTableService = dataTableService;
    }

    @Operation(
            summary = "Obter ocupação atual de todos os pátios",
            description = "Retorna a ocupação atual de todos os pátios do sistema, incluindo taxa de ocupação, boxes ocupados e livres."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Ocupação atual obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OcupacaoAtualDto.class))
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/atual")
    public ResponseEntity<List<OcupacaoAtualDto>> getOcupacaoAtual(
            @RequestParam(required = false) Long patioId,
            @RequestParam(required = false) String nomePatio,
            @RequestParam(required = false) String statusPatio,
            @RequestParam(required = false) Double taxaOcupacaoMin,
            @RequestParam(required = false) Double taxaOcupacaoMax,
            @RequestParam(required = false) Integer totalBoxesMin,
            @RequestParam(required = false) Integer totalBoxesMax,
            @RequestParam(required = false) String ordenacao,
            @RequestParam(required = false, defaultValue = "ASC") String direcaoOrdenacao) {
        
        log.info("Solicitação de ocupação atual recebida");
        
        // Criar filtro
        OcupacaoFilter filter = new OcupacaoFilter();
        filter.setPatioId(patioId);
        filter.setNomePatio(nomePatio);
        filter.setStatusPatio(statusPatio);
        filter.setTaxaOcupacaoMin(taxaOcupacaoMin);
        filter.setTaxaOcupacaoMax(taxaOcupacaoMax);
        filter.setTotalBoxesMin(totalBoxesMin);
        filter.setTotalBoxesMax(totalBoxesMax);
        filter.setOrdenacao(ordenacao);
        filter.setDirecaoOrdenacao(direcaoOrdenacao);
        
        List<OcupacaoAtualDto> ocupacao = ocupacaoService.getOcupacaoAtual(filter);
        log.info("Ocupação atual retornada com sucesso. {} pátios", ocupacao.size());
        return ResponseEntity.ok(ocupacao);
    }

    @Operation(
            summary = "Obter ocupação atual com DataTable",
            description = "Retorna a ocupação atual de todos os pátios com suporte a DataTable (paginação, ordenação, busca)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Ocupação atual obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DataTableResponse.class))
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @PostMapping("/atual/datatable")
    public ResponseEntity<DataTableResponse<OcupacaoAtualDto>> getOcupacaoAtualDataTable(@RequestBody DataTableRequest request) {
        log.info("Solicitação de ocupação atual com DataTable recebida");
        
        try {
            // Criar filtro a partir do request
            OcupacaoFilter filter = new OcupacaoFilter();
            if (request.getAdditionalParams() != null) {
                if (request.getAdditionalParams().containsKey("patioId")) {
                    filter.setPatioId(Long.valueOf(request.getAdditionalParams().get("patioId").toString()));
                }
                if (request.getAdditionalParams().containsKey("nomePatio")) {
                    filter.setNomePatio(request.getAdditionalParams().get("nomePatio").toString());
                }
                if (request.getAdditionalParams().containsKey("statusPatio")) {
                    filter.setStatusPatio(request.getAdditionalParams().get("statusPatio").toString());
                }
            }
            
            // Buscar dados com filtro
            List<OcupacaoAtualDto> ocupacao = ocupacaoService.getOcupacaoAtual(filter);
            
            // Aplicar busca global se especificada
            if (request.getSearchValue() != null && !request.getSearchValue().trim().isEmpty()) {
                String searchTerm = request.getSearchValue().toLowerCase();
                ocupacao = ocupacao.stream()
                        .filter(dto -> 
                            (dto.getNomePatio() != null && dto.getNomePatio().toLowerCase().contains(searchTerm)) ||
                            (dto.getStatusPatio() != null && dto.getStatusPatio().toLowerCase().contains(searchTerm)) ||
                            (dto.getCidade() != null && dto.getCidade().toLowerCase().contains(searchTerm))
                        )
                        .toList();
            }
            
            // Aplicar paginação manual (simplificada)
            int start = request.getStart() != null ? request.getStart() : 0;
            int length = request.getLength() != null ? request.getLength() : 10;
            int end = Math.min(start + length, ocupacao.size());
            
            List<OcupacaoAtualDto> paginatedData = ocupacao.subList(start, end);
            
            DataTableResponse<OcupacaoAtualDto> response = DataTableResponse.success(
                request.getDraw(),
                (long) ocupacao.size(),
                (long) ocupacao.size(),
                paginatedData
            );
            
            log.info("Ocupação atual com DataTable retornada com sucesso. {} registros", paginatedData.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Erro ao obter ocupação atual com DataTable", e);
            DataTableResponse<OcupacaoAtualDto> errorResponse = DataTableResponse.error(
                request.getDraw(),
                "Erro ao processar dados: " + e.getMessage()
            );
            return ResponseEntity.ok(errorResponse);
        }
    }

    @Operation(
            summary = "Obter ocupação atual de um pátio específico",
            description = "Retorna a ocupação atual de um pátio específico, incluindo taxa de ocupação, boxes ocupados e livres."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Ocupação do pátio obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OcupacaoAtualDto.class))
            ),
            @ApiResponse(responseCode = "404", description = "Pátio não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/atual/{patioId}")
    public ResponseEntity<OcupacaoAtualDto> getOcupacaoAtualPorPatio(@PathVariable Long patioId) {
        log.info("Solicitação de ocupação atual para pátio ID: {}", patioId);
        
        try {
            OcupacaoAtualDto ocupacao = ocupacaoService.getOcupacaoAtualPorPatio(patioId);
            log.info("Ocupação do pátio {} retornada com sucesso", patioId);
            return ResponseEntity.ok(ocupacao);
        } catch (Exception e) {
            log.error("Erro ao obter ocupação do pátio {}", patioId, e);
            return ResponseEntity.notFound().build();
        }
    }
}
