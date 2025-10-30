package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.patio.PatioRequestDto;
import br.com.fiap.mottu.dto.patio.PatioResponseDto;
import br.com.fiap.mottu.filter.PatioFilter;
import br.com.fiap.mottu.mapper.PatioMapper;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.service.PatioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patio-endereco-contato")
@Tag(name = "PatioEnderecoContato", description = "Cadastro/atualização agregada de Pátio com Endereços (ViaCEP) e Contatos")
public class PatioEnderecoContatoController {

    private final PatioService patioService;
    private final PatioMapper patioMapper;

    @Autowired
    public PatioEnderecoContatoController(PatioService patioService, PatioMapper patioMapper) {
        this.patioService = patioService;
        this.patioMapper = patioMapper;
    }

    @Operation(summary = "Listar pátios (agregado)", parameters = {
            @Parameter(name = "page", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
            @Parameter(name = "size", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
            @Parameter(name = "sort", in = ParameterIn.QUERY, schema = @Schema(type = "string", defaultValue = "nomePatio,asc"))
    }, responses = {
            @ApiResponse(responseCode = "200", description = "Página de pátios retornada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    })
    @GetMapping
    public ResponseEntity<Page<PatioResponseDto>> listar(@PageableDefault(size = 10, sort = "nomePatio") Pageable pageable) {
        Page<Patio> page = patioService.listarTodosPatios(pageable);
        return ResponseEntity.ok(page.map(patioMapper::toResponseDto));
    }

    @Operation(summary = "Buscar pátios por filtro (agregado)")
    @GetMapping("/search")
    public ResponseEntity<Page<PatioResponseDto>> buscarPorFiltro(PatioFilter filter, @PageableDefault(size = 10) Pageable pageable) {
        Page<Patio> page = patioService.buscarPatiosPorFiltro(filter, pageable);
        return ResponseEntity.ok(page.map(patioMapper::toResponseDto));
    }

    @Operation(summary = "Criar pátio com endereços (ViaCEP) e contatos")
    @PostMapping
    public ResponseEntity<PatioResponseDto> criar(@Valid @RequestBody PatioRequestDto dto) {
        Patio patio = patioService.criarPatio(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(patioMapper.toResponseDto(patio));
    }

    @Operation(summary = "Atualizar pátio com endereços (ViaCEP) e contatos")
    @PutMapping("/{id}")
    public ResponseEntity<PatioResponseDto> atualizar(@PathVariable Long id, @Valid @RequestBody PatioRequestDto dto) {
        Patio patio = patioService.atualizarPatio(id, dto);
        return ResponseEntity.ok(patioMapper.toResponseDto(patio));
    }
}
