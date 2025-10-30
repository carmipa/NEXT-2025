package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.zona.ZonaRequestDto; // DTO para entrada de dados de Zona
import br.com.fiap.mottu.dto.zona.ZonaResponseDto; // DTO para saída de dados de Zona
import br.com.fiap.mottu.filter.ZonaFilter; // Filtros para busca de Zonas
import br.com.fiap.mottu.service.ZonaService; // Serviço com a lógica de negócio para Zonas
import br.com.fiap.mottu.mapper.ZonaMapper; // Mapper para converter entre Entidade e DTOs de Zona
import br.com.fiap.mottu.model.Zona; // Entidade Zona
// Exceções são tratadas pelo GlobalExceptionHandler
// import br.com.fiap.mottu.exception.DuplicatedResourceException;
// import br.com.fiap.mottu.exception.ResourceNotFoundException;

import io.swagger.v3.oas.annotations.Operation; // Anotação do Swagger para descrever a operação
import io.swagger.v3.oas.annotations.media.Content; // Anotação do Swagger para descrever o conteúdo da resposta
import io.swagger.v3.oas.annotations.media.Schema; // Anotação do Swagger para descrever o schema de dados
import io.swagger.v3.oas.annotations.responses.ApiResponse; // Anotação do Swagger para descrever as respostas da API
import io.swagger.v3.oas.annotations.tags.Tag; // Anotação do Swagger para agrupar endpoints
import io.swagger.v3.oas.annotations.Parameter; // Anotação do Swagger para descrever parâmetros
import io.swagger.v3.oas.annotations.enums.ParameterIn; // Enum para especificar onde o parâmetro é passado

import org.slf4j.Logger; // Para logging
import org.slf4j.LoggerFactory; // Para instanciar o Logger
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.data.domain.Page; // Para resultados paginados
import org.springframework.data.domain.Pageable; // Para controle de paginação e ordenação
import org.springframework.data.web.PageableDefault; // Para valores padrão de Pageable
import org.springframework.http.HttpStatus; // Enum para códigos de status HTTP
import org.springframework.http.ResponseEntity; // Classe para construir respostas HTTP
import org.springframework.web.bind.annotation.*; // Anotações para mapeamento de requisições web
import jakarta.validation.Valid; // Para validar DTOs de entrada

// import java.util.List; // Não mais usado para listagem principal
// import java.util.stream.Collectors; // Não mais usado para mapear lista manualmente

@RestController // Marca esta classe como um controller REST
@RequestMapping("/api/zonas") // Mapeia todas as requisições que começam com /api/zonas para este controller
@Tag(name = "Zonas", description = "Gerenciamento de Zonas") // Tag do Swagger
public class ZonaController {

    private static final Logger log = LoggerFactory.getLogger(ZonaController.class); // Logger para esta classe
    private final ZonaService zonaService; // Injeção do serviço de Zona
    private final ZonaMapper zonaMapper; // Injeção do mapper de Zona

    @Autowired // Construtor para injeção de dependências
    public ZonaController(ZonaService zonaService, ZonaMapper zonaMapper) {
        this.zonaService = zonaService; //
        this.zonaMapper = zonaMapper; //
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todas as zonas com paginação",
            description = "Retorna uma página de todas as zonas cadastradas.", //
            parameters = { // Documentação dos parâmetros de paginação
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: nome,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de zonas retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) // O schema agora é Page
            }
    )
    @GetMapping // Mapeia requisições GET para /api/zonas
    public ResponseEntity<Page<ZonaResponseDto>> listarTodasZonas(
            @PageableDefault(size = 10, sort = "nome") Pageable pageable) { // @PageableDefault define valores padrão
        log.info("Buscando todas as zonas com paginação: {}", pageable); //
        Page<Zona> zonasPage = zonaService.listarTodasZonas(pageable); // Chama o serviço
        Page<ZonaResponseDto> zonasDtoPage = zonasPage.map(zonaMapper::toResponseDto); // Mapeia Page de Entidade para Page de DTO
        log.info("Retornando {} zonas na página {} de um total de {} elementos.", zonasDtoPage.getNumberOfElements(), zonasDtoPage.getNumber(), zonasDtoPage.getTotalElements());
        return ResponseEntity.ok(zonasDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Buscar zona por ID", //
            description = "Retorna uma zona específica com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Zona encontrada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ZonaResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Zona não encontrada") // Tratado pelo GlobalExceptionHandler
            }
    )
    @GetMapping("/{id}") // Mapeia requisições GET para /api/zonas/{id}
    public ResponseEntity<ZonaResponseDto> buscarZonaPorId(@PathVariable Long id) { // @PathVariable extrai o ID da URL
        log.info("Buscando zona com ID: {}", id); //
        // ResourceNotFoundException é tratada pelo GlobalExceptionHandler
        ZonaResponseDto zona = zonaMapper.toResponseDto(zonaService.buscarZonaPorId(id)); //
        log.info("Zona com ID {} encontrada com sucesso.", id); //
        return ResponseEntity.ok(zona); // Retorna o DTO da zona
    }

    @Operation(
            summary = "Buscar zonas por filtro com paginação", //
            description = "Retorna uma página de zonas que correspondem aos critérios de filtro fornecidos.", //
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de zonas filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) //
            }
    )
    @GetMapping("/search") // Mapeia requisições GET para /api/zonas/search
    public ResponseEntity<Page<ZonaResponseDto>> buscarZonasPorFiltro(
            ZonaFilter filter, // Filtros injetados automaticamente
            @PageableDefault(size = 10, sort = "nome") Pageable pageable) { // Paginação
        log.info("Buscando zonas com filtro: {} e paginação: {}", filter, pageable); //
        Page<Zona> zonasPage = zonaService.buscarZonasPorFiltro(filter, pageable); // Chama o serviço
        Page<ZonaResponseDto> zonasDtoPage = zonasPage.map(zonaMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} zonas filtradas na página {} de {} elementos.", zonasDtoPage.getNumberOfElements(), zonasDtoPage.getNumber(), zonasDtoPage.getTotalElements());
        return ResponseEntity.ok(zonasDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Criar nova zona", //
            description = "Cria uma nova zona com os dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "201", description = "Zona criada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ZonaResponseDto.class))), //
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"), // Tratado pelo GlobalExceptionHandler (Bean Validation)
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (nome duplicado)") // Tratado pelo GlobalExceptionHandler
            }
    )
    @PostMapping // Mapeia requisições POST para /api/zonas
    public ResponseEntity<ZonaResponseDto> criarZona(@Valid @RequestBody ZonaRequestDto zonaRequestDto) { // @Valid valida o DTO
        log.info("Recebida requisição para criar zona: {}", zonaRequestDto); //
        // DuplicatedResourceException é tratada pelo GlobalExceptionHandler
        ZonaResponseDto novaZona = zonaMapper.toResponseDto(zonaService.criarZona(zonaRequestDto)); //
        log.info("Zona criada com sucesso com ID: {}", novaZona.getIdZona()); //
        return ResponseEntity.status(HttpStatus.CREATED).body(novaZona); // Retorna 201 CREATED com o DTO da nova zona
    }

    @Operation(
            summary = "Atualizar zona existente", //
            description = "Atualiza uma zona existente com base no ID e nos dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Zona atualizada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ZonaResponseDto.class))), //
                    // 400, 404, 409 são tratados pelo GlobalExceptionHandler
            }
    )
    @PutMapping("/{id}") // Mapeia requisições PUT para /api/zonas/{id}
    public ResponseEntity<ZonaResponseDto> atualizarZona(@PathVariable Long id, @Valid @RequestBody ZonaRequestDto zonaRequestDto) { //
        log.info("Recebida requisição para atualizar zona com ID {}: {}", id, zonaRequestDto); //
        // ResourceNotFoundException e DuplicatedResourceException são tratadas pelo GlobalExceptionHandler
        ZonaResponseDto zonaAtualizada = zonaMapper.toResponseDto(zonaService.atualizarZona(id, zonaRequestDto)); //
        log.info("Zona com ID {} atualizada com sucesso.", id); //
        return ResponseEntity.ok(zonaAtualizada); // Retorna 200 OK com o DTO da zona atualizada
    }

    @Operation(
            summary = "Deletar zona", //
            description = "Exclui uma zona com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "204", description = "Zona deletada com sucesso"), //
                    @ApiResponse(responseCode = "404", description = "Zona não encontrada") // Tratado pelo GlobalExceptionHandler
            }
    )
    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/zonas/{id}
    public ResponseEntity<Void> deletarZona(@PathVariable Long id) {
        log.info("Recebida requisição para deletar zona com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        zonaService.deletarZona(id); //
        log.info("Zona com ID {} deletada com sucesso.", id); //
        return ResponseEntity.noContent().build(); // Retorna 204 NO CONTENT
    }
}