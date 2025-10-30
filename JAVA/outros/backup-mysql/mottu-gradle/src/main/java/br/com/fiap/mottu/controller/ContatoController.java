package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.contato.ContatoRequestDto; // DTO para entrada de dados de Contato
import br.com.fiap.mottu.dto.contato.ContatoResponseDto; // DTO para saída de dados de Contato
import br.com.fiap.mottu.filter.ContatoFilter; // Filtros para busca de Contatos
import br.com.fiap.mottu.service.ContatoService; // Serviço com a lógica de negócio para Contatos
import br.com.fiap.mottu.mapper.ContatoMapper; // Mapper para converter entre Entidade e DTOs de Contato
import br.com.fiap.mottu.model.Contato; // Entidade Contato
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

import java.util.List; // Para listagem simples
import java.util.stream.Collectors; // Para mapear lista

@RestController // Marca esta classe como um controller REST
@RequestMapping("/api/contatos") // Mapeia todas as requisições que começam com /api/contatos para este controller
@Tag(name = "Contatos", description = "Gerenciamento de Contatos") // Tag do Swagger
public class ContatoController {

    private static final Logger log = LoggerFactory.getLogger(ContatoController.class); // Logger para esta classe
    private final ContatoService contatoService; // Injeção do serviço de Contato
    private final ContatoMapper contatoMapper; // Injeção do mapper de Contato

    @Autowired // Construtor para injeção de dependências
    public ContatoController(ContatoService contatoService, ContatoMapper contatoMapper) {
        this.contatoService = contatoService; //
        this.contatoMapper = contatoMapper; //
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todos os contatos (sem paginação)",
            description = "Retorna uma lista de todos os contatos cadastrados para uso em formulários e seleções.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de contatos retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = List.class)))
            }
    )
    @GetMapping("/all") // Mapeia requisições GET para /api/contatos/all
    public ResponseEntity<List<ContatoResponseDto>> listarTodosContatos() {
        log.info("Buscando todos os contatos (sem paginação)");
        List<Contato> contatos = contatoService.listarTodosContatos(); // Chama o serviço
        List<ContatoResponseDto> contatosDto = contatos.stream()
                .map(contatoMapper::toResponseDto)
                .collect(Collectors.toList()); // Mapeia lista de Entidade para lista de DTO
        log.info("Retornando {} contatos.", contatosDto.size());
        return ResponseEntity.ok(contatosDto); // Retorna a lista de DTOs
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todos os contatos com paginação",
            description = "Retorna uma página de todos os contatos cadastrados.",
            parameters = { // Documentação dos parâmetros de paginação
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: email,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de contatos retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) // O schema agora é Page
            }
    )
    @GetMapping // Mapeia requisições GET para /api/contatos
    public ResponseEntity<Page<ContatoResponseDto>> listarTodosContatosPaginado(
            @PageableDefault(size = 10, sort = "email") Pageable pageable) { // @PageableDefault define valores padrão
        log.info("Buscando todos os contatos com paginação: {}", pageable); //
        Page<Contato> contatosPage = contatoService.listarTodosContatos(pageable); // Chama o serviço
        Page<ContatoResponseDto> contatosDtoPage = contatosPage.map(contatoMapper::toResponseDto); // Mapeia Page de Entidade para Page de DTO
        log.info("Retornando {} contatos na página {} de um total de {} elementos.", contatosDtoPage.getNumberOfElements(), contatosDtoPage.getNumber(), contatosDtoPage.getTotalElements());
        return ResponseEntity.ok(contatosDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Buscar contato por ID", //
            description = "Retorna um contato específico com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Contato encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ContatoResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Contato não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Contato com ID 1 não encontrado(a).\",\"path\":\"/api/contatos/1\"}"))) //
            }
    )
    @GetMapping("/{id}") // Mapeia requisições GET para /api/contatos/{id}
    public ResponseEntity<ContatoResponseDto> buscarContatoPorId(@PathVariable Long id) { // @PathVariable extrai o ID da URL
        log.info("Buscando contato com ID: {}", id); //
        // ResourceNotFoundException é tratada pelo GlobalExceptionHandler
        ContatoResponseDto contato = contatoMapper.toResponseDto(contatoService.buscarContatoPorId(id)); //
        log.info("Contato com ID {} encontrado com sucesso.", id); //
        return ResponseEntity.ok(contato); // Retorna o DTO do contato
    }

    @Operation(
            summary = "Buscar contatos por filtro com paginação", //
            description = "Retorna uma página de contatos que correspondem aos critérios de filtro fornecidos.", //
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de contatos filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) //
            }
    )
    @GetMapping("/search") // Mapeia requisições GET para /api/contatos/search
    public ResponseEntity<Page<ContatoResponseDto>> buscarContatosPorFiltro(
            ContatoFilter filter, // Filtros injetados automaticamente
            @PageableDefault(size = 10, sort = "email") Pageable pageable) { // Paginação
        log.info("Buscando contatos com filtro: {} e paginação: {}", filter, pageable); //
        Page<Contato> contatosPage = contatoService.buscarContatosPorFiltro(filter, pageable); // Chama o serviço
        Page<ContatoResponseDto> contatosDtoPage = contatosPage.map(contatoMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} contatos filtrados na página {} de {} elementos.", contatosDtoPage.getNumberOfElements(), contatosDtoPage.getNumber(), contatosDtoPage.getTotalElements());
        return ResponseEntity.ok(contatosDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Criar novo contato", //
            description = "Cria um novo contato com os dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "201", description = "Contato criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ContatoResponseDto.class))), //
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"), // Tratado pelo GlobalExceptionHandler (Bean Validation)
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (email duplicado)") // Tratado pelo GlobalExceptionHandler
            }
    )
    @PostMapping // Mapeia requisições POST para /api/contatos
    public ResponseEntity<ContatoResponseDto> criarContato(@Valid @RequestBody ContatoRequestDto contatoRequestDto) { // @Valid valida o DTO
        log.info("Recebida requisição para criar contato: {}", contatoRequestDto); //
        // DuplicatedResourceException é tratada pelo GlobalExceptionHandler
        ContatoResponseDto novoContato = contatoMapper.toResponseDto(contatoService.criarContato(contatoRequestDto)); //
        log.info("Contato criado com sucesso com ID: {}", novoContato.getIdContato()); //
        return ResponseEntity.status(HttpStatus.CREATED).body(novoContato); // Retorna 201 CREATED com o DTO do novo contato
    }

    @Operation(
            summary = "Atualizar contato existente", //
            description = "Atualiza um contato existente com base no ID e nos dados fornecidos.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Contato atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ContatoResponseDto.class))), //
                    // 400, 404, 409 são tratados pelo GlobalExceptionHandler
            }
    )
    @PutMapping("/{id}") // Mapeia requisições PUT para /api/contatos/{id}
    public ResponseEntity<ContatoResponseDto> atualizarContato(@PathVariable Long id, @Valid @RequestBody ContatoRequestDto contatoRequestDto) { //
        log.info("Recebida requisição para atualizar contato com ID {}: {}", id, contatoRequestDto); //
        // ResourceNotFoundException e DuplicatedResourceException são tratadas pelo GlobalExceptionHandler
        ContatoResponseDto contatoAtualizado = contatoMapper.toResponseDto(contatoService.atualizarContato(id, contatoRequestDto)); //
        log.info("Contato com ID {} atualizado com sucesso.", id); //
        return ResponseEntity.ok(contatoAtualizado); // Retorna 200 OK com o DTO do contato atualizado
    }

    @Operation(
            summary = "Deletar contato", //
            description = "Exclui um contato com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "204", description = "Contato deletado com sucesso"), //
                    @ApiResponse(responseCode = "404", description = "Contato não encontrado") // Tratado pelo GlobalExceptionHandler
            }
    )
    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/contatos/{id}
    public ResponseEntity<Void> deletarContato(@PathVariable Long id) {
        log.info("Recebida requisição para deletar contato com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        contatoService.deletarContato(id); //
        log.info("Contato com ID {} deletado com sucesso.", id); //
        return ResponseEntity.noContent().build(); // Retorna 204 NO CONTENT
    }
}