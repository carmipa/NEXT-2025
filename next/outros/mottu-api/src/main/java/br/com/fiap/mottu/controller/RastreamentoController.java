package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.rastreamento.RastreamentoRequestDto; // DTO para entrada de dados de Rastreamento
import br.com.fiap.mottu.dto.rastreamento.RastreamentoResponseDto; // DTO para saída de dados de Rastreamento
import br.com.fiap.mottu.filter.RastreamentoFilter; // Filtros para busca de Rastreamentos
import br.com.fiap.mottu.service.RastreamentoService; // Serviço com a lógica de negócio para Rastreamentos
import br.com.fiap.mottu.mapper.RastreamentoMapper; // Mapper para converter entre Entidade e DTOs de Rastreamento
import br.com.fiap.mottu.model.Rastreamento; // Entidade Rastreamento
// Exceções são tratadas pelo GlobalExceptionHandler
// import br.com.fiap.mottu.exception.ResourceNotFoundException;
// import br.com.fiap.mottu.exception.InvalidInputException;

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
@RequestMapping("/api/rastreamentos") // Mapeia todas as requisições que começam com /api/rastreamentos para este controller
@Tag(name = "Rastreamentos", description = "Gerenciamento de Rastreamentos") // Tag do Swagger
public class RastreamentoController {

    private static final Logger log = LoggerFactory.getLogger(RastreamentoController.class); // Logger para esta classe
    private final RastreamentoService rastreamentoService; // Injeção do serviço de Rastreamento
    private final RastreamentoMapper rastreamentoMapper; // Injeção do mapper de Rastreamento

    @Autowired // Construtor para injeção de dependências
    public RastreamentoController(RastreamentoService rastreamentoService, RastreamentoMapper rastreamentoMapper) {
        this.rastreamentoService = rastreamentoService; //
        this.rastreamentoMapper = rastreamentoMapper; //
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todos os rastreamentos com paginação",
            description = "Retorna uma página de todos os rastreamentos cadastrados.", //
            parameters = { // Documentação dos parâmetros de paginação
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: dataHoraRegistro,desc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de rastreamentos retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) // O schema agora é Page
            }
    )
    @GetMapping // Mapeia requisições GET para /api/rastreamentos
    public ResponseEntity<Page<RastreamentoResponseDto>> listarTodosRastreamentos(
            @PageableDefault(size = 10, sort = "dataHoraRegistro") Pageable pageable) { // @PageableDefault define valores padrão, ordenando pelo novo campo
        log.info("Buscando todos os rastreamentos com paginação: {}", pageable); //
        Page<Rastreamento> rastreamentosPage = rastreamentoService.listarTodosRastreamentos(pageable); // Chama o serviço
        Page<RastreamentoResponseDto> rastreamentosDtoPage = rastreamentosPage.map(rastreamentoMapper::toResponseDto); // Mapeia Page de Entidade para Page de DTO
        log.info("Retornando {} rastreamentos na página {} de um total de {} elementos.", rastreamentosDtoPage.getNumberOfElements(), rastreamentosDtoPage.getNumber(), rastreamentosDtoPage.getTotalElements());
        return ResponseEntity.ok(rastreamentosDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Buscar rastreamento por ID", //
            description = "Retorna um rastreamento específico com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Rastreamento encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RastreamentoResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Rastreamento não encontrado") // Tratado pelo GlobalExceptionHandler
            }
    )
    @GetMapping("/{id}") // Mapeia requisições GET para /api/rastreamentos/{id}
    public ResponseEntity<RastreamentoResponseDto> buscarRastreamentoPorId(@PathVariable Long id) { // @PathVariable extrai o ID da URL
        log.info("Buscando rastreamento com ID: {}", id); //
        // ResourceNotFoundException é tratada pelo GlobalExceptionHandler
        RastreamentoResponseDto rastreamento = rastreamentoMapper.toResponseDto(rastreamentoService.buscarRastreamentoPorId(id)); //
        log.info("Rastreamento com ID {} encontrado com sucesso.", id); //
        return ResponseEntity.ok(rastreamento); // Retorna o DTO do rastreamento
    }

    @Operation(
            summary = "Buscar rastreamentos por filtro com paginação", //
            description = "Retorna uma página de rastreamentos que correspondem aos critérios de filtro fornecidos.", //
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string", defaultValue = "dataHoraRegistro,desc"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de rastreamentos filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) //
            }
    )
    @GetMapping("/search") // Mapeia requisições GET para /api/rastreamentos/search
    public ResponseEntity<Page<RastreamentoResponseDto>> buscarRastreamentosPorFiltro(
            RastreamentoFilter filter, // Filtros injetados automaticamente
            @PageableDefault(size = 10, sort = "dataHoraRegistro") Pageable pageable) { // Paginação
        log.info("Buscando rastreamentos com filtro: {} e paginação: {}", filter, pageable); //
        Page<Rastreamento> rastreamentosPage = rastreamentoService.buscarRastreamentosPorFiltro(filter, pageable); // Chama o serviço
        Page<RastreamentoResponseDto> rastreamentosDtoPage = rastreamentosPage.map(rastreamentoMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} rastreamentos filtrados na página {} de {} elementos.", rastreamentosDtoPage.getNumberOfElements(), rastreamentosDtoPage.getNumber(), rastreamentosDtoPage.getTotalElements());
        return ResponseEntity.ok(rastreamentosDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Criar novo rastreamento", //
            description = "Cria um novo rastreamento com os dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "201", description = "Rastreamento criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RastreamentoResponseDto.class))), //
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (coordenadas ausentes)") // Tratado pelo GlobalExceptionHandler (InvalidInputException)
            }
    )
    @PostMapping // Mapeia requisições POST para /api/rastreamentos
    public ResponseEntity<RastreamentoResponseDto> criarRastreamento(@Valid @RequestBody RastreamentoRequestDto rastreamentoRequestDto) { // @Valid valida o DTO
        log.info("Recebida requisição para criar rastreamento: {}", rastreamentoRequestDto); //
        // InvalidInputException é tratada pelo GlobalExceptionHandler
        RastreamentoResponseDto novoRastreamento = rastreamentoMapper.toResponseDto(rastreamentoService.criarRastreamento(rastreamentoRequestDto)); //
        log.info("Rastreamento criado com sucesso com ID: {}", novoRastreamento.getIdRastreamento()); //
        return ResponseEntity.status(HttpStatus.CREATED).body(novoRastreamento); // Retorna 201 CREATED com o DTO do novo rastreamento
    }

    @Operation(
            summary = "Atualizar rastreamento existente", //
            description = "Atualiza um rastreamento existente com base no ID e nos dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Rastreamento atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RastreamentoResponseDto.class))), //
                    // 400 (Dados inválidos) e 404 (Rastreamento não encontrado) são tratados pelo GlobalExceptionHandler
            }
    )
    @PutMapping("/{id}") // Mapeia requisições PUT para /api/rastreamentos/{id}
    public ResponseEntity<RastreamentoResponseDto> atualizarRastreamento(@PathVariable Long id, @Valid @RequestBody RastreamentoRequestDto rastreamentoRequestDto) { //
        log.info("Recebida requisição para atualizar rastreamento com ID {}: {}", id, rastreamentoRequestDto); //
        // ResourceNotFoundException e InvalidInputException são tratadas pelo GlobalExceptionHandler
        RastreamentoResponseDto rastreamentoAtualizado = rastreamentoMapper.toResponseDto(rastreamentoService.atualizarRastreamento(id, rastreamentoRequestDto)); //
        log.info("Rastreamento com ID {} atualizado com sucesso.", id); //
        return ResponseEntity.ok(rastreamentoAtualizado); // Retorna 200 OK com o DTO do rastreamento atualizado
    }

    @Operation(
            summary = "Deletar rastreamento", //
            description = "Exclui um rastreamento com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "204", description = "Rastreamento deletado com sucesso"), //
                    @ApiResponse(responseCode = "404", description = "Rastreamento não encontrado") // Tratado pelo GlobalExceptionHandler
            }
    )
    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/rastreamentos/{id}
    public ResponseEntity<Void> deletarRastreamento(@PathVariable Long id) {
        log.info("Recebida requisição para deletar rastreamento com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        rastreamentoService.deletarRastreamento(id); //
        log.info("Rastreamento com ID {} deletado com sucesso.", id); //
        return ResponseEntity.noContent().build(); // Retorna 204 NO CONTENT
    }
}