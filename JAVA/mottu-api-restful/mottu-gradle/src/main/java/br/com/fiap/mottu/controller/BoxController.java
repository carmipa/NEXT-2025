package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.dto.box.BoxResponseDto;
import br.com.fiap.mottu.filter.BoxFilter;
import br.com.fiap.mottu.service.BoxService;
import br.com.fiap.mottu.mapper.BoxMapper;
import br.com.fiap.mottu.model.Box;

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

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/boxes")
@Tag(name = "Boxes", description = "Gerenciamento de Boxes")
public class BoxController {

    private static final Logger log = LoggerFactory.getLogger(BoxController.class);
    private final BoxService boxService;
    private final BoxMapper boxMapper;

    @Autowired
    public BoxController(BoxService boxService, BoxMapper boxMapper) {
        this.boxService = boxService;
        this.boxMapper = boxMapper;
    }

    public record GerarBoxRequestDto(
            @NotBlank(message = "O prefixo não pode ser vazio.")
            String prefixo,

            @Positive(message = "A quantidade deve ser um número positivo.")
            int quantidade
    ) {}

    @Operation(
            summary = "Listar todos os boxes com paginação",
            description = "Retorna uma página de todos os boxes cadastrados.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação no formato: propriedade,(asc|desc). Ex: nome,asc", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Página de boxes retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            }
    )
    @GetMapping
    public ResponseEntity<Page<BoxResponseDto>> listarTodosBoxes(@PageableDefault(size = 10, sort = "nome") Pageable pageable) {
        log.info("Buscando todos os boxes com paginação: {}", pageable);
        Page<Box> boxesPage = boxService.listarTodosBoxes(pageable);
        Page<BoxResponseDto> boxesDtoPage = boxesPage.map(boxMapper::toResponseDto);
        log.info("Retornando {} boxes na página {} de um total de {} elementos.", boxesDtoPage.getNumberOfElements(), boxesDtoPage.getNumber(), boxesDtoPage.getTotalElements());
        return ResponseEntity.ok(boxesDtoPage);
    }

    @Operation(
            summary = "Buscar box por ID",
            description = "Retorna um box específico com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Box encontrado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BoxResponseDto.class))),
                    @ApiResponse(responseCode = "404", description = "Box não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Box com ID 1 não encontrado(a).\",\"path\":\"/api/boxes/1\"}")))
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<BoxResponseDto> buscarBoxPorId(@PathVariable Long id) {
        log.info("Buscando box com ID: {}", id);
        BoxResponseDto box = boxMapper.toResponseDto(boxService.buscarBoxPorId(id));
        log.info("Box com ID {} encontrado com sucesso.", id);
        return ResponseEntity.ok(box);
    }

    @Operation(
            summary = "Buscar boxes por filtro com paginação",
            description = "Retorna uma lista de boxes que correspondem aos critérios de filtro fornecidos.",
            parameters = {
                    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
                    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
                    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de boxes filtrada retornada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            }
    )
    @GetMapping("/search")
    public ResponseEntity<Page<BoxResponseDto>> buscarBoxesPorFiltro(BoxFilter filter, @PageableDefault(size = 10) Pageable pageable) {
        log.info("Buscando boxes com filtro: {} e paginação: {}", filter, pageable);
        Page<Box> boxesPage = boxService.buscarBoxesPorFiltro(filter, pageable);
        Page<BoxResponseDto> boxesDtoPage = boxesPage.map(boxMapper::toResponseDto);
        log.info("Retornando {} boxes filtrados na página {} de {} elementos.", boxesDtoPage.getNumberOfElements(), boxesDtoPage.getNumber(), boxesDtoPage.getTotalElements());
        return ResponseEntity.ok(boxesDtoPage);
    }

    @Operation(
            summary = "Criar novo box",
            description = "Cria um novo box com os dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Box criado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BoxResponseDto.class))),
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":400,\"error\":\"Requisição Inválida\",\"message\":\"Mensagem de validação ou erro de input.\",\"path\":\"/api/boxes\"}"))),
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (nome duplicado)",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":409,\"error\":\"Conflito de Dados\",\"message\":\"Box com nome 'Nome Duplicado' já existe.\",\"path\":\"/api/boxes\"}")))
            }
    )
    @PostMapping
    public ResponseEntity<BoxResponseDto> criarBox(@Valid @RequestBody BoxRequestDto boxRequestDto) {
        log.info("Recebida requisição para criar box: {}", boxRequestDto);
        BoxResponseDto novoBox = boxMapper.toResponseDto(boxService.criarBox(boxRequestDto));
        log.info("Box criado com sucesso com ID: {}", novoBox.getIdBox());
        return ResponseEntity.status(HttpStatus.CREATED).body(novoBox);
    }

    @Operation(
            summary = "Atualizar box existente",
            description = "Atualiza um box existente com base no ID e nos dados fornecidos.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Box atualizado com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BoxResponseDto.class))),
                    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":400,\"error\":\"Requisição Inválida\",\"message\":\"Mensagem de validação ou erro de input.\",\"path\":\"/api/boxes/1\"}"))),
                    @ApiResponse(responseCode = "404", description = "Box não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Box com ID 1 não encontrado(a).\",\"path\":\"/api/boxes/1\"}"))),
                    @ApiResponse(responseCode = "409", description = "Conflito de recurso (nome duplicado)",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":409,\"error\":\"Conflito de Dados\",\"message\":\"Box com nome 'Nome Duplicado' já existe.\",\"path\":\"/api/boxes/1\"}")))
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<BoxResponseDto> atualizarBox(@PathVariable Long id, @Valid @RequestBody BoxRequestDto boxRequestDto) {
        log.info("Recebida requisição para atualizar box com ID {}: {}", id, boxRequestDto);
        BoxResponseDto boxAtualizado = boxMapper.toResponseDto(boxService.atualizarBox(id, boxRequestDto));
        log.info("Box com ID {} atualizado com sucesso.", id);
        return ResponseEntity.ok(boxAtualizado);
    }

    @Operation(
            summary = "Deletar box",
            description = "Exclui um box com base no ID fornecido.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Box deletado com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Box não encontrado",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"timestamp\":\"2025-01-01T12:00:00\",\"status\":404,\"error\":\"Não Encontrado\",\"message\":\"Box com ID 1 não encontrado(a).\",\"path\":\"/api/boxes/1\"}")))
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarBox(@PathVariable Long id) {
        log.info("Recebida requisição para deletar box com ID: {}", id);
        boxService.deletarBox(id);
        log.info("Box com ID {} deletado com sucesso.", id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Obter próximo nome de box disponível para uma zona",
            description = "Retorna o próximo nome sequencial para um box com base em um prefixo (ex: 'Z-A-B')."
    )
    @GetMapping("/proximo-nome")
    public ResponseEntity<String> getProximoNome(@RequestParam String prefixo) {
        String proximoNome = boxService.findProximoNomeDisponivel(prefixo);
        return ResponseEntity.ok(proximoNome);
    }

    @Operation(
            summary = "Gerar múltiplos boxes em lote",
            description = "Cria uma quantidade especificada de boxes com um prefixo de nome sequencial."
    )
    @PostMapping("/gerar-em-lote")
    public ResponseEntity<String> gerarBoxesEmLote(@Valid @RequestBody GerarBoxRequestDto request) {
        boxService.criarBoxesEmLote(request.prefixo(), request.quantidade());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(request.quantidade() + " boxes gerados com sucesso com o prefixo '" + request.prefixo() + "'.");
    }
}