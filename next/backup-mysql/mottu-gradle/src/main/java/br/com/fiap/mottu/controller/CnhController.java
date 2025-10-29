package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.cnh.CnhRequestDto;
import br.com.fiap.mottu.dto.cnh.CnhResponseDto;
import br.com.fiap.mottu.filter.CnhFilter;
import br.com.fiap.mottu.service.CnhService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

/**
 * Controller para operações de CNH (Carteira Nacional de Habilitação)
 */
@RestController
@RequestMapping("/api/cnh")
@Tag(name = "CNH", description = "Operações relacionadas à Carteira Nacional de Habilitação")
public class CnhController {

    private static final Logger logger = LoggerFactory.getLogger(CnhController.class);
    private final CnhService cnhService;

    @Autowired
    public CnhController(CnhService cnhService) {
        this.cnhService = cnhService;
        logger.info("🚀 CnhController inicializado com sucesso!");
        logger.debug("🔧 CnhService injetado: {}", cnhService != null ? "OK" : "NULL");
    }

    /**
     * Endpoint de teste para verificar se o controller está funcionando
     */
    @GetMapping("/test")
    @Operation(summary = "Teste de conectividade", description = "Endpoint simples para testar se o controller está funcionando")
    public ResponseEntity<String> test() {
        logger.info("🧪 Endpoint de teste da CNH chamado!");
        logger.debug("🔧 CnhService disponível: {}", cnhService != null ? "SIM" : "NÃO");
        return ResponseEntity.ok("CNH Controller funcionando! Timestamp: " + System.currentTimeMillis());
    }

    /**
     * Cria uma nova CNH
     */
    @PostMapping
    @Operation(summary = "Criar CNH", description = "Cria uma nova Carteira Nacional de Habilitação")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "CNH criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "CNH já existe")
    })
    public ResponseEntity<CnhResponseDto> criar(@Valid @RequestBody CnhRequestDto cnhRequestDto) {
        CnhResponseDto cnhCriada = cnhService.criar(cnhRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(cnhCriada);
    }

    /**
     * Busca CNH por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar CNH por ID", description = "Busca uma CNH pelo seu identificador")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNH encontrada"),
        @ApiResponse(responseCode = "404", description = "CNH não encontrada")
    })
    public ResponseEntity<CnhResponseDto> buscarPorId(
            @Parameter(description = "ID da CNH") @PathVariable Long id) {
        CnhResponseDto cnh = cnhService.buscarPorId(id);
        return ResponseEntity.ok(cnh);
    }

    /**
     * Busca CNH por número de registro
     */
    @GetMapping("/numero/{numeroRegistro}")
    @Operation(summary = "Buscar CNH por número de registro", description = "Busca uma CNH pelo número de registro")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNH encontrada"),
        @ApiResponse(responseCode = "404", description = "CNH não encontrada")
    })
    public ResponseEntity<CnhResponseDto> buscarPorNumeroRegistro(
            @Parameter(description = "Número de registro da CNH") @PathVariable String numeroRegistro) {
        CnhResponseDto cnh = cnhService.buscarPorNumeroRegistro(numeroRegistro);
        return ResponseEntity.ok(cnh);
    }

    /**
     * Busca CNH por cliente
     */
    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Buscar CNH por cliente", description = "Busca a CNH de um cliente específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNH encontrada"),
        @ApiResponse(responseCode = "404", description = "CNH não encontrada para o cliente")
    })
    public ResponseEntity<CnhResponseDto> buscarPorCliente(
            @Parameter(description = "ID do cliente") @PathVariable Long clienteId) {
        CnhResponseDto cnh = cnhService.buscarPorCliente(clienteId);
        return ResponseEntity.ok(cnh);
    }

    /**
     * Lista todas as CNHs com paginação
     */
    @GetMapping
    @Operation(summary = "Listar CNHs", description = "Lista todas as CNHs com paginação")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de CNHs retornada com sucesso")
    })
    public ResponseEntity<Page<CnhResponseDto>> listar(
            @PageableDefault(size = 20, sort = "dataValidade") Pageable pageable) {
        logger.info("📋 Listando CNHs - Página: {}, Tamanho: {}", pageable.getPageNumber(), pageable.getPageSize());
        logger.debug("🔧 CnhService disponível para listagem: {}", cnhService != null ? "SIM" : "NÃO");
        
        try {
            Page<CnhResponseDto> cnhs = cnhService.listar(pageable);
            logger.info("✅ CNHs listadas com sucesso - Total: {} elementos", cnhs.getTotalElements());
            return ResponseEntity.ok(cnhs);
        } catch (Exception e) {
            logger.error("❌ Erro ao listar CNHs: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Busca CNHs com filtros
     */
    @GetMapping("/buscar")
    @Operation(summary = "Buscar CNHs com filtros", description = "Busca CNHs aplicando filtros específicos")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNHs filtradas retornadas com sucesso")
    })
    public ResponseEntity<Page<CnhResponseDto>> buscarComFiltros(
            @Parameter(description = "Filtros de busca") CnhFilter filter,
            @PageableDefault(size = 20, sort = "dataValidade") Pageable pageable) {
        Page<CnhResponseDto> cnhs = cnhService.buscarComFiltros(filter, pageable);
        return ResponseEntity.ok(cnhs);
    }

    /**
     * Busca CNHs por categoria
     */
    @GetMapping("/categoria/{categoria}")
    @Operation(summary = "Buscar CNHs por categoria", description = "Busca CNHs de uma categoria específica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNHs da categoria retornadas com sucesso")
    })
    public ResponseEntity<Page<CnhResponseDto>> buscarPorCategoria(
            @Parameter(description = "Categoria da CNH") @PathVariable String categoria,
            @PageableDefault(size = 20, sort = "dataValidade") Pageable pageable) {
        Page<CnhResponseDto> cnhs = cnhService.buscarPorCategoria(categoria, pageable);
        return ResponseEntity.ok(cnhs);
    }

    /**
     * Busca CNHs vencidas
     */
    @GetMapping("/vencidas")
    @Operation(summary = "Buscar CNHs vencidas", description = "Busca todas as CNHs que estão vencidas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNHs vencidas retornadas com sucesso")
    })
    public ResponseEntity<Page<CnhResponseDto>> buscarVencidas(
            @PageableDefault(size = 20, sort = "dataValidade") Pageable pageable) {
        Page<CnhResponseDto> cnhs = cnhService.buscarVencidas(pageable);
        return ResponseEntity.ok(cnhs);
    }

    /**
     * Busca CNHs próximas do vencimento
     */
    @GetMapping("/proximas-vencimento")
    @Operation(summary = "Buscar CNHs próximas do vencimento", description = "Busca CNHs que vencem nos próximos 30 dias")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNHs próximas do vencimento retornadas com sucesso")
    })
    public ResponseEntity<Page<CnhResponseDto>> buscarProximasVencimento(
            @PageableDefault(size = 20, sort = "dataValidade") Pageable pageable) {
        Page<CnhResponseDto> cnhs = cnhService.buscarProximasVencimento(pageable);
        return ResponseEntity.ok(cnhs);
    }

    /**
     * Busca CNHs que permitem dirigir motos
     */
    @GetMapping("/permitem-motos")
    @Operation(summary = "Buscar CNHs que permitem dirigir motos", description = "Busca CNHs das categorias que permitem dirigir motocicletas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNHs que permitem motos retornadas com sucesso")
    })
    public ResponseEntity<Page<CnhResponseDto>> buscarPermitemMotos(
            @PageableDefault(size = 20, sort = "dataValidade") Pageable pageable) {
        Page<CnhResponseDto> cnhs = cnhService.buscarPermitemMotos(pageable);
        return ResponseEntity.ok(cnhs);
    }

    /**
     * Busca CNHs que permitem dirigir carros
     */
    @GetMapping("/permitem-carros")
    @Operation(summary = "Buscar CNHs que permitem dirigir carros", description = "Busca CNHs das categorias que permitem dirigir carros")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNHs que permitem carros retornadas com sucesso")
    })
    public ResponseEntity<Page<CnhResponseDto>> buscarPermitemCarros(
            @PageableDefault(size = 20, sort = "dataValidade") Pageable pageable) {
        Page<CnhResponseDto> cnhs = cnhService.buscarPermitemCarros(pageable);
        return ResponseEntity.ok(cnhs);
    }

    /**
     * Atualiza uma CNH existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar CNH", description = "Atualiza os dados de uma CNH existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CNH atualizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "CNH não encontrada"),
        @ApiResponse(responseCode = "409", description = "Conflito de dados")
    })
    public ResponseEntity<CnhResponseDto> atualizar(
            @Parameter(description = "ID da CNH") @PathVariable Long id,
            @Valid @RequestBody CnhRequestDto cnhRequestDto) {
        CnhResponseDto cnhAtualizada = cnhService.atualizar(id, cnhRequestDto);
        return ResponseEntity.ok(cnhAtualizada);
    }

    /**
     * Exclui uma CNH
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir CNH", description = "Exclui uma CNH do sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "CNH excluída com sucesso"),
        @ApiResponse(responseCode = "404", description = "CNH não encontrada")
    })
    public ResponseEntity<Void> excluir(
            @Parameter(description = "ID da CNH") @PathVariable Long id) {
        cnhService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Conta CNHs vencidas
     */
    @GetMapping("/estatisticas/vencidas")
    @Operation(summary = "Contar CNHs vencidas", description = "Retorna o número de CNHs vencidas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Contagem retornada com sucesso")
    })
    public ResponseEntity<Long> contarVencidas() {
        long count = cnhService.contarVencidas();
        return ResponseEntity.ok(count);
    }

    /**
     * Conta CNHs próximas do vencimento
     */
    @GetMapping("/estatisticas/proximas-vencimento")
    @Operation(summary = "Contar CNHs próximas do vencimento", description = "Retorna o número de CNHs que vencem nos próximos 30 dias")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Contagem retornada com sucesso")
    })
    public ResponseEntity<Long> contarProximasVencimento() {
        long count = cnhService.contarProximasVencimento();
        return ResponseEntity.ok(count);
    }

    /**
     * Verifica se um cliente possui CNH
     */
    @GetMapping("/cliente/{clienteId}/possui")
    @Operation(summary = "Verificar se cliente possui CNH", description = "Verifica se um cliente possui CNH cadastrada")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificação realizada com sucesso")
    })
    public ResponseEntity<Boolean> clientePossuiCnh(
            @Parameter(description = "ID do cliente") @PathVariable Long clienteId) {
        boolean possui = cnhService.clientePossuiCnh(clienteId);
        return ResponseEntity.ok(possui);
    }

    /**
     * Verifica se uma CNH está vencida
     */
    @GetMapping("/{id}/vencida")
    @Operation(summary = "Verificar se CNH está vencida", description = "Verifica se uma CNH específica está vencida")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificação realizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "CNH não encontrada")
    })
    public ResponseEntity<Boolean> isCnhVencida(
            @Parameter(description = "ID da CNH") @PathVariable Long id) {
        boolean vencida = cnhService.isCnhVencida(id);
        return ResponseEntity.ok(vencida);
    }

    /**
     * Verifica se uma CNH está próxima do vencimento
     */
    @GetMapping("/{id}/proxima-vencimento")
    @Operation(summary = "Verificar se CNH está próxima do vencimento", description = "Verifica se uma CNH específica está próxima do vencimento")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificação realizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "CNH não encontrada")
    })
    public ResponseEntity<Boolean> isCnhProximaVencimento(
            @Parameter(description = "ID da CNH") @PathVariable Long id) {
        boolean proxima = cnhService.isCnhProximaVencimento(id);
        return ResponseEntity.ok(proxima);
    }
}
