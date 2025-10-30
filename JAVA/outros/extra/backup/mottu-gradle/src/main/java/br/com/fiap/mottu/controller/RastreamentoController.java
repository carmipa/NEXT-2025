package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.rastreamento.RastreamentoRequestDto;
import br.com.fiap.mottu.dto.rastreamento.RastreamentoResponseDto;
import br.com.fiap.mottu.filter.RastreamentoFilter;
import br.com.fiap.mottu.service.RastreamentoService;
import br.com.fiap.mottu.mapper.RastreamentoMapper;
import br.com.fiap.mottu.model.Rastreamento;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rastreamentos")
@Tag(name = "Rastreamentos", description = "Gerenciamento de Rastreamentos")
public class RastreamentoController {

    private static final Logger log = LoggerFactory.getLogger(RastreamentoController.class);
    private final RastreamentoService rastreamentoService;
    private final RastreamentoMapper rastreamentoMapper;

    @Autowired
    public RastreamentoController(RastreamentoService rastreamentoService, RastreamentoMapper rastreamentoMapper) {
        this.rastreamentoService = rastreamentoService;
        this.rastreamentoMapper = rastreamentoMapper;
    }

    @Operation(
            summary = "Listar todos os rastreamentos com paginação",
            description = "Retorna uma página de todos os rastreamentos cadastrados.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: dataHoraRegistro,desc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de rastreamentos retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            }
    )
    @GetMapping
    public ResponseEntity<Page<RastreamentoResponseDto>> listarTodosRastreamentos(
            @PageableDefault(size = 10, sort = "dataHoraRegistro") Pageable pageable) {
        log.info("Buscando todos os rastreamentos com paginação: {}", pageable);
        Page<Rastreamento> rastreamentosPage = rastreamentoService.listarTodosRastreamentos(pageable);
        Page<RastreamentoResponseDto> rastreamentosDtoPage = rastreamentosPage.map(rastreamentoMapper::toResponseDto);
        log.info("Retornando {} rastreamentos na página {} de um total de {} elementos.", rastreamentosDtoPage.getNumberOfElements(), rastreamentosDtoPage.getNumber(), rastreamentosDtoPage.getTotalElements());
        return ResponseEntity.ok(rastreamentosDtoPage);
    }

    @Operation(
            summary = "Buscar rastreamento por ID",
            description = "Retorna um rastreamento específico com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Rastreamento encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RastreamentoResponseDto.class))),
                    @ApiResponse(responseCode = "404", description = "Rastreamento não encontrado")
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<RastreamentoResponseDto> buscarRastreamentoPorId(@PathVariable Long id) {
        log.info("Buscando rastreamento com ID: {}", id);
        RastreamentoResponseDto rastreamento = rastreamentoMapper.toResponseDto(rastreamentoService.buscarRastreamentoPorId(id));
        log.info("Rastreamento com ID {} encontrado com sucesso.", id);
        return ResponseEntity.ok(rastreamento);
    }

    @Operation(
            summary = "Buscar rastreamentos por filtro com paginação",
            description = "Retorna uma página de rastreamentos que correspondem aos critérios de filtro fornecidos.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string", defaultValue = "dataHoraRegistro,desc"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de rastreamentos filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            }
    )
    @GetMapping("/search")
    public ResponseEntity<Page<RastreamentoResponseDto>> buscarRastreamentosPorFiltro(
            RastreamentoFilter filter,
            @PageableDefault(size = 10, sort = "dataHoraRegistro") Pageable pageable) {
        log.info("Buscando rastreamentos com filtro: {} e paginação: {}", filter, pageable);
        Page<Rastreamento> rastreamentosPage = rastreamentoService.buscarRastreamentosPorFiltro(filter, pageable);
        Page<RastreamentoResponseDto> rastreamentosDtoPage = rastreamentosPage.map(rastreamentoMapper::toResponseDto);
        log.info("Retornando {} rastreamentos filtrados na página {} de {} elementos.", rastreamentosDtoPage.getNumberOfElements(), rastreamentosDtoPage.getNumber(), rastreamentosDtoPage.getTotalElements());
        return ResponseEntity.ok(rastreamentosDtoPage);
    }

    @Operation(
            summary = "Criar novo rastreamento",
            description = "Cria um novo rastreamento com os dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Rastreamento criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RastreamentoResponseDto.class))),
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (coordenadas ausentes)")
            }
    )
    @PostMapping
    public ResponseEntity<RastreamentoResponseDto> criarRastreamento(@Valid @RequestBody RastreamentoRequestDto rastreamentoRequestDto) {
        log.info("Recebida requisição para criar rastreamento: {}", rastreamentoRequestDto);
        RastreamentoResponseDto novoRastreamento = rastreamentoMapper.toResponseDto(rastreamentoService.criarRastreamento(rastreamentoRequestDto));
        log.info("Rastreamento criado com sucesso com ID: {}", novoRastreamento.getIdRastreamento());
        return ResponseEntity.status(HttpStatus.CREATED).body(novoRastreamento);
    }

    @Operation(
            summary = "Atualizar rastreamento existente",
            description = "Atualiza um rastreamento existente com base no ID e nos dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Rastreamento atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RastreamentoResponseDto.class))),
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<RastreamentoResponseDto> atualizarRastreamento(@PathVariable Long id, @Valid @RequestBody RastreamentoRequestDto rastreamentoRequestDto) {
        log.info("Recebida requisição para atualizar rastreamento com ID {}: {}", id, rastreamentoRequestDto);
        RastreamentoResponseDto rastreamentoAtualizado = rastreamentoMapper.toResponseDto(rastreamentoService.atualizarRastreamento(id, rastreamentoRequestDto));
        log.info("Rastreamento com ID {} atualizado com sucesso.", id);
        return ResponseEntity.ok(rastreamentoAtualizado);
    }

    @Operation(
            summary = "Deletar rastreamento",
            description = "Exclui um rastreamento com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Rastreamento deletado com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Rastreamento não encontrado")
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarRastreamento(@PathVariable Long id) {
        log.info("Recebida requisição para deletar rastreamento com ID: {}", id);
        rastreamentoService.deletarRastreamento(id);
        log.info("Rastreamento com ID {} deletado com sucesso.", id);
        return ResponseEntity.noContent().build();
    }
}
