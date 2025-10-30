package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.cliente.ClienteRequestDto; // DTO para entrada de dados de Cliente
import br.com.fiap.mottu.dto.cliente.ClienteResponseDto; // DTO para saída de dados de Cliente
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto; // DTO para saída de dados de Veículo
import br.com.fiap.mottu.filter.ClienteFilter; // Filtros para busca de Clientes
import br.com.fiap.mottu.service.ClienteService; // Serviço com a lógica de negócio para Clientes
import br.com.fiap.mottu.mapper.ClienteMapper; // Mapper para converter entre Entidade e DTOs de Cliente
import br.com.fiap.mottu.mapper.VeiculoMapper; // Mapper para Veículo
import br.com.fiap.mottu.model.Cliente; // Entidade Cliente
import br.com.fiap.mottu.model.Veiculo; // Entidade Veículo
// Exceções customizadas são tratadas pelo GlobalExceptionHandler
import br.com.fiap.mottu.exception.DuplicatedResourceException; //
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
import jakarta.validation.Valid; // Para validar DTOs de entrada
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono; // Para programação reativa

import java.util.Set; // Para coleções de Veiculos
import java.util.stream.Collectors; // Para coletar resultados de streams

@RestController // Marca esta classe como um controller REST
@RequestMapping("/api/clientes") // Mapeia todas as requisições que começam com /api/clientes para este controller
@Tag(name = "Clientes", description = "Gerenciamento de Clientes") // Tag do Swagger
public class ClienteController {

    private static final Logger log = LoggerFactory.getLogger(ClienteController.class); // Logger para esta classe
    private final ClienteService clienteService; // Injeção do serviço de Cliente
    private final ClienteMapper clienteMapper; // Injeção do mapper de Cliente
    private final VeiculoMapper veiculoMapper; // Injeção do mapper de Veículo

    @Autowired // Construtor para injeção de dependências
    public ClienteController(ClienteService clienteService, ClienteMapper clienteMapper, VeiculoMapper veiculoMapper) {
        this.clienteService = clienteService; //
        this.clienteMapper = clienteMapper; //
        this.veiculoMapper = veiculoMapper; //
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todos os clientes com paginação",
            description = "Retorna uma página de todos os clientes cadastrados.", //
            parameters = { // Documentação dos parâmetros de paginação
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: nome,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de clientes retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) // O schema agora é Page
            }
    )
    @GetMapping // Mapeia requisições GET para /api/clientes
    public ResponseEntity<Page<ClienteResponseDto>> listarTodosClientes(
            @PageableDefault(size = 10, sort = "nome") Pageable pageable) { // @PageableDefault define valores padrão
        log.info("Buscando todos os clientes com paginação: {}", pageable); //
        Page<Cliente> clientesPage = clienteService.listarTodosClientes(pageable); // Chama o serviço
        Page<ClienteResponseDto> clientesDtoPage = clientesPage.map(clienteMapper::toResponseDto); // Mapeia Page de Entidade para Page de DTO
        log.info("Retornando {} clientes na página {} de um total de {} elementos.", clientesDtoPage.getNumberOfElements(), clientesDtoPage.getNumber(), clientesDtoPage.getTotalElements());
        return ResponseEntity.ok(clientesDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Buscar cliente por ID", //
            description = "Retorna um cliente específico com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Cliente encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ClienteResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Cliente não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Cliente com ID 1 não encontrado(a).\",\"path\":\"/api/clientes/1\"}"))) //
            }
    )
    @GetMapping("/{id}") // Mapeia requisições GET para /api/clientes/{id}
    public ResponseEntity<ClienteResponseDto> buscarClientePorId(@PathVariable Long id) { // @PathVariable extrai o ID da URL
        log.info("Buscando cliente com ID: {}", id); //
        // ResourceNotFoundException é tratada pelo GlobalExceptionHandler
        ClienteResponseDto cliente = clienteMapper.toResponseDto(clienteService.buscarClientePorId(id)); //
        log.info("Cliente com ID {} encontrado com sucesso.", id); //
        return ResponseEntity.ok(cliente); // Retorna o DTO do cliente
    }

    @Operation(
            summary = "Buscar clientes por filtro com paginação", //
            description = "Retorna uma página de clientes que correspondem aos critérios de filtro fornecidos.", //
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
                    // Adicionar documentação dos filtros de ClienteFilter se desejado
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de clientes filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) //
            }
    )
    @GetMapping("/search") // Mapeia requisições GET para /api/clientes/search
    public ResponseEntity<Page<ClienteResponseDto>> buscarClientesPorFiltro(
            ClienteFilter filter, // Filtros injetados automaticamente
            @PageableDefault(size = 10, sort = "nome") Pageable pageable) { // Paginação
        log.info("Buscando clientes com filtro: {} e paginação: {}", filter, pageable); //
        Page<Cliente> clientesPage = clienteService.buscarClientesPorFiltro(filter, pageable); // Chama o serviço
        Page<ClienteResponseDto> clientesDtoPage = clientesPage.map(clienteMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} clientes filtrados na página {} de {} elementos.", clientesDtoPage.getNumberOfElements(), clientesDtoPage.getNumber(), clientesDtoPage.getTotalElements());
        return ResponseEntity.ok(clientesDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Criar novo cliente", //
            description = "Cria um novo cliente com os dados fornecidos, incluindo endereço e contato. Pode criar novos ou associar existentes.", //
            responses = {
                    @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ClienteResponseDto.class))), //
                    // Outras respostas (400, 404, 409) são tratadas pelo GlobalExceptionHandler com base nas exceções lançadas pelo serviço
            }
    )
    @PostMapping // Mapeia requisições POST para /api/clientes
    public Mono<ResponseEntity<ClienteResponseDto>> criarCliente(@Valid @RequestBody ClienteRequestDto clienteRequestDto) { // @Valid valida o DTO
        log.info("Recebida requisição para criar cliente: {}", clienteRequestDto); //
        return clienteService.criarCliente(clienteRequestDto) // Chama o serviço (reativo)
                .map(clienteCriado -> {
                    log.info("Cliente criado com sucesso com ID: {}", clienteCriado.getIdCliente()); //
                    return ResponseEntity.status(HttpStatus.CREATED).body(clienteMapper.toResponseDto(clienteCriado)); //
                })
                // O tratamento de erro reativo no serviço já prepara as exceções para o GlobalExceptionHandler
                // ou retorna Mono.error(excecaoCustomizada)
                .onErrorResume(e -> { // Este onErrorResume é um fallback geral no controller caso o serviço não trate todas as exceções reativamente para o GlobalExceptionHandler
                    if (e instanceof ResourceNotFoundException || e instanceof DuplicatedResourceException || e instanceof InvalidInputException) {
                        // Deixa o GlobalExceptionHandler lidar com essas exceções customizadas específicas
                        return Mono.error(e); //
                    }
                    log.error("Erro inesperado no controller ao criar cliente: {}", e.getMessage(), e); //
                    // Para outras exceções não tratadas explicitamente, pode-se retornar um erro genérico 500 ou uma exceção que o GlobalExceptionHandler pegue
                    return Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado ao processar a requisição.", e));
                });
    }

    @Operation(
            summary = "Atualizar cliente existente", //
            description = "Atualiza um cliente existente com base no ID e nos dados fornecidos. Permite atualizar endereço e contato.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ClienteResponseDto.class))), //
                    // Outras respostas (400, 404, 409) são tratadas pelo GlobalExceptionHandler
            }
    )
    @PutMapping("/{id}") // Mapeia requisições PUT para /api/clientes/{id}
    public Mono<ResponseEntity<ClienteResponseDto>> atualizarCliente(@PathVariable Long id, @Valid @RequestBody ClienteRequestDto clienteRequestDto) {
        log.info("Recebida requisição para atualizar cliente com ID {}: {}", id, clienteRequestDto); //
        return clienteService.atualizarCliente(id, clienteRequestDto) // Chama o serviço (reativo)
                .map(clienteAtualizado -> {
                    log.info("Cliente com ID {} atualizado com sucesso.", id); //
                    return ResponseEntity.ok(clienteMapper.toResponseDto(clienteAtualizado)); //
                })
                .onErrorResume(e -> { // Fallback no controller
                    if (e instanceof ResourceNotFoundException || e instanceof DuplicatedResourceException || e instanceof InvalidInputException) {
                        return Mono.error(e); //
                    }
                    log.error("Erro inesperado no controller ao atualizar cliente com ID {}: {}", id, e.getMessage(), e); //
                    return Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado ao processar a requisição.", e));
                });
    }

    @Operation(
            summary = "Deletar cliente", //
            description = "Exclui um cliente com base no ID fornecido.", //
            responses = {
                    @ApiResponse(responseCode = "204", description = "Cliente deletado com sucesso"), //
                    @ApiResponse(responseCode = "404", description = "Cliente não encontrado") // Tratado pelo GlobalExceptionHandler
            }
    )
    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/clientes/{id}
    public ResponseEntity<Void> deletarCliente(@PathVariable Long id) {
        log.info("Recebida requisição para deletar cliente com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        clienteService.deletarCliente(id); //
        log.info("Cliente com ID {} deletado com sucesso.", id); //
        return ResponseEntity.noContent().build(); // Retorna 204 NO CONTENT
    }

    @Operation(
            summary = "Associar veículo a um cliente", //
            description = "Associa um veículo existente a um cliente existente. Requer os IDs do cliente, seu endereço e contato atuais, e o ID do veículo.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Associação criada com sucesso", content = @Content(schema = @Schema(type="string"))), //
                    // 404 (Cliente, Veículo, Endereço ou Contato não encontrado) e 409 (Associação já existe) são tratados pelo GlobalExceptionHandler
            }
    )
    @PostMapping("/{clienteId}/enderecos/{enderecoId}/contatos/{contatoId}/veiculos/{veiculoId}/associar")
    public ResponseEntity<String> associarClienteVeiculo(
            @PathVariable Long clienteId,
            @PathVariable Long enderecoId, // ID do endereço ATUALMENTE associado ao cliente
            @PathVariable Long contatoId,  // ID do contato ATUALMENTE associado ao cliente
            @PathVariable Long veiculoId) {
        log.info("Associando veículo ID {} ao cliente ID {} (com Endereco ID: {}, Contato ID: {}).", veiculoId, clienteId, enderecoId, contatoId); //
        // Exceções são tratadas pelo GlobalExceptionHandler
        clienteService.associarClienteVeiculo(clienteId, enderecoId, contatoId, veiculoId); //
        log.info("Associação entre Cliente {}, Endereco {}, Contato {} e Veículo {} criada com sucesso.", clienteId, enderecoId, contatoId, veiculoId); //
        return ResponseEntity.status(HttpStatus.CREATED).body("Associação criada com sucesso."); //
    }

    @Operation(
            summary = "Desassociar veículo de um cliente", //
            description = "Remove a associação entre um veículo e um cliente. Requer os IDs do cliente, seu endereço e contato atuais, e o ID do veículo.", //
            responses = {
                    @ApiResponse(responseCode = "204", description = "Associação removida com sucesso"), //
                    // 404 (Associação não encontrada) é tratada pelo GlobalExceptionHandler
            }
    )
    @DeleteMapping("/{clienteId}/enderecos/{enderecoId}/contatos/{contatoId}/veiculos/{veiculoId}/desassociar")
    public ResponseEntity<Void> desassociarClienteVeiculo(
            @PathVariable Long clienteId,
            @PathVariable Long enderecoId, // ID do endereço usado na chave da associação
            @PathVariable Long contatoId,  // ID do contato usado na chave da associação
            @PathVariable Long veiculoId) { //
        log.info("Desassociando veículo ID {} do cliente ID {} (com Endereco ID: {}, Contato ID: {}).", veiculoId, clienteId, enderecoId, contatoId); //
        // ResourceNotFoundException é tratada pelo GlobalExceptionHandler
        clienteService.desassociarClienteVeiculo(clienteId, enderecoId, contatoId, veiculoId); //
        log.info("Associação entre Cliente {}, Endereco {}, Contato {} e Veículo {} removida com sucesso.", clienteId, enderecoId, contatoId, veiculoId); //
        return ResponseEntity.noContent().build(); //
    }

    @Operation(
            summary = "Listar veículos de um cliente", //
            description = "Retorna todos os veículos associados a um cliente específico.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Veículos do cliente retornados com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoResponseDto.class))), // O Swagger pode mostrar um array aqui.
                    @ApiResponse(responseCode = "404", description = "Cliente não encontrado") // Tratado pelo GlobalExceptionHandler
            }
    )
    @GetMapping("/{clienteId}/veiculos") // Mapeia GET para /api/clientes/{clienteId}/veiculos
    public ResponseEntity<Set<VeiculoResponseDto>> getVeiculosByClienteId(@PathVariable Long clienteId) {
        log.info("Buscando veículos associados ao cliente com ID: {}", clienteId); //
        // ResourceNotFoundException é tratada pelo GlobalExceptionHandler
        Set<Veiculo> veiculos = clienteService.getVeiculosByClienteId(clienteId); //
        Set<VeiculoResponseDto> veiculosDto = veiculos.stream()
                .map(veiculoMapper::toResponseDto) // Mapeia cada veículo para seu DTO
                .collect(Collectors.toSet()); //
        log.info("Retornando {} veículos para o cliente com ID {}.", veiculosDto.size(), clienteId); //
        return ResponseEntity.ok(veiculosDto); // Retorna o conjunto de DTOs de veículos
    }
}