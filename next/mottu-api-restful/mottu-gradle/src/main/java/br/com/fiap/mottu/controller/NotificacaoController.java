package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.notificacao.NotificacaoResponseDto;
import br.com.fiap.mottu.model.Notificacao;
import br.com.fiap.mottu.service.NotificacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notificações", description = "API para gerenciamento de notificações do sistema")
public class NotificacaoController {
    
    private final NotificacaoService notificacaoService;
    
    @GetMapping
    @Operation(summary = "Listar notificações", 
               description = "Lista notificações com filtros opcionais")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notificações listadas com sucesso"),
        @ApiResponse(responseCode = "400", description = "Parâmetros inválidos")
    })
    public ResponseEntity<Page<NotificacaoResponseDto>> listarNotificacoes(
            @Parameter(description = "Filtrar por notificações lidas/não lidas")
            @RequestParam(required = false) Boolean lida,
            
            @Parameter(description = "Filtrar por prioridade")
            @RequestParam(required = false) Notificacao.PrioridadeNotificacao prioridade,
            
            @Parameter(description = "Filtrar por categoria")
            @RequestParam(required = false) Notificacao.CategoriaNotificacao categoria,
            
            @Parameter(description = "Filtrar por tipo")
            @RequestParam(required = false) Notificacao.TipoNotificacao tipo,
            
            @Parameter(description = "Número da página (0-based)")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Tamanho da página")
            @RequestParam(defaultValue = "20") int size,
            
            @Parameter(description = "Campo para ordenação")
            @RequestParam(defaultValue = "dataHoraCriacao") String sort,
            
            @Parameter(description = "Direção da ordenação (asc/desc)")
            @RequestParam(defaultValue = "desc") String direction) {
        
        log.info("Listando notificações com filtros: lida={}, prioridade={}, categoria={}, tipo={}", 
                lida, prioridade, categoria, tipo);
        
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? 
            Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<NotificacaoResponseDto> notificacoes = notificacaoService.listarNotificacoes(
            lida, prioridade, categoria, tipo, pageable);
        
        log.info("Retornando {} notificações", notificacoes.getTotalElements());
        return ResponseEntity.ok(notificacoes);
    }
    
    @PutMapping("/{id}/marcar-lida")
    @Operation(summary = "Marcar notificação como lida", 
               description = "Marca uma notificação específica como lida")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notificação marcada como lida"),
        @ApiResponse(responseCode = "404", description = "Notificação não encontrada")
    })
    public ResponseEntity<Void> marcarComoLida(
            @Parameter(description = "ID da notificação")
            @PathVariable Long id) {
        
        log.info("Marcando notificação {} como lida", id);
        
        try {
            notificacaoService.marcarComoLida(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Erro ao marcar notificação como lida: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/marcar-todas-lidas")
    @Operation(summary = "Marcar todas as notificações como lidas", 
               description = "Marca todas as notificações não lidas como lidas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todas as notificações foram marcadas como lidas")
    })
    public ResponseEntity<Void> marcarTodasComoLidas() {
        log.info("Marcando todas as notificações como lidas");
        
        notificacaoService.marcarTodasComoLidas();
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/gerar-dinamicas")
    @Operation(summary = "Gerar notificações dinâmicas", 
               description = "Gera notificações baseadas no estado atual do sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notificações dinâmicas geradas com sucesso")
    })
    public ResponseEntity<Map<String, Object>> gerarNotificacoesDinamicas() {
        log.info("Gerando notificações dinâmicas baseadas no sistema");
        
        try {
            // Usar o serviço para gerar notificações dinâmicas
            notificacaoService.gerarNotificacoesDinamicas();
            
            Map<String, Object> resultado = Map.of(
                "status", "sucesso",
                "mensagem", "Notificações dinâmicas geradas com sucesso",
                "timestamp", java.time.LocalDateTime.now()
            );
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao gerar notificações dinâmicas", e);
            
            Map<String, Object> erro = Map.of(
                "status", "erro",
                "mensagem", "Erro ao gerar notificações: " + e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            );
            
            return ResponseEntity.internalServerError().body(erro);
        }
    }
    
    @GetMapping("/estatisticas")
    @Operation(summary = "Obter estatísticas das notificações", 
               description = "Retorna estatísticas gerais das notificações")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estatísticas obtidas com sucesso")
    })
    public ResponseEntity<Map<String, Object>> getEstatisticas() {
        log.info("Obtendo estatísticas das notificações");
        
        Map<String, Object> estatisticas = notificacaoService.getEstatisticas();
        return ResponseEntity.ok(estatisticas);
    }
    
    @PostMapping("/teste")
    @Operation(summary = "Teste de notificação", 
               description = "Cria uma notificação de teste")
    public ResponseEntity<Map<String, Object>> testeNotificacao() {
        try {
            // Criar notificação de teste com timestamp único
            String timestamp = String.valueOf(System.currentTimeMillis());
            Notificacao notificacao = Notificacao.builder()
                .titulo("Teste de Notificação " + timestamp)
                .mensagem("Esta é uma notificação de teste criada em " + java.time.LocalDateTime.now())
                .tipo(Notificacao.TipoNotificacao.INFO)
                .prioridade(Notificacao.PrioridadeNotificacao.BAIXA)
                .categoria(Notificacao.CategoriaNotificacao.SISTEMA)
                .lida(false)
                .dataHoraCriacao(java.time.LocalDateTime.now())
                .build();
            
            notificacaoService.notificacaoRepository.save(notificacao);
            
            return ResponseEntity.ok(Map.of(
                "status", "sucesso",
                "mensagem", "Notificação de teste criada com sucesso",
                "timestamp", java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Erro ao criar notificação de teste", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "erro",
                "mensagem", "Erro: " + e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }
    
    @DeleteMapping("/limpar")
    @Operation(summary = "Limpar notificações", 
               description = "Remove todas as notificações existentes")
    public ResponseEntity<Map<String, Object>> limparNotificacoes() {
        try {
            // Usar o serviço para limpar notificações
            notificacaoService.limparTodasNotificacoes();
            
            return ResponseEntity.ok(Map.of(
                "status", "sucesso",
                "mensagem", "Todas as notificações foram removidas",
                "timestamp", java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Erro ao limpar notificações", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "erro",
                "mensagem", "Erro: " + e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }
}