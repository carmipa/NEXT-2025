package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.box.BoxRequestDto; // DTO para entrada de dados de Box
import br.com.fiap.mottu.dto.box.BoxResponseDto; // DTO para saída de dados de Box
import br.com.fiap.mottu.filter.BoxFilter; // Filtros para busca de Boxes
import br.com.fiap.mottu.service.BoxService; // Serviço com a lógica de negócio para Boxes
import br.com.fiap.mottu.mapper.BoxMapper; // Mapper para converter entre Entidade e DTOs de Box
import br.com.fiap.mottu.model.Box; // Entidade Box
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
@RequestMapping("/api/boxes") // Mapeia todas as requisições que começam com /api/boxes para este controller
@Tag(name = "Boxes", description = "Gerenciamento de Boxes") // Tag do Swagger
public class BoxController {

    private static final Logger log = LoggerFactory.getLogger(BoxController.class); // Logger para esta classe
    private final BoxService boxService; // Injeção do serviço de Box
    private final BoxMapper boxMapper; // Injeção do mapper de Box

    @Autowired // Construtor para injeção de dependências
    public BoxController(BoxService boxService, BoxMapper boxMapper) {
        this.boxService = boxService; //
        this.boxMapper = boxMapper; //
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todos os boxes com paginação",
            description = "Retorna uma página de todos os boxes cadastrados.", //
            parameters = { // Documentação dos parâmetros de paginação
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: nome,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de boxes retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) // O schema agora é Page
            }
    )
    @GetMapping // Mapeia requisições GET para /api/boxes
    public ResponseEntity<Page<BoxResponseDto>> listarTodosBoxes(
            @PageableDefault(size = 10, sort = "nome") Pageable pageable) { // @PageableDefault define valores padrão
        log.info("Buscando todos os boxes com paginação: {}", pageable); //
        Page<Box> boxesPage = boxService.listarTodosBoxes(pageable); // Chama o serviço para obter a página de entidades
        Page<BoxResponseDto> boxesDtoPage = boxesPage.map(boxMapper::toResponseDto); // Mapeia a Page de Entidades para Page de DTOs
        log.info("Retornando {} boxes na página {} de um total de {} elementos.", boxesDtoPage.getNumberOfElements(), boxesDtoPage.getNumber(), boxesDtoPage.getTotalElements());
        return ResponseEntity.ok(boxesDtoPage); // Retorna a página de DTOs com status 200 OK
    }

    @Operation(
            summary = "Buscar box por ID", //
            description = "Retorna um box específico com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Box encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BoxResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Box não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Box com ID 1 não encontrado(a).\",\"path\":\"/api/boxes/1\"}"))) //
            }
    )
    @GetMapping("/{id}") // Mapeia requisições GET para /api/boxes/{id}
    public ResponseEntity<BoxResponseDto> buscarBoxPorId(@PathVariable Long id) { // @PathVariable extrai o ID da URL
        log.info("Buscando box com ID: {}", id); //
        // A exceção ResourceNotFoundException será lançada pelo serviço e tratada pelo GlobalExceptionHandler
        BoxResponseDto box = boxMapper.toResponseDto(boxService.buscarBoxPorId(id)); //
        log.info("Box com ID {} encontrado com sucesso.", id); //
        return ResponseEntity.ok(box); // Retorna o DTO do box com status 200 OK
    }

    @Operation(
            summary = "Buscar boxes por filtro com paginação", //
            description = "Retorna uma lista de boxes que correspondem aos critérios de filtro fornecidos.", //
            parameters = { // Documentação dos parâmetros de paginação e filtro
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de boxes filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) //
            }
    )
    @GetMapping("/search") // Mapeia requisições GET para /api/boxes/search
    public ResponseEntity<Page<BoxResponseDto>> buscarBoxesPorFiltro(
            BoxFilter filter, // Os parâmetros do filtro são injetados automaticamente
            @PageableDefault(size = 10) Pageable pageable) { // Parâmetros de paginação
        log.info("Buscando boxes com filtro: {} e paginação: {}", filter, pageable); //
        Page<Box> boxesPage = boxService.buscarBoxesPorFiltro(filter, pageable); // Chama o serviço
        Page<BoxResponseDto> boxesDtoPage = boxesPage.map(boxMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} boxes filtrados na página {} de {} elementos.", boxesDtoPage.getNumberOfElements(), boxesDtoPage.getNumber(), boxesDtoPage.getTotalElements());
        return ResponseEntity.ok(boxesDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Criar novo box", //
            description = "Cria um novo box com os dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "201", description = "Box criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BoxResponseDto.class))), //
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":400,\"error\":\"Requisição Inválida\",\"message\":\"Mensagem de validação ou erro de input.\",\"path\":\"/api/boxes\"}"))), //
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (nome duplicado)",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":409,\"error\":\"Conflito de Dados\",\"message\":\"Box com nome 'Nome Duplicado' já existe.\",\"path\":\"/api/boxes\"}"))) //
            }
    )
    @PostMapping // Mapeia requisições POST para /api/boxes
    public ResponseEntity<BoxResponseDto> criarBox(@Valid @RequestBody BoxRequestDto boxRequestDto) { // @Valid valida o DTO
        log.info("Recebida requisição para criar box: {}", boxRequestDto); //
        // DuplicatedResourceException será tratada pelo GlobalExceptionHandler
        BoxResponseDto novoBox = boxMapper.toResponseDto(boxService.criarBox(boxRequestDto)); //
        log.info("Box criado com sucesso com ID: {}", novoBox.getIdBox()); //
        return ResponseEntity.status(HttpStatus.CREATED).body(novoBox); // Retorna 201 CREATED com o DTO do novo box
    }

    @Operation(
            summary = "Atualizar box existente", //
            description = "Atualiza um box existente com base no ID e nos dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Box atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BoxResponseDto.class))), //
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":400,\"error\":\"Requisição Inválida\",\"message\":\"Mensagem de validação ou erro de input.\",\"path\":\"/api/boxes/1\"}"))), //
                    @ApiResponse(responseCode = "404", description = "Box não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Box com ID 1 não encontrado(a).\",\"path\":\"/api/boxes/1\"}"))), //
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (nome duplicado)",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":409,\"error\":\"Conflito de Dados\",\"message\":\"Box com nome 'Nome Duplicado' já existe.\",\"path\":\"/api/boxes/1\"}"))) //
            }
    )
    @PutMapping("/{id}") // Mapeia requisições PUT para /api/boxes/{id}
    public ResponseEntity<BoxResponseDto> atualizarBox(@PathVariable Long id, @Valid @RequestBody BoxRequestDto boxRequestDto) { //
        log.info("Recebida requisição para atualizar box com ID {}: {}", id, boxRequestDto); //
        // ResourceNotFoundException e DuplicatedResourceException serão tratadas pelo GlobalExceptionHandler
        BoxResponseDto boxAtualizado = boxMapper.toResponseDto(boxService.atualizarBox(id, boxRequestDto)); //
        log.info("Box com ID {} atualizado com sucesso.", id); //
        return ResponseEntity.ok(boxAtualizado); // Retorna 200 OK com o DTO do box atualizado
    }

    @Operation(
            summary = "Deletar box", //
            description = "Exclui um box com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "204", description = "Box deletado com sucesso"), //
                    @ApiResponse(responseCode = "404", description = "Box não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Box com ID 1 não encontrado(a).\",\"path\":\"/api/boxes/1\"}"))) //
            }
    )
    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/boxes/{id}
    public ResponseEntity<Void> deletarBox(@PathVariable Long id) {
        log.info("Recebida requisição para deletar box com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        boxService.deletarBox(id); //
        log.info("Box com ID {} deletado com sucesso.", id); //
        return ResponseEntity.noContent().build(); // Retorna 204 NO CONTENT
    }
}