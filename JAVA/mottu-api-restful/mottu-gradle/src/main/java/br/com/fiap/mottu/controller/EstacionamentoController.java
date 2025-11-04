package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.datatable.DataTableRequest;
import br.com.fiap.mottu.dto.datatable.DataTableResponse;
import br.com.fiap.mottu.dto.estacionamento.EstacionamentoRequestDto;
import br.com.fiap.mottu.dto.estacionamento.EstacionamentoResponseDto;
import br.com.fiap.mottu.dto.estacionamento.PlacaRequestDto;
import br.com.fiap.mottu.filter.EstacionamentoFilter;
import br.com.fiap.mottu.service.EstacionamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gerenciamento de Estacionamentos
 * Endpoints para CRUD completo, filtros, paginação e DataTable
 */
@RestController
@RequestMapping("/api/estacionamentos")
@Tag(name = "Estacionamentos", description = "Gerenciamento de Estacionamentos de Veículos")
public class EstacionamentoController {

    private static final Logger log = LoggerFactory.getLogger(EstacionamentoController.class);
    private final EstacionamentoService estacionamentoService;

    @Autowired
    public EstacionamentoController(EstacionamentoService estacionamentoService) {
        this.estacionamentoService = estacionamentoService;
    }

    // ================== LISTAR E BUSCAR ==================

    @Operation(
            summary = "Listar todos os estacionamentos com paginação",
            description = "Retorna uma página de todos os estacionamentos cadastrados (ativos e históricos).",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string", defaultValue = "dataUltimaAtualizacao,desc"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de estacionamentos retornada com sucesso",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
            }
    )
    @GetMapping
    public ResponseEntity<Page<EstacionamentoResponseDto>> listarTodos(
            @PageableDefault(size = 10, sort = "dataUltimaAtualizacao", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        log.info("📋 Listando todos os estacionamentos - página: {}, tamanho: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<EstacionamentoResponseDto> page = estacionamentoService.listarTodos(pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(
            summary = "Listar estacionamentos ativos",
            description = "Retorna uma página de estacionamentos ativos (veículos estacionados no momento).",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de estacionamentos ativos retornada com sucesso")
            }
    )
    @GetMapping("/ativos")
    public ResponseEntity<Page<EstacionamentoResponseDto>> listarAtivos(
            @PageableDefault(size = 10, sort = "dataUltimaAtualizacao", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        log.info("📋 Listando estacionamentos ativos");
        return ResponseEntity.ok(estacionamentoService.listarAtivos(pageable));
    }

    @Operation(
            summary = "Listar todos os estacionamentos ativos (para SSE)",
            description = "Retorna lista completa de estacionamentos ativos para uso em Server-Sent Events.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de estacionamentos ativos retornada com sucesso")
            }
    )
    @GetMapping("/ativos/todos")
    public ResponseEntity<List<EstacionamentoResponseDto>> listarTodosAtivos() {
        log.info("📋 Listando todos os estacionamentos ativos para SSE");
        return ResponseEntity.ok(estacionamentoService.listarTodosAtivos());
    }

    @Operation(
            summary = "Buscar estacionamento por ID",
            description = "Retorna um estacionamento específico pelo ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Estacionamento encontrado"),
                    @ApiResponse(responseCode = "404", description = "Estacionamento não encontrado")
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<EstacionamentoResponseDto> buscarPorId(@PathVariable Long id) {
        log.info("🔍 Buscando estacionamento com ID: {}", id);
        return ResponseEntity.ok(estacionamentoService.buscarPorId(id));
    }

    @Operation(
            summary = "Buscar estacionamentos por filtros",
            description = "Retorna estacionamentos que correspondem aos critérios de filtro fornecidos.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY),
                    @Parameter(name = "sort", description = "Critério de ordenação", in = ParameterIn.QUERY),
                    @Parameter(name = "placa", description = "Filtrar por placa", in = ParameterIn.QUERY),
                    @Parameter(name = "veiculoId", description = "Filtrar por ID do veículo", in = ParameterIn.QUERY),
                    @Parameter(name = "boxId", description = "Filtrar por ID do box", in = ParameterIn.QUERY),
                    @Parameter(name = "patioId", description = "Filtrar por ID do pátio", in = ParameterIn.QUERY),
                    @Parameter(name = "estaEstacionado", description = "Filtrar por status (true/false)", in = ParameterIn.QUERY)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Estacionamentos filtrados retornados com sucesso")
            }
    )
    @GetMapping("/search")
    public ResponseEntity<Page<EstacionamentoResponseDto>> buscarPorFiltro(
            EstacionamentoFilter filter,
            @PageableDefault(size = 10, sort = "dataUltimaAtualizacao", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        log.info("🔍 Buscando estacionamentos com filtro: {}", filter);
        return ResponseEntity.ok(estacionamentoService.buscarPorFiltro(filter, pageable));
    }

    @Operation(
            summary = "Buscar estacionamento ativo por placa",
            description = "Retorna o estacionamento ativo de um veículo pela placa.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Estacionamento encontrado"),
                    @ApiResponse(responseCode = "404", description = "Veículo não está estacionado")
            }
    )
    @GetMapping("/placa/{placa}")
    public ResponseEntity<EstacionamentoResponseDto> buscarAtivoPorPlaca(@PathVariable String placa) {
        log.info("🔍 Buscando estacionamento ativo para placa: {}", placa);
        return ResponseEntity.ok(estacionamentoService.buscarAtivoPorPlaca(placa));
    }

    @Operation(
            summary = "Verificar se veículo está estacionado",
            description = "Verifica se um veículo está estacionado retornando true/false.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Status de estacionamento verificado")
            }
    )
    @GetMapping("/placa/{placa}/verificar")
    public ResponseEntity<Boolean> verificarSeEstaEstacionado(@PathVariable String placa) {
        log.info("🔍 Verificando se placa {} está estacionada", placa);
        return ResponseEntity.ok(estacionamentoService.verificarSeVeiculoEstaEstacionado(placa));
    }

    @Operation(
            summary = "Listar estacionamentos ativos por pátio",
            description = "Retorna lista de estacionamentos ativos em um pátio específico.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de estacionamentos retornada")
            }
    )
    @GetMapping("/patio/{patioId}/ativos")
    public ResponseEntity<List<EstacionamentoResponseDto>> listarAtivosPorPatio(@PathVariable Long patioId) {
        log.info("📋 Listando estacionamentos ativos no pátio: {}", patioId);
        return ResponseEntity.ok(estacionamentoService.listarAtivosPorPatio(patioId));
    }

    @Operation(
            summary = "Buscar histórico de estacionamentos de um veículo",
            description = "Retorna histórico completo de estacionamentos de um veículo.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página", in = ParameterIn.QUERY),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso")
            }
    )
    @GetMapping("/veiculo/{veiculoId}/historico")
    public ResponseEntity<Page<EstacionamentoResponseDto>> buscarHistoricoPorVeiculo(
            @PathVariable Long veiculoId,
            @PageableDefault(size = 20, sort = "dataEntrada", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        log.info("📋 Buscando histórico de estacionamentos do veículo: {}", veiculoId);
        return ResponseEntity.ok(estacionamentoService.buscarHistoricoPorVeiculo(veiculoId, pageable));
    }

    @Operation(
            summary = "Buscar histórico de estacionamentos por placa",
            description = "Retorna histórico completo de estacionamentos de um veículo pela placa.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página", in = ParameterIn.QUERY),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso")
            }
    )
    @GetMapping("/placa/{placa}/historico")
    public ResponseEntity<Page<EstacionamentoResponseDto>> buscarHistoricoPorPlaca(
            @PathVariable String placa,
            @PageableDefault(size = 20, sort = "dataEntrada", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        log.info("📋 Buscando histórico de estacionamentos da placa: {}", placa);
        return ResponseEntity.ok(estacionamentoService.buscarHistoricoPorPlaca(placa, pageable));
    }

    // ================== CRUD OPERATIONS ==================

    @Operation(
            summary = "Estacionar veículo",
            description = "Estaciona um veículo em um box (pode especificar box preferido ou deixar o sistema escolher).",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Veículo estacionado com sucesso"),
                    @ApiResponse(responseCode = "400", description = "Dados inválidos"),
                    @ApiResponse(responseCode = "404", description = "Veículo ou box não encontrado"),
                    @ApiResponse(responseCode = "409", description = "Veículo já está estacionado ou box já está ocupado")
            }
    )
    @PostMapping("/estacionar")
    public ResponseEntity<EstacionamentoResponseDto> estacionarVeiculo(
            @Valid @RequestBody PlacaRequestDto request,
            @Parameter(description = "ID do box preferido (opcional)")
            @RequestParam(required = false) Long boxId,
            @Parameter(description = "ID do pátio preferido para busca automática (opcional, usado apenas se boxId for null)")
            @RequestParam(required = false) Long patioId,
            @Parameter(description = "Observações (opcional)")
            @RequestParam(required = false) String observacoes) {
        log.info("🚗 Estacionando veículo com placa: {}, box preferido: {}, pátio preferido: {}", request.getPlaca(), boxId, patioId);
        EstacionamentoResponseDto estacionamento = estacionamentoService.estacionarVeiculo(
                request.getPlaca(), boxId, patioId, observacoes);
        return ResponseEntity.status(HttpStatus.CREATED).body(estacionamento);
    }

    @Operation(
            summary = "Liberar box específico",
            description = "Libera um box específico (desativa apenas o estacionamento desse box).",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Box liberado com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Box não está ocupado")
            }
    )
    @PostMapping("/liberar/box/{boxId}")
    public ResponseEntity<EstacionamentoResponseDto> liberarPorBoxId(
            @PathVariable Long boxId,
            @Parameter(description = "Observações (opcional)")
            @RequestParam(required = false) String observacoes) {
        log.info("🔓 Liberando box ID: {}", boxId);
        return ResponseEntity.ok(estacionamentoService.liberarPorBoxId(boxId, observacoes));
    }

    @Operation(
            summary = "Liberar veículo",
            description = "Libera TODOS os estacionamentos ativos de um veículo (desativa todos os estacionamentos da placa).",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Veículo liberado com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Veículo não está estacionado")
            }
    )
    @PostMapping("/liberar")
    public ResponseEntity<EstacionamentoResponseDto> liberarVeiculo(
            @Valid @RequestBody PlacaRequestDto request,
            @Parameter(description = "Observações (opcional)")
            @RequestParam(required = false) String observacoes) {
        log.info("🚗 Liberando veículo com placa: {}", request.getPlaca());
        return ResponseEntity.ok(estacionamentoService.liberarVeiculo(request.getPlaca(), observacoes));
    }

    @Operation(
            summary = "Criar estacionamento",
            description = "Cria um novo registro de estacionamento.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Estacionamento criado com sucesso"),
                    @ApiResponse(responseCode = "400", description = "Dados inválidos"),
                    @ApiResponse(responseCode = "409", description = "Conflito (veículo já estacionado ou box ocupado)")
            }
    )
    @PostMapping
    public ResponseEntity<EstacionamentoResponseDto> criar(@Valid @RequestBody EstacionamentoRequestDto dto) {
        log.info("➕ Criando estacionamento: {}", dto);
        EstacionamentoResponseDto estacionamento = estacionamentoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(estacionamento);
    }

    @Operation(
            summary = "Atualizar estacionamento",
            description = "Atualiza um estacionamento existente.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Estacionamento atualizado com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Estacionamento não encontrado")
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<EstacionamentoResponseDto> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EstacionamentoRequestDto dto) {
        log.info("✏️ Atualizando estacionamento ID: {}", id);
        return ResponseEntity.ok(estacionamentoService.atualizar(id, dto));
    }

    @Operation(
            summary = "Deletar estacionamento",
            description = "Deleta um estacionamento (soft delete - marca como inativo se estiver ativo).",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Estacionamento deletado com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Estacionamento não encontrado")
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("🗑️ Deletando estacionamento ID: {}", id);
        estacionamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ================== DATATABLE SUPPORT ==================

    @Operation(
            summary = "Buscar estacionamentos para DataTable",
            description = "Endpoint específico para integração com DataTables (jQuery DataTable).",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Dados retornados no formato DataTable")
            }
    )
    @PostMapping("/datatable")
    public ResponseEntity<DataTableResponse<EstacionamentoResponseDto>> buscarParaDataTable(
            @RequestBody DataTableRequest request,
            @Parameter(description = "Filtros adicionais", in = ParameterIn.QUERY) EstacionamentoFilter filter) {
        log.info("📊 Buscando estacionamentos para DataTable - draw: {}", request.getDraw());
        return ResponseEntity.ok(estacionamentoService.buscarParaDataTable(request, filter));
    }

    // ================== ESTATÍSTICAS ==================

    @Operation(
            summary = "Contar veículos estacionados",
            description = "Retorna o total de veículos estacionados no momento.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Total de estacionados retornado")
            }
    )
    @GetMapping("/estatisticas/total-ativos")
    public ResponseEntity<Long> contarEstacionados() {
        log.info("📊 Contando veículos estacionados");
        return ResponseEntity.ok(estacionamentoService.contarEstacionados());
    }

    @Operation(
            summary = "Contar veículos estacionados por pátio",
            description = "Retorna o total de veículos estacionados em um pátio específico.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Total retornado")
            }
    )
    @GetMapping("/estatisticas/patio/{patioId}/total-ativos")
    public ResponseEntity<Long> contarEstacionadosPorPatio(@PathVariable Long patioId) {
        log.info("📊 Contando veículos estacionados no pátio: {}", patioId);
        return ResponseEntity.ok(estacionamentoService.contarEstacionadosPorPatio(patioId));
    }
}
