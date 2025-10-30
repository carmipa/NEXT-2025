package br.com.fiap.mottu.controller.noticia;

import br.com.fiap.mottu.dto.noticia.NoticiaResponseDto;
import br.com.fiap.mottu.dto.noticia.NoticiaEstatisticasDto;
import br.com.fiap.mottu.exception.noticia.NoticiaNotFoundException;
import br.com.fiap.mottu.filter.noticia.NoticiaFilter;
import br.com.fiap.mottu.service.noticia.NoticiaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/noticias")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notícias", description = "API para gerenciamento de notícias da Mottu")
public class NoticiaController {

    private final NoticiaService noticiaService;

    @GetMapping
    @Operation(
        summary = "🔍 Buscar Notícias", 
        description = "Busca notícias com filtros opcionais de categoria, sentimento, fonte e texto de busca. " +
                     "Retorna uma página paginada de notícias ordenadas por data de captura.",
        tags = {"Notícias", "Busca"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "✅ Notícias encontradas com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class),
                examples = @ExampleObject(
                    name = "Resposta de sucesso",
                    value = "{\"content\":[{\"idNoticia\":1,\"titulo\":\"Mottu lança nova linha\",\"fonte\":\"Dicas Mottu\"}],\"totalElements\":1,\"totalPages\":1}"
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "❌ Parâmetros inválidos"),
        @ApiResponse(responseCode = "500", description = "❌ Erro interno do servidor")
    })
    public ResponseEntity<Page<NoticiaResponseDto>> buscarNoticias(
            @Parameter(description = "Categoria da notícia", example = "PRODUTO")
            @RequestParam(required = false) String categoria,
            
            @Parameter(description = "Sentimento da notícia", example = "POSITIVO")
            @RequestParam(required = false) String sentimento,
            
            @Parameter(description = "Fonte da notícia", example = "Dicas Mottu")
            @RequestParam(required = false) String fonte,
            
            @Parameter(description = "Texto de busca livre", example = "scooter")
            @RequestParam(required = false) String busca,
            
            @Parameter(description = "Configuração de paginação", example = "page=0&size=10&sort=dataCaptura,desc")
            @PageableDefault(size = 10, sort = "dataCaptura") Pageable pageable) {
        
        log.info("Buscando notícias - Categoria: {}, Sentimento: {}, Fonte: {}, Busca: {}", 
                categoria, sentimento, fonte, busca);
        
        try {
            Page<NoticiaResponseDto> noticias = noticiaService.buscarNoticias(categoria, sentimento, fonte, busca, pageable);
            return ResponseEntity.ok(noticias);
        } catch (Exception e) {
            log.error("Erro ao buscar notícias", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/buscar-avancado")
    @Operation(
        summary = "🔍 Busca Avançada", 
        description = "Busca notícias usando filtros avançados com múltiplos critérios. " +
                     "Permite filtros por data, relevância, visualizações e outros campos específicos.",
        tags = {"Notícias", "Busca Avançada"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "✅ Notícias encontradas com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class)
            )
        ),
        @ApiResponse(responseCode = "400", description = "❌ Filtros inválidos"),
        @ApiResponse(responseCode = "500", description = "❌ Erro interno do servidor")
    })
    public ResponseEntity<Page<NoticiaResponseDto>> buscarNoticiasAvancado(
            @Parameter(description = "Filtros avançados de busca")
            @Valid @RequestBody NoticiaFilter filter,
            
            @Parameter(description = "Configuração de paginação", example = "page=0&size=10&sort=dataCaptura,desc")
            @PageableDefault(size = 10, sort = "dataCaptura") Pageable pageable) {
        
        log.info("Buscando notícias com filtros avançados: {}", filter);
        
        try {
            Page<NoticiaResponseDto> noticias = noticiaService.buscarNoticias(filter, pageable);
            return ResponseEntity.ok(noticias);
        } catch (Exception e) {
            log.error("Erro ao buscar notícias com filtros avançados", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/estatisticas")
    @Operation(
        summary = "📊 Estatísticas", 
        description = "Retorna estatísticas gerais das notícias capturadas, incluindo totais, " +
                     "fontes mais ativas, categorias mais comuns e distribuição por fonte.",
        tags = {"Notícias", "Estatísticas"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "✅ Estatísticas obtidas com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = NoticiaEstatisticasDto.class),
                examples = @ExampleObject(
                    name = "Estatísticas exemplo",
                    value = "{\"totalNoticias\":150,\"noticiasHoje\":5,\"fonteMaisAtiva\":\"Dicas Mottu\",\"categoriaMaisComum\":\"PRODUTO\"}"
                )
            )
        ),
        @ApiResponse(responseCode = "500", description = "❌ Erro interno do servidor")
    })
    public ResponseEntity<NoticiaEstatisticasDto> obterEstatisticas() {
        log.info("Obtendo estatísticas de notícias");
        
        try {
            NoticiaEstatisticasDto estatisticas = noticiaService.obterEstatisticas();
            return ResponseEntity.ok(estatisticas);
        } catch (Exception e) {
            log.error("Erro ao obter estatísticas", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/capturar/dicas-mottu")
    @Operation(
        summary = "🔄 Capturar Dicas Mottu", 
        description = "Executa captura manual de notícias do site Dicas Mottu. " +
                     "Este endpoint pode ser chamado para atualizar o conteúdo manualmente.",
        tags = {"Notícias", "Captura"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Captura executada com sucesso"),
        @ApiResponse(responseCode = "500", description = "❌ Erro durante a captura")
    })
    public ResponseEntity<String> capturarNoticiasDicasMottu() {
        log.info("Executando captura manual do Dicas Mottu");
        
        try {
            noticiaService.capturarNoticiasDicasMottu();
            return ResponseEntity.ok("Captura do Dicas Mottu executada com sucesso");
        } catch (Exception e) {
            log.error("Erro durante captura do Dicas Mottu", e);
            return ResponseEntity.internalServerError()
                    .body("Erro durante captura: " + e.getMessage());
        }
    }

    @PostMapping("/capturar/motoo")
    @Operation(
        summary = "🔄 Capturar MotoO", 
        description = "Executa captura manual de notícias do site MotoO. " +
                     "Este endpoint pode ser chamado para atualizar o conteúdo manualmente.",
        tags = {"Notícias", "Captura"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Captura executada com sucesso"),
        @ApiResponse(responseCode = "500", description = "❌ Erro durante a captura")
    })
    public ResponseEntity<String> capturarNoticiasMotoO() {
        log.info("Executando captura manual do MotoO");
        
        try {
            noticiaService.capturarNoticiasMotoO();
            return ResponseEntity.ok("Captura do MotoO executada com sucesso");
        } catch (Exception e) {
            log.error("Erro durante captura do MotoO", e);
            return ResponseEntity.internalServerError()
                    .body("Erro durante captura: " + e.getMessage());
        }
    }

    @PostMapping("/capturar/linkedin")
    @Operation(
        summary = "🔗 Capturar LinkedIn Mottu", 
        description = "Executa captura manual dos posts do LinkedIn oficial da Mottu. " +
                     "Este endpoint busca posts recentes da página da empresa no LinkedIn.",
        tags = {"Notícias", "Captura", "LinkedIn"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Captura do LinkedIn executada com sucesso"),
        @ApiResponse(responseCode = "500", description = "❌ Erro durante a captura do LinkedIn")
    })
    public ResponseEntity<String> capturarNoticiasLinkedIn() {
        log.info("Executando captura manual do LinkedIn Mottu");
        
        try {
            noticiaService.capturarNoticiasLinkedIn();
            return ResponseEntity.ok("✅ Captura do LinkedIn Mottu executada com sucesso!");
        } catch (Exception e) {
            log.error("Erro ao capturar notícias do LinkedIn Mottu", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro durante captura do LinkedIn: " + e.getMessage());
        }
    }

    @PostMapping("/capturar/todas")
    @Operation(
        summary = "🔄 Capturar Todas as Fontes", 
        description = "Executa captura manual de todas as fontes configuradas. " +
                     "Este endpoint atualiza o conteúdo de todas as fontes de notícias.",
        tags = {"Notícias", "Captura"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Captura executada com sucesso"),
        @ApiResponse(responseCode = "500", description = "❌ Erro durante a captura")
    })
    public ResponseEntity<String> capturarTodasNoticias() {
        log.info("Executando captura manual de todas as fontes");
        
        try {
            noticiaService.capturarTodasAsFontes();
            return ResponseEntity.ok("Captura de todas as fontes executada com sucesso");
        } catch (Exception e) {
            log.error("Erro durante captura de todas as fontes", e);
            return ResponseEntity.internalServerError()
                    .body("Erro durante captura: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/visualizar")
    @Operation(
        summary = "👁️ Incrementar Visualizações", 
        description = "Incrementa o contador de visualizações de uma notícia específica. " +
                     "Útil para rastrear o engajamento com o conteúdo.",
        tags = {"Notícias", "Engajamento"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Visualizações incrementadas com sucesso"),
        @ApiResponse(responseCode = "404", description = "❌ Notícia não encontrada"),
        @ApiResponse(responseCode = "500", description = "❌ Erro interno do servidor")
    })
    public ResponseEntity<String> incrementarVisualizacoes(
            @Parameter(description = "ID da notícia", example = "1")
            @PathVariable Long id) {
        
        log.info("Incrementando visualizações da notícia ID: {}", id);
        
        try {
            noticiaService.incrementarVisualizacoes(id);
            return ResponseEntity.ok("Visualizações incrementadas com sucesso");
        } catch (NoticiaNotFoundException e) {
            log.error("Notícia não encontrada ID: {}", id, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao incrementar visualizações da notícia ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body("Erro ao incrementar visualizações: " + e.getMessage());
        }
    }

    @GetMapping("/categorias")
    @Operation(
        summary = "📂 Listar Categorias", 
        description = "Retorna lista de todas as categorias disponíveis para filtros",
        tags = {"Notícias", "Metadados"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Categorias listadas com sucesso")
    })
    public ResponseEntity<String[]> listarCategorias() {
        log.info("Listando categorias de notícias");
        
        String[] categorias = {
            "EMPRESA", "PRODUTO", "PARCERIA", "INVESTIMENTO", "PREMIACAO",
            "EXPANSAO", "TECNOLOGIA", "SUSTENTABILIDADE", "COMUNIDADE", "OUTROS"
        };
        
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/sentimentos")
    @Operation(
        summary = "😊 Listar Sentimentos", 
        description = "Retorna lista de todos os sentimentos disponíveis para filtros",
        tags = {"Notícias", "Metadados"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Sentimentos listados com sucesso")
    })
    public ResponseEntity<String[]> listarSentimentos() {
        log.info("Listando sentimentos de notícias");
        
        String[] sentimentos = {"POSITIVO", "NEUTRO", "NEGATIVO"};
        
        return ResponseEntity.ok(sentimentos);
    }

    @GetMapping("/fontes")
    @Operation(
        summary = "📰 Listar Fontes", 
        description = "Retorna lista de todas as fontes disponíveis para filtros",
        tags = {"Notícias", "Metadados"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "✅ Fontes listadas com sucesso")
    })
    public ResponseEntity<String[]> listarFontes() {
        log.info("Listando fontes de notícias");
        
        String[] fontes = {"Dicas Mottu", "MotoO", "Outros"};
        
        return ResponseEntity.ok(fontes);
    }
}
