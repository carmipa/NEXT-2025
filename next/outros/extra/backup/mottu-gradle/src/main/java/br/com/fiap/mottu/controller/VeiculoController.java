package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.veiculo.VeiculoRequestDto; // DTO para entrada de dados de Veículo
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto; // DTO para saída de dados de Veículo
import br.com.fiap.mottu.dto.veiculo.VeiculoLocalizacaoResponseDto; // DTO para resposta de localização de Veículo
import br.com.fiap.mottu.filter.VeiculoFilter; // Filtros para busca de Veículos
import br.com.fiap.mottu.service.VeiculoService; // Serviço com a lógica de negócio para Veículos
import br.com.fiap.mottu.mapper.VeiculoMapper; // Mapper para converter entre Entidade e DTOs de Veículo
import br.com.fiap.mottu.model.Veiculo; // Entidade Veiculo
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.exception.ResourceNotFoundException;

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

@RestController
@RequestMapping("/api/veiculos")
@Tag(name = "Veiculos", description = "Gerenciamento de Veículos, incluindo Rastreamento e Localização")
public class VeiculoController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoController.class);
    private final VeiculoService veiculoService;
    private final VeiculoMapper veiculoMapper;
    private final VeiculoRepository veiculoRepository; // Injetado para o novo endpoint

    @Autowired
    public VeiculoController(VeiculoService veiculoService, VeiculoMapper veiculoMapper, VeiculoRepository veiculoRepository) {
        this.veiculoService = veiculoService;
        this.veiculoMapper = veiculoMapper;
        this.veiculoRepository = veiculoRepository;
    }

    @Operation(
            summary = "Listar todos os veículos com paginação",
            description = "Retorna uma página de todos os veículos cadastrados.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "20")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: placa,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de veículos retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            }
    )
    @GetMapping
    public ResponseEntity<Page<VeiculoResponseDto>> listarTodosVeiculos(
            @PageableDefault(size = 10, sort = "placa") Pageable pageable) {
        log.info("Buscando todos os veículos com paginação: {}", pageable);
        Page<Veiculo> veiculosPage = veiculoService.listarTodosVeiculos(pageable);
        Page<VeiculoResponseDto> veiculosDtoPage = veiculosPage.map(veiculoMapper::toResponseDto);
        log.info("Retornando {} veículos na página {} de um total de {} elementos.", veiculosDtoPage.getNumberOfElements(), veiculosDtoPage.getNumber(), veiculosDtoPage.getTotalElements());
        return ResponseEntity.ok(veiculosDtoPage);
    }

    @Operation(
            summary = "Buscar veículo por ID",
            description = "Retorna um veículo específico com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Veículo encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoResponseDto.class))),
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Veículo com ID 1 não encontrado(a).\",\"path\":\"/api/veiculos/1\"}")))
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<VeiculoResponseDto> buscarVeiculoPorId(@PathVariable Long id) {
        log.info("Buscando veículo com ID: {}", id);
        VeiculoResponseDto veiculo = veiculoMapper.toResponseDto(veiculoService.buscarVeiculoPorId(id));
        log.info("Veículo com ID {} encontrado com sucesso.", id);
        return ResponseEntity.ok(veiculo);
    }

    @Operation(
            summary = "Buscar veículos por filtro com paginação",
            description = "Retorna uma página de veículos que correspondem aos critérios de filtro fornecidos.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de veículos filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            }
    )
    @GetMapping("/search")
    public ResponseEntity<Page<VeiculoResponseDto>> buscarVeiculosPorFiltro(
            VeiculoFilter filter,
            @PageableDefault(size = 10) Pageable pageable) {
        log.info("Buscando veículos com filtro: {} e paginação: {}", filter, pageable);
        Page<Veiculo> veiculosPage = veiculoService.buscarVeiculosPorFiltro(filter, pageable);
        Page<VeiculoResponseDto> veiculosDtoPage = veiculosPage.map(veiculoMapper::toResponseDto);
        log.info("Retornando {} veículos filtrados na página {} de {} elementos.", veiculosDtoPage.getNumberOfElements(), veiculosDtoPage.getNumber(), veiculosDtoPage.getTotalElements());
        return ResponseEntity.ok(veiculosDtoPage);
    }

    @Operation(
            summary = "Criar novo veículo",
            description = "Cria um novo veículo com os dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Veículo criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoResponseDto.class))),
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":400,\"error\":\"Requisição Inválida\",\"message\":\"Mensagem de validação ou erro de input.\",\"path\":\"/api/veiculos\"}"))),
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (placa, RENAVAM ou chassi duplicado)",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":409,\"error\":\"Conflito de Dados\",\"message\":\"Veículo com placa 'ABC1234' já existe.\",\"path\":\"/api/veiculos\"}")))
            }
    )
    @PostMapping
    public ResponseEntity<VeiculoResponseDto> criarVeiculo(@Valid @RequestBody VeiculoRequestDto veiculoRequestDto) {
        log.info("Recebida requisição para criar veículo: {}", veiculoRequestDto);
        VeiculoResponseDto novoVeiculo = veiculoMapper.toResponseDto(veiculoService.criarVeiculo(veiculoRequestDto));
        log.info("Veículo criado com sucesso com ID: {}", novoVeiculo.getIdVeiculo());
        return ResponseEntity.status(HttpStatus.CREATED).body(novoVeiculo);
    }

    @Operation(
            summary = "Atualizar veículo existente",
            description = "Atualiza um veículo existente com base no ID e nos dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Veículo atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoResponseDto.class))),
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (placa, RENAVAM ou chassi duplicado)")
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<VeiculoResponseDto> atualizarVeiculo(@PathVariable Long id, @Valid @RequestBody VeiculoRequestDto veiculoRequestDto) {
        log.info("Recebida requisição para atualizar veículo com ID {}: {}", id, veiculoRequestDto);
        VeiculoResponseDto veiculoAtualizado = veiculoMapper.toResponseDto(veiculoService.atualizarVeiculo(id, veiculoRequestDto));
        log.info("Veículo com ID {} atualizado com sucesso.", id);
        return ResponseEntity.ok(veiculoAtualizado);
    }

    @Operation(
            summary = "Deletar veículo",
            description = "Exclui um veículo com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Veículo deletado com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado")
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVeiculo(@PathVariable Long id) {
        log.info("Recebida requisição para deletar veículo com ID: {}", id);
        veiculoService.deletarVeiculo(id);
        log.info("Veículo com ID {} deletado com sucesso.", id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Obter localização de um veículo por ID",
            description = "Retorna o último ponto de rastreamento de um veículo e suas associações atuais com Pátio, Zona e Box.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Localização do veículo retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoLocalizacaoResponseDto.class))),
                    @ApiResponse(responseCode = "404", description = "Veículo não encontrado")
            }
    )
    @GetMapping("/{id}/localizacao")
    public ResponseEntity<VeiculoLocalizacaoResponseDto> getLocalizacaoVeiculo(@PathVariable Long id) {
        log.info("Buscando localização para o veículo com ID: {}", id);
        VeiculoLocalizacaoResponseDto localizacao = veiculoService.getLocalizacaoVeiculo(id);
        log.info("Localização do veículo com ID {} encontrada com sucesso.", id);
        return ResponseEntity.ok(localizacao);
    }

    // NOVO ENDPOINT
    @Operation(
            summary = "Obter localização de um veículo por PLACA",
            description = "Busca um veículo pela placa e retorna seu último ponto de rastreamento e associações atuais.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Localização do veículo retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = VeiculoLocalizacaoResponseDto.class))),
                    @ApiResponse(responseCode = "404", description = "Veículo com a placa fornecida não encontrado")
            }
    )
    @GetMapping("/localizacao-por-placa")
    public ResponseEntity<VeiculoLocalizacaoResponseDto> getLocalizacaoPorPlaca(@RequestParam String placa) {
        log.info("Buscando localização para o veículo com PLACA: {}", placa);
        Veiculo veiculo = veiculoRepository.findByPlaca(placa)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", "placa", placa));
        VeiculoLocalizacaoResponseDto localizacao = veiculoService.getLocalizacaoVeiculo(veiculo.getIdVeiculo());
        log.info("Localização do veículo com PLACA {} encontrada com sucesso.", placa);
        return ResponseEntity.ok(localizacao);
    }
}
