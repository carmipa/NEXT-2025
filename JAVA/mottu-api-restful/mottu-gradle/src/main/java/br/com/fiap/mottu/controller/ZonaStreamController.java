package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.zona.ZonaResponseDto;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.service.PatioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;

/**
 * SSE para atualização de zonas em tempo real.
 * Atualiza a lista de zonas quando há mudanças (criação, atualização, exclusão).
 */
@RestController
@RequestMapping("/api/zonas")
@Tag(name = "Zonas - Stream", description = "Stream SSE para atualização em tempo real das zonas de um pátio")
public class ZonaStreamController {

    private static final Logger log = LoggerFactory.getLogger(ZonaStreamController.class);
    private final PatioService patioService;

    public ZonaStreamController(PatioService patioService) {
        this.patioService = patioService;
    }

    /**
     * Stream SSE com zonas atualizadas de um pátio específico.
     * Atualiza a cada 3 segundos.
     * 
     * @param patioId ID do pátio (obrigatório)
     * @param patioStatus Status do pátio (obrigatório)
     * @return Flux com lista de zonas ordenadas por nome (crescente)
     */
    @Operation(
            summary = "Stream SSE de zonas em tempo real",
            description = """
                    Retorna um stream Server-Sent Events (SSE) com atualizações periódicas (a cada 3 segundos) 
                    das zonas de um pátio. As zonas são ordenadas por nome em ordem crescente.
                    
                    O stream inclui:
                    - Lista completa de zonas do pátio
                    - ID, nome, status, observação de cada zona
                    - Informações do pátio pai
                    
                    O frontend pode consumir este stream usando EventSource para atualizar a lista de zonas em tempo real.
                    """,
            parameters = {
                    @Parameter(
                            name = "patioId",
                            description = "ID do pátio para listar zonas",
                            in = ParameterIn.QUERY,
                            schema = @Schema(type = "integer", example = "1"),
                            required = true
                    ),
                    @Parameter(
                            name = "patioStatus",
                            description = "Status do pátio (A=Ativo, I=Inativo)",
                            in = ParameterIn.QUERY,
                            schema = @Schema(type = "string", example = "A"),
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Stream SSE iniciado com sucesso. Dados são enviados continuamente a cada 3 segundos",
                            content = @Content(
                                    mediaType = MediaType.TEXT_EVENT_STREAM_VALUE,
                                    schema = @Schema(description = "Lista de zonas ordenadas por nome")
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Parâmetros inválidos (patioId ou patioStatus ausentes)"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Pátio não encontrado"
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Erro interno ao buscar zonas"
                    )
            }
    )
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<List<ZonaResponseDto>> streamZonas(
            @RequestParam(required = false) Long patioId,
            @RequestParam(required = false) String patioStatus) {
        
        // Validação de parâmetros obrigatórios
        if (patioId == null || patioStatus == null || patioStatus.trim().isEmpty()) {
            log.warn("Parâmetros inválidos para stream de zonas: patioId={}, patioStatus={}", patioId, patioStatus);
            return Flux.error(new IllegalArgumentException("patioId e patioStatus são obrigatórios"));
        }

        log.debug("Cliente conectado ao stream de zonas. PatioId: {}, PatioStatus: {}", patioId, patioStatus);
        
        return Flux.interval(Duration.ofSeconds(3))
                .map(tick -> {
                    try {
                        // Buscar zonas do pátio com paginação grande para pegar todas
                        Page<ZonaResponseDto> zonasPage = patioService.listarZonasPorPatio(
                                patioId, 
                                patioStatus, 
                                org.springframework.data.domain.PageRequest.of(0, 1000)
                        );
                        
                        // Ordenar por nome em ordem crescente
                        List<ZonaResponseDto> zonas = zonasPage.getContent().stream()
                                .sorted((z1, z2) -> z1.getNome().compareToIgnoreCase(z2.getNome()))
                                .toList();
                        
                        log.trace("Enviando {} zonas atualizadas via SSE", zonas.size());
                        return zonas;
                    } catch (ResourceNotFoundException e) {
                        log.error("Pátio não encontrado para stream de zonas: {}", e.getMessage());
                        throw e;
                    } catch (Exception e) {
                        log.error("Erro ao buscar zonas para SSE", e);
                        throw new RuntimeException("Erro ao buscar zonas: " + e.getMessage(), e);
                    }
                })
                .onErrorContinue((err, obj) -> {
                    if (err instanceof ResourceNotFoundException) {
                        log.error("Pátio não encontrado no stream de zonas: {}", err.getMessage());
                    } else {
                        log.warn("Erro no stream de zonas: {}", err.getMessage());
                    }
                })
                .doOnCancel(() -> {
                    log.info("Cliente desconectou do stream de zonas");
                });
    }
}












