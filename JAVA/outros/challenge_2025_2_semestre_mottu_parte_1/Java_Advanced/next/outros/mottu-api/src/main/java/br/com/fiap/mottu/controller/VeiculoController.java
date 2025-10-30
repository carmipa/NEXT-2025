package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.veiculo.VeiculoRequestDto; // DTO para entrada de dados de Veículo
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto; // DTO para saída de dados de Veículo
import br.com.fiap.mottu.dto.veiculo.VeiculoLocalizacaoResponseDto; // DTO para resposta de localização de Veículo
import br.com.fiap.mottu.filter.VeiculoFilter; // Filtros para busca de Veículos
import br.com.fiap.mottu.service.VeiculoService; // Serviço com a lógica de negócio para Veículos
import br.com.fiap.mottu.mapper.VeiculoMapper; // Mapper para converter entre Entidade e DTOs de Veículo
import br.com.fiap.mottu.model.Veiculo; // Entidade Veiculo
// Exceções customizadas são tratadas pelo GlobalExceptionHandler, não precisam ser capturadas aqui para re-lançar
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

// Não há mais 'List' sendo retornado para listagens, agora é 'Page'
// import java.util.List;
// import java.util.stream.Collectors;

@RestController // Marca esta classe como um controller REST, os retornos dos métodos são diretamente ligados ao corpo da resposta HTTP
@RequestMapping("/api/veiculos") // Mapeia todas as requisições que começam com /api/veiculos para este controller
@Tag(name = "Veiculos", description = "Gerenciamento de Veículos, incluindo Rastreamento e Localização") // Tag do Swagger para agrupar endpoints de Veículo
public class VeiculoController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoController.class); // Logger para esta classe
    private final VeiculoService veiculoService; // Injeção do serviço de Veículo
    private final VeiculoMapper veiculoMapper; // Injeção do mapper de Veículo

    @Autowired // Construtor para injeção de dependências
    public VeiculoController(VeiculoService veiculoService,
                             VeiculoMapper veiculoMapper) {
        this.veiculoService = veiculoService;
        this.veiculoMapper = veiculoMapper; //
    }

    @Operation( // Documentação da operação via Swagger
            summary = "Listar todos os veículos com paginação",
            description = "Retorna uma página de todos os veículos cadastrados.",
            parameters = { // Documentação dos parâmetros de paginação
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "20")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: placa,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = { // Documentação das possíveis respostas
                    @ApiResponse(responseCode = "200", description = "Página de veículos retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) // O schema agora é Page, não uma lista direta de VeiculoResponseDto
            }
    )
    @GetMapping // Mapeia requisições GET para /api/veiculos
    public ResponseEntity<Page<VeiculoResponseDto>> listarTodosVeiculos(
            @PageableDefault(size = 10, sort = "placa") Pageable pageable) { // @PageableDefault define valores padrão para paginação
        log.info("Buscando todos os veículos com paginação: {}", pageable);
        Page<Veiculo> veiculosPage = veiculoService.listarTodosVeiculos(pageable); // Chama o serviço para obter a página de entidades
        Page<VeiculoResponseDto> veiculosDtoPage = veiculosPage.map(veiculoMapper::toResponseDto); // Mapeia a Page de Entidades para Page de DTOs
        log.info("Retornando {} veículos na página {} de um total de {} elementos.", veiculosDtoPage.getNumberOfElements(), veiculosDtoPage.getNumber(), veiculosDtoPage.getTotalElements());
        return ResponseEntity.ok(veiculosDtoPage); // Retorna a página de DTOs com status 200 OK
    }

    @Operation(
            summary = "Buscar veículo por ID",
            description = "Retorna um veículo específico com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Veículo encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Veículo com ID 1 não encontrado(a).\",\"path\":\"/api/veiculos/1\"}"))) //
            }
    )
    @GetMapping("/{id}") // Mapeia requisições GET para /api/veiculos/{id}
    public ResponseEntity<VeiculoResponseDto> buscarVeiculoPorId(@PathVariable Long id) { // @PathVariable extrai o ID da URL
        log.info("Buscando veículo com ID: {}", id); //
        // A exceção ResourceNotFoundException será lançada pelo serviço e tratada pelo GlobalExceptionHandler
        VeiculoResponseDto veiculo = veiculoMapper.toResponseDto(veiculoService.buscarVeiculoPorId(id));
        log.info("Veículo com ID {} encontrado com sucesso.", id); //
        return ResponseEntity.ok(veiculo); // Retorna o DTO do veículo com status 200 OK
    }

    @Operation(
            summary = "Buscar veículos por filtro com paginação",
            description = "Retorna uma página de veículos que correspondem aos critérios de filtro fornecidos.",
            parameters = { // Documentação dos parâmetros de paginação e filtro
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
                    // Adicionar aqui a documentação dos campos do VeiculoFilter se necessário, usando @Parameter com schema
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de veículos filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class))) //
            }
    )
    @GetMapping("/search") // Mapeia requisições GET para /api/veiculos/search
    public ResponseEntity<Page<VeiculoResponseDto>> buscarVeiculosPorFiltro(
            VeiculoFilter filter, // Os parâmetros do filtro são injetados automaticamente
            @PageableDefault(size = 10) Pageable pageable) { // Parâmetros de paginação
        log.info("Buscando veículos com filtro: {} e paginação: {}", filter, pageable); //
        Page<Veiculo> veiculosPage = veiculoService.buscarVeiculosPorFiltro(filter, pageable); // Chama o serviço
        Page<VeiculoResponseDto> veiculosDtoPage = veiculosPage.map(veiculoMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} veículos filtrados na página {} de {} elementos.", veiculosDtoPage.getNumberOfElements(), veiculosDtoPage.getNumber(), veiculosDtoPage.getTotalElements());
        return ResponseEntity.ok(veiculosDtoPage); // Retorna a página de DTOs
    }

    @Operation(
            summary = "Criar novo veículo",
            description = "Cria um novo veículo com os dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Veículo criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoResponseDto.class))), //
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":400,\"error\":\"Requisição Inválida\",\"message\":\"Mensagem de validação ou erro de input.\",\"path\":\"/api/veiculos\"}"))), //
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (placa, RENAVAM ou chassi duplicado)",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":409,\"error\":\"Conflito de Dados\",\"message\":\"Veículo com placa 'ABC1234' já existe.\",\"path\":\"/api/veiculos\"}"))) //
            }
    )
    @PostMapping // Mapeia requisições POST para /api/veiculos
    public ResponseEntity<VeiculoResponseDto> criarVeiculo(@Valid @RequestBody VeiculoRequestDto veiculoRequestDto) { // @Valid valida o DTO, @RequestBody pega os dados do corpo da requisição
        log.info("Recebida requisição para criar veículo: {}", veiculoRequestDto); //
        // Exceções como DuplicatedResourceException são lançadas pelo serviço e tratadas pelo GlobalExceptionHandler
        VeiculoResponseDto novoVeiculo = veiculoMapper.toResponseDto(veiculoService.criarVeiculo(veiculoRequestDto));
        log.info("Veículo criado com sucesso com ID: {}", novoVeiculo.getIdVeiculo()); //
        return ResponseEntity.status(HttpStatus.CREATED).body(novoVeiculo); // Retorna 201 CREATED com o DTO do novo veículo
    }

    @Operation(
            summary = "Atualizar veículo existente",
            description = "Atualiza um veículo existente com base no ID e nos dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Veículo atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoResponseDto.class))), //
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":400,\"error\":\"Requisição Inválida\",\"message\":\"Mensagem de validação ou erro de input.\",\"path\":\"/api/veiculos/1\"}"))), //
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Veículo com ID 1 não encontrado(a).\",\"path\":\"/api/veiculos/1\"}"))), //
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (placa, RENAVAM ou chassi duplicado)",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":409,\"error\":\"Conflito de Dados\",\"message\":\"Veículo com placa 'ABC1234' já existe.\",\"path\":\"/api/veiculos/1\"}"))) //
            }
    )
    @PutMapping("/{id}") // Mapeia requisições PUT para /api/veiculos/{id}
    public ResponseEntity<VeiculoResponseDto> atualizarVeiculo(@PathVariable Long id, @Valid @RequestBody VeiculoRequestDto veiculoRequestDto) {
        log.info("Recebida requisição para atualizar veículo com ID {}: {}", id, veiculoRequestDto); //
        // Exceções como ResourceNotFoundException e DuplicatedResourceException são tratadas pelo GlobalExceptionHandler
        VeiculoResponseDto veiculoAtualizado = veiculoMapper.toResponseDto(veiculoService.atualizarVeiculo(id, veiculoRequestDto));
        log.info("Veículo com ID {} atualizado com sucesso.", id); //
        return ResponseEntity.ok(veiculoAtualizado); // Retorna 200 OK com o DTO do veículo atualizado
    }

    @Operation(
            summary = "Deletar veículo",
            description = "Exclui um veículo com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Veículo deletado com sucesso"), //
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Veículo com ID 1 não encontrado(a).\",\"path\":\"/api/veiculos/1\"}"))) //
            }
    )
    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/veiculos/{id}
    public ResponseEntity<Void> deletarVeiculo(@PathVariable Long id) {
        log.info("Recebida requisição para deletar veículo com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        veiculoService.deletarVeiculo(id);
        log.info("Veículo com ID {} deletado com sucesso.", id); //
        return ResponseEntity.noContent().build(); // Retorna 204 NO CONTENT
    }

    @Operation(
            summary = "Obter localização de um veículo",
            description = "Retorna o último ponto de rastreamento de um veículo e suas associações atuais com Pátio, Zona e Box.", //
            responses = {
                    @ApiResponse(responseCode = "200", description = "Localização do veículo retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoLocalizacaoResponseDto.class))), //
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Veículo com ID 1 não encontrado(a).\",\"path\":\"/api/veiculos/1/localizacao\"}"))) //
            }
    )
    @GetMapping("/{id}/localizacao") // Mapeia requisições GET para /api/veiculos/{id}/localizacao
    public ResponseEntity<VeiculoLocalizacaoResponseDto> getLocalizacaoVeiculo(@PathVariable Long id) { //
        log.info("Buscando localização para o veículo com ID: {}", id); //
        // ResourceNotFoundException será tratada pelo GlobalExceptionHandler
        VeiculoLocalizacaoResponseDto localizacao = veiculoService.getLocalizacaoVeiculo(id);
        log.info("Localização do veículo com ID {} encontrada com sucesso.", id); //
        return ResponseEntity.ok(localizacao); // Retorna 200 OK com o DTO de localização
    }
}