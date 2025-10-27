package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.cliente.ClienteRequestDto;
import br.com.fiap.mottu.dto.cliente.ClienteResponseDto;
import br.com.fiap.mottu.filter.ClienteFilter;
import br.com.fiap.mottu.mapper.ClienteMapper;
import br.com.fiap.mottu.model.Cliente;
import br.com.fiap.mottu.service.ClienteService;
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
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/cliente-endereco-contato")
@Tag(name = "ClienteEnderecoContato", description = "Cadastro/atualização agregada de Cliente com Endereço (ViaCEP) e Contato")
public class ClienteEnderecoContatoController {

    private final ClienteService clienteService;
    private final ClienteMapper clienteMapper;

    @Autowired
    public ClienteEnderecoContatoController(ClienteService clienteService, ClienteMapper clienteMapper) {
        this.clienteService = clienteService;
        this.clienteMapper = clienteMapper;
    }

    @Operation(summary = "Listar clientes (agregado)", parameters = {
            @Parameter(name = "page", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
            @Parameter(name = "size", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
            @Parameter(name = "sort", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
    }, responses = {
            @ApiResponse(responseCode = "200", description = "Página de clientes retornada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    })
    @GetMapping
    public ResponseEntity<Page<ClienteResponseDto>> listar(@PageableDefault(size = 10, sort = "nome") Pageable pageable) {
        Page<Cliente> page = clienteService.listarTodosClientes(pageable);
        return ResponseEntity.ok(page.map(clienteMapper::toResponseDto));
    }

    @Operation(summary = "Buscar clientes por filtro (agregado)", parameters = {
            @Parameter(name = "page", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
            @Parameter(name = "size", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
            @Parameter(name = "sort", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
    })
    @GetMapping("/search")
    public ResponseEntity<Page<ClienteResponseDto>> buscarPorFiltro(ClienteFilter filter, @PageableDefault(size = 10) Pageable pageable) {
        Page<Cliente> page = clienteService.buscarClientesPorFiltro(filter, pageable);
        return ResponseEntity.ok(page.map(clienteMapper::toResponseDto));
    }

    @Operation(summary = "Criar cliente com endereço (ViaCEP) e contato")
    @PostMapping
    public ResponseEntity<Mono<ClienteResponseDto>> criar(@Valid @RequestBody ClienteRequestDto dto) {
        Mono<Cliente> mono = clienteService.criarCliente(dto);
        Mono<ClienteResponseDto> resp = mono.map(clienteMapper::toResponseDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @Operation(summary = "Atualizar cliente com endereço (ViaCEP) e contato")
    @PutMapping("/{id}")
    public ResponseEntity<Mono<ClienteResponseDto>> atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequestDto dto) {
        Mono<Cliente> mono = clienteService.atualizarCliente(id, dto);
        Mono<ClienteResponseDto> resp = mono.map(clienteMapper::toResponseDto);
        return ResponseEntity.ok(resp);
    }
}
