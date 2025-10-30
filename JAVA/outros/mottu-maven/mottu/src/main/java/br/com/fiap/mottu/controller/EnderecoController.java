package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto; // DTO para entrada de dados de Endereço
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto; // DTO para saída de dados de Endereço
import br.com.fiap.mottu.filter.EnderecoFilter; // Filtros para busca de Endereços
import br.com.fiap.mottu.service.EnderecoService; // Serviço com a lógica de negócio para Endereços
import br.com.fiap.mottu.mapper.EnderecoMapper; // Mapper para converter entre Entidade e DTOs de Endereço
import br.com.fiap.mottu.model.Endereco; // Entidade Endereco
// Exceções customizadas
import br.com.fiap.mottu.exception.ResourceNotFoundException; //
import br.com.fiap.mottu.exception.InvalidInputException; //


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
import org.springframework.web.server.ResponseStatusException; // Para lançar exceções HTTP específicas
import jakarta.validation.Valid; // Para validar DTOs de entrada
import reactor.core.publisher.Mono; // Para programação reativa (ViaCEP)

// import java.util.List; // Não mais usado para listagem principal
// import java.util.stream.Collectors; // Não mais usado para mapear lista manualmente

@RestController // Marca esta classe como um controller REST
@RequestMapping("/api/enderecos") // Mapeia todas as requisições que começam com /api/enderecos para este controller
@Tag(name = "Enderecos", description = "Gerenciamento de Endereços") // Tag do Swagger
public class EnderecoController {

    private static final Logger log = LoggerFactory.getLogger(EnderecoController.class); // Logger para esta classe
    private final EnderecoService enderecoService; // Injeção do serviço de Endereço
    private final EnderecoMapper enderecoMapper; // Injeção do mapper de Endereço

    @Autowired // Construtor para injeção de dependências
    public EnderecoController(EnderecoService enderecoService, EnderecoMapper enderecoMapper) {
        this.enderecoService = enderecoService; //
        this.enderecoMapper = enderecoMapper; //
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todos os endereços com paginação",
            description = "Retorna uma página de todos os endereços cadastrados.", //
            parameters = { // Documentação dos parâmetros de paginação
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: cep,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de endereços retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) // O schema agora é Page
            }
    )
    @GetMapping // Mapeia requisições GET para /api/enderecos
    public ResponseEntity<Page<EnderecoResponseDto>> listarTodosEnderecos(
            @PageableDefault(size = 10, sort = "cep") Pageable pageable) { // @PageableDefault define valores padrão
        log.info("Buscando todos os endereços com paginação: {}", pageable); //
        Page<Endereco> enderecosPage = enderecoService.listarTodosEnderecos(pageable); // Chama o serviço
        Page<EnderecoResponseDto> enderecosDtoPage = enderecosPage.map(enderecoMapper::toResponseDto); // Mapeia Page de Entidade para Page de DTO
        log.info("Retornando {} endereços na página {} de um total de {} elementos.", enderecosDtoPage.getNumberOfElements(), enderecosDtoPage.getNumber(), enderecosDtoPage.getTotalElements());
        return ResponseEntity.ok(enderecosDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Buscar endereço por ID", //
            description = "Retorna um endereço específico com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Endereço encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = EnderecoResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Endereço não encontrado") // Tratado pelo GlobalExceptionHandler
            }
    )
    @GetMapping("/{id}") // Mapeia requisições GET para /api/enderecos/{id}
    public ResponseEntity<EnderecoResponseDto> buscarEnderecoPorId(@PathVariable Long id) { // @PathVariable extrai o ID da URL
        log.info("Buscando endereço com ID: {}", id); //
        // ResourceNotFoundException é tratada pelo GlobalExceptionHandler
        EnderecoResponseDto endereco = enderecoMapper.toResponseDto(enderecoService.buscarEnderecoPorId(id)); //
        log.info("Endereço com ID {} encontrado com sucesso.", id); //
        return ResponseEntity.ok(endereco); // Retorna o DTO do endereço
    }

    @Operation(
            summary = "Buscar endereços por filtro com paginação", //
            description = "Retorna uma página de endereços que correspondem aos critérios de filtro fornecidos.", //
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de endereços filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) //
            }
    )
    @GetMapping("/search") // Mapeia requisições GET para /api/enderecos/search
    public ResponseEntity<Page<EnderecoResponseDto>> buscarEnderecosPorFiltro(
            EnderecoFilter filter, // Filtros injetados automaticamente
            @PageableDefault(size = 10, sort = "cep") Pageable pageable) { // Paginação
        log.info("Buscando endereços com filtro: {} e paginação: {}", filter, pageable); //
        Page<Endereco> enderecosPage = enderecoService.buscarEnderecosPorFiltro(filter, pageable); // Chama o serviço (método adicionado no service)
        Page<EnderecoResponseDto> enderecosDtoPage = enderecosPage.map(enderecoMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} endereços filtrados na página {} de {} elementos.", enderecosDtoPage.getNumberOfElements(), enderecosDtoPage.getNumber(), enderecosDtoPage.getTotalElements());
        return ResponseEntity.ok(enderecosDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Criar novo endereço", //
            description = "Cria um novo endereço com os dados fornecidos, buscando informações de CEP na ViaCEP.", //
            responses = {
                    @ApiResponse(responseCode = "201", description = "Endereço criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = EnderecoResponseDto.class))), //
                    // 400 (CEP inválido/não fornecido) e 404 (CEP não encontrado no ViaCEP) são tratados pelo serviço/GlobalExceptionHandler
            }
    )
    @PostMapping // Mapeia requisições POST para /api/enderecos
    public Mono<ResponseEntity<EnderecoResponseDto>> criarEndereco(@Valid @RequestBody EnderecoRequestDto enderecoRequestDto) { // @Valid valida o DTO
        log.info("Recebida requisição para criar endereço: {}", enderecoRequestDto); //
        return enderecoService.criarEndereco(enderecoRequestDto) // Chama o serviço (reativo)
                .map(enderecoCriado -> {
                    log.info("Endereço criado com sucesso com ID: {}", enderecoCriado.getIdEndereco()); //
                    return ResponseEntity.status(HttpStatus.CREATED).body(enderecoMapper.toResponseDto(enderecoCriado)); //
                })
                .onErrorResume(e -> { // Tratamento de erro reativo no controller
                    if (e instanceof ResourceNotFoundException || e instanceof InvalidInputException) {
                        return Mono.error(e); // Deixa o GlobalExceptionHandler lidar
                    }
                    log.error("Erro inesperado no controller ao criar endereço: {}", e.getMessage(), e); //
                    return Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado ao processar a requisição.", e));
                });
    }

    @Operation(
            summary = "Atualizar endereço existente", //
            description = "Atualiza um endereço existente com base no ID e nos dados fornecidos. Pode buscar informações de CEP na ViaCEP se o CEP for alterado.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Endereço atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = EnderecoResponseDto.class))), //
                    // 400, 404 são tratados pelo serviço/GlobalExceptionHandler
            }
    )
    @PutMapping("/{id}") // Mapeia requisições PUT para /api/enderecos/{id}
    public Mono<ResponseEntity<EnderecoResponseDto>> atualizarEndereco(@PathVariable Long id, @Valid @RequestBody EnderecoRequestDto enderecoRequestDto) { //
        log.info("Recebida requisição para atualizar endereço com ID {}: {}", id, enderecoRequestDto); //
        return enderecoService.atualizarEndereco(id, enderecoRequestDto) // Chama o serviço (reativo)
                .map(enderecoAtualizado -> {
                    log.info("Endereço com ID {} atualizado com sucesso.", id); //
                    return ResponseEntity.ok(enderecoMapper.toResponseDto(enderecoAtualizado)); //
                })
                .onErrorResume(e -> { // Tratamento de erro reativo no controller
                    if (e instanceof ResourceNotFoundException || e instanceof InvalidInputException) {
                        return Mono.error(e); // Deixa o GlobalExceptionHandler lidar
                    }
                    log.error("Erro inesperado no controller ao atualizar endereço com ID {}: {}", id, e.getMessage(), e); //
                    return Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado ao processar a requisição.", e));
                });
    }

    @Operation(
            summary = "Deletar endereço", //
            description = "Exclui um endereço com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "204", description = "Endereço deletado com sucesso"), //
                    @ApiResponse(responseCode = "404", description = "Endereço não encontrado") // Tratado pelo GlobalExceptionHandler
            }
    )
    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/enderecos/{id}
    public ResponseEntity<Void> deletarEndereco(@PathVariable Long id) {
        log.info("Recebida requisição para deletar endereço com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        enderecoService.deletarEndereco(id); //
        log.info("Endereço com ID {} deletado com sucesso.", id); //
        return ResponseEntity.noContent().build(); // Retorna 204 NO CONTENT
    }
}