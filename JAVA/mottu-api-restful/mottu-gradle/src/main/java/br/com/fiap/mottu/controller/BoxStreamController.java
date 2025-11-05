package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.service.VagaOracleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * SSE para atualização de status dos boxes em tempo real.
 * Atualiza os mapas 2D dos pátios quando há mudanças nos status dos boxes.
 */
@RestController
@RequestMapping("/api/boxes")
@Tag(name = "Boxes - Stream", description = "Stream SSE para atualização em tempo real do status dos boxes (L=Livre, O=Ocupado, M=Manutenção)")
public class BoxStreamController {

    private static final Logger log = LoggerFactory.getLogger(BoxStreamController.class);
    private final VagaOracleService vagaService;

    public BoxStreamController(VagaOracleService vagaService) {
        this.vagaService = vagaService;
    }

    /**
     * Stream SSE com status atualizado dos boxes de um pátio específico.
     * Atualiza a cada 3 segundos.
     * 
     * @param patioId ID do pátio (opcional, se não fornecido retorna todos os pátios)
     * @return Flux com lista de boxes e seus status atualizados
     */
    @Operation(
            summary = "Stream SSE de status dos boxes em tempo real",
            description = """
                    Retorna um stream Server-Sent Events (SSE) com atualizações periódicas (a cada 3 segundos) 
                    do status dos boxes. Inclui boxes livres (L), ocupados (O) e em manutenção (M).
                    
                    O stream inclui:
                    - Status do box (L, O, M)
                    - Dados do veículo quando o box está ocupado
                    - Informações completas do box (ID, nome, etc.)
                    
                    O frontend pode consumir este stream usando EventSource para atualizar os mapas 2D em tempo real.
                    """,
            parameters = {
                    @Parameter(
                            name = "patioId",
                            description = "ID do pátio para filtrar boxes (opcional). Se não fornecido, retorna boxes de todos os pátios",
                            in = ParameterIn.QUERY,
                            schema = @Schema(type = "integer", example = "1"),
                            required = false
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Stream SSE iniciado com sucesso. Dados são enviados continuamente a cada 3 segundos",
                            content = @Content(
                                    mediaType = MediaType.TEXT_EVENT_STREAM_VALUE,
                                    schema = @Schema(description = "Lista de boxes com status atualizado")
                            )
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Erro interno ao buscar boxes"
                    )
            }
    )
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<List<Map<String, Object>>> streamBoxesStatus(
            @RequestParam(required = false) Long patioId) {
        log.debug("Cliente conectado ao stream de boxes status. PatioId: {}", patioId);
        
        return Flux.interval(Duration.ofSeconds(3))
                .map(tick -> {
                    try {
                        // Buscar boxes com detalhes do veículo (inclui status L, O, M)
                        List<Map<String, Object>> boxes;
                        if (patioId != null) {
                            boxes = vagaService.listarBoxesComDetalhesVeiculo(patioId).stream()
                                    .map(row -> {
                                        Map<String, Object> boxData = new java.util.LinkedHashMap<>();
                                        boxData.put("idBox", row.idBox());
                                        boxData.put("nome", row.nome());
                                        // Preservar status original do box (L, O, M)
                                        boxData.put("status", row.status());
                                        // Criar mapa de veículo usando LinkedHashMap para permitir nulls
                                        if (row.placa() != null) {
                                            Map<String, Object> veiculoData = new java.util.LinkedHashMap<>();
                                            veiculoData.put("placa", row.placa());
                                            veiculoData.put("modelo", row.modelo() != null ? row.modelo() : "");
                                            veiculoData.put("fabricante", row.fabricante() != null ? row.fabricante() : "");
                                            veiculoData.put("tagBleId", row.tagBleId()); // Pode ser null
                                            boxData.put("veiculo", veiculoData);
                                        } else {
                                            boxData.put("veiculo", null);
                                        }
                                        return boxData;
                                    })
                                    .toList();
                        } else {
                            // Sem filtro de pátio, retorna todos
                            boxes = vagaService.listarBoxesComDetalhesVeiculo().stream()
                                    .map(row -> {
                                        Map<String, Object> boxData = new java.util.LinkedHashMap<>();
                                        boxData.put("idBox", row.idBox());
                                        boxData.put("nome", row.nome());
                                        boxData.put("status", row.status());
                                        boxData.put("veiculo", row.placa() != null ? Map.of(
                                                "placa", row.placa(),
                                                "modelo", row.modelo() != null ? row.modelo() : "",
                                                "fabricante", row.fabricante() != null ? row.fabricante() : "",
                                                "tagBleId", row.tagBleId() != null ? row.tagBleId() : null
                                        ) : null);
                                        return boxData;
                                    })
                                    .toList();
                        }
                        
                        log.trace("Enviando {} boxes atualizados via SSE", boxes.size());
                        return boxes;
                    } catch (Exception e) {
                        log.error("Erro ao buscar boxes para SSE", e);
                        return List.<Map<String, Object>>of();
                    }
                })
                .onErrorContinue((err, obj) -> {
                    log.warn("Erro no stream de boxes status: {}", err.getMessage());
                })
                .doOnCancel(() -> {
                    log.info("Cliente desconectou do stream de boxes status");
                });
    }
}
