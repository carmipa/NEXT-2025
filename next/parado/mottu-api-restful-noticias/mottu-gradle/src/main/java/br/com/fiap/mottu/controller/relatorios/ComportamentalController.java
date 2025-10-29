package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/relatorios/comportamental-detalhado")
@Tag(name = "Relatórios - Comportamental Detalhado", description = "Análise comportamental detalhada dos clientes e padrões de uso")
public class ComportamentalController {

    private static final Logger log = LoggerFactory.getLogger(ComportamentalController.class);
    private final RelatorioService relatorioService;

    public ComportamentalController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @Operation(
            summary = "Obter análise comportamental dos clientes",
            description = "Retorna insights sobre padrões de uso dos clientes, incluindo horários de pico, frequência de uso e preferências."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Análise comportamental obtida com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnaliseComportamental() {
        log.info("Solicitação de análise comportamental recebida");
        
        try {
            Map<String, Object> dadosComportamental = relatorioService.getAnaliseComportamental();
            log.info("Análise comportamental retornada com sucesso");
            return ResponseEntity.ok(dadosComportamental);
        } catch (Exception e) {
            log.error("Erro ao obter análise comportamental", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Obter padrões de horários de pico",
            description = "Retorna análise detalhada dos horários de maior movimento no sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Padrões de horários obtidos com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/horarios-pico")
    public ResponseEntity<Map<String, Object>> getHorariosPico() {
        log.info("Solicitação de padrões de horários de pico recebida");
        
        try {
            Map<String, Object> dadosComportamental = relatorioService.getAnaliseComportamental();
            Map<String, Object> horariosPico = Map.of(
                "horariosPico", dadosComportamental.get("horariosPico"),
                "horarioPico", dadosComportamental.get("horarioPico"),
                "timestamp", dadosComportamental.get("timestamp")
            );
            log.info("Padrões de horários de pico retornados com sucesso");
            return ResponseEntity.ok(horariosPico);
        } catch (Exception e) {
            log.error("Erro ao obter padrões de horários de pico", e);
            return ResponseEntity.status(500).build();
        }
    }

    @Operation(
            summary = "Obter recomendações baseadas no comportamento",
            description = "Retorna recomendações de otimização baseadas nos padrões comportamentais identificados."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Recomendações obtidas com sucesso",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/recomendacoes")
    public ResponseEntity<Map<String, Object>> getRecomendacoes() {
        log.info("Solicitação de recomendações comportamentais recebida");
        
        try {
            Map<String, Object> dadosComportamental = relatorioService.getAnaliseComportamental();
            Map<String, Object> recomendacoes = Map.of(
                "recomendacoes", dadosComportamental.get("recomendacoes"),
                "totalMovimentacoes", dadosComportamental.get("totalMovimentacoes"),
                "timestamp", dadosComportamental.get("timestamp")
            );
            log.info("Recomendações comportamentais retornadas com sucesso");
            return ResponseEntity.ok(recomendacoes);
        } catch (Exception e) {
            log.error("Erro ao obter recomendações comportamentais", e);
            return ResponseEntity.status(500).build();
        }
    }
}
