package br.com.fiap.mottu.controller;

// DTOs de Requisição e Resposta
import br.com.fiap.mottu.dto.patio.PatioRequestDto; //
import br.com.fiap.mottu.dto.patio.PatioCompletoRequestDto;
import br.com.fiap.mottu.dto.patio.PatioResponseDto; //
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto; //
import br.com.fiap.mottu.dto.zona.ZonaResponseDto;       //
import br.com.fiap.mottu.dto.zona.ZonaRequestDto;        //
import br.com.fiap.mottu.dto.box.BoxResponseDto;         //
import br.com.fiap.mottu.dto.box.BoxRequestDto;          //
import br.com.fiap.mottu.dto.contato.ContatoResponseDto; //
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto; //
import br.com.fiap.mottu.dto.datatable.DataTableRequest;
import br.com.fiap.mottu.dto.datatable.DataTableResponse;
// Filtro
import br.com.fiap.mottu.filter.PatioFilter; //
// Serviço e Mappers
import br.com.fiap.mottu.service.PatioService; //
import br.com.fiap.mottu.mapper.PatioMapper; //
import br.com.fiap.mottu.mapper.VeiculoMapper; //
import br.com.fiap.mottu.mapper.ZonaMapper;    //
import br.com.fiap.mottu.mapper.BoxMapper;      //
import br.com.fiap.mottu.mapper.ContatoMapper;  //
import br.com.fiap.mottu.mapper.EnderecoMapper; //
import br.com.fiap.mottu.model.Patio; // Entidade Pátio
import br.com.fiap.mottu.model.Contato; //
import br.com.fiap.mottu.model.Endereco; //
// Exceções (tratadas globalmente)
import br.com.fiap.mottu.exception.InvalidInputException;
// import br.com.fiap.mottu.exception.DuplicatedResourceException;
// import br.com.fiap.mottu.exception.ResourceNotFoundException;

// Swagger/OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;

// Logging
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// Spring Framework
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus; //
import org.springframework.http.ResponseEntity; //
import org.springframework.web.bind.annotation.*;
// Validation
import jakarta.validation.Valid;

import java.util.Set; //
import java.util.stream.Collectors; //

@RestController // Controller REST
@RequestMapping("/api/patios") // Mapeamento base para este controller
@Tag(name = "Patios", description = "Gerenciamento de Pátios e Suas Associações") // Tag Swagger
public class PatioController {

    private static final Logger log = LoggerFactory.getLogger(PatioController.class); // Logger
    // Injeção de Serviços e Mappers
    private final PatioService patioService; //
    private final PatioMapper patioMapper; //
    private final VeiculoMapper veiculoMapper; //
    private final ZonaMapper zonaMapper; //
    private final BoxMapper boxMapper; //
    private final ContatoMapper contatoMapper; //
    private final EnderecoMapper enderecoMapper; //

    public PatioController(PatioService patioService, PatioMapper patioMapper,
                           VeiculoMapper veiculoMapper, ZonaMapper zonaMapper,
                           ContatoMapper contatoMapper, EnderecoMapper enderecoMapper,
                           BoxMapper boxMapper) { //
        this.patioService = patioService;
        this.patioMapper = patioMapper;
        this.veiculoMapper = veiculoMapper; //
        this.zonaMapper = zonaMapper; //
        this.boxMapper = boxMapper; //
        this.contatoMapper = contatoMapper; //
        this.enderecoMapper = enderecoMapper; //
    }

    // Operações CRUD para Pátio

    @Operation(summary = "Listar todos os pátios com paginação", description = "Retorna uma página de todos os pátios cadastrados.") //
    @Parameter(name = "page", description = "Número da página (0..N)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0"))
    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10"))
    @Parameter(name = "sort", description = "Critério de ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string", defaultValue = "nomePatio,asc"))
    @ApiResponse(responseCode = "200", description = "Página de pátios retornada com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))) //
    @GetMapping // Mapeia GET para /api/patios
    public ResponseEntity<Page<PatioResponseDto>> listarTodosPatios(
            @PageableDefault(size = 10, sort = "nomePatio") Pageable pageable) {
        log.info("Buscando todos os pátios com paginação: {}", pageable); //
        Page<Patio> patiosPage = patioService.listarTodosPatios(pageable); // Chama o serviço
        Page<PatioResponseDto> patiosDtoPage = patiosPage.map(patioMapper::toResponseDto); // Mapeia para DTOs
        log.info("Retornando {} pátios na página {} de {} elementos.", patiosDtoPage.getNumberOfElements(), patiosDtoPage.getNumber(), patiosDtoPage.getTotalElements());
        return ResponseEntity.ok(patiosDtoPage); // Retorna a página
    }

    @Operation(summary = "Buscar pátio por ID", description = "Retorna um pátio específico com base no ID fornecido.") //
    @ApiResponse(responseCode = "200", description = "Pátio encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PatioResponseDto.class))) //
    @ApiResponse(responseCode = "404", description = "Pátio não encontrado") // Tratado globalmente
    @GetMapping("/{id}")
    public ResponseEntity<PatioResponseDto> buscarPatioPorId(@PathVariable Long id) {
        log.info("Buscando pátio com ID: {}", id); //
        PatioResponseDto patioDto = patioMapper.toResponseDto(patioService.buscarPatioPorId(id)); //
        log.info("Pátio com ID {} encontrado.", id); //
        return ResponseEntity.ok(patioDto);
    }

    @Operation(summary = "Buscar pátios por filtro com paginação", description = "Retorna uma página de pátios que correspondem aos critérios de filtro.") //
    @Parameter(name = "page", description = "Número da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0"))
    @Parameter(name = "size", description = "Tamanho da página", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10"))
    @Parameter(name = "sort", description = "Ordenação (propriedade,[asc|desc])", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
    @ApiResponse(responseCode = "200", description = "Página de pátios filtrada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))) //
    @GetMapping("/search")
    public ResponseEntity<Page<PatioResponseDto>> buscarPatiosPorFiltro(
            PatioFilter filter, @PageableDefault(size = 10) Pageable pageable) {
        log.info("Buscando pátios com filtro: {} e paginação: {}", filter, pageable); //
        Page<Patio> patiosPage = patioService.buscarPatiosPorFiltro(filter, pageable); //
        Page<PatioResponseDto> patiosDtoPage = patiosPage.map(patioMapper::toResponseDto);
        log.info("Retornando {} pátios filtrados.", patiosDtoPage.getNumberOfElements()); //
        return ResponseEntity.ok(patiosDtoPage);
    }

    @Operation(summary = "Criar novo pátio", description = "Cria um novo pátio.") //
    @ApiResponse(responseCode = "201", description = "Pátio criado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PatioResponseDto.class))) //
    @ApiResponse(responseCode = "400", description = "Dados inválidos") // Tratado globalmente (Bean Validation)
    @ApiResponse(responseCode = "409", description = "Pátio já existe") // Tratado globalmente
    @PostMapping
    public ResponseEntity<PatioResponseDto> criarPatio(@Valid @RequestBody PatioRequestDto patioRequestDto) { //
        log.info("Criando pátio: {}", patioRequestDto); //
        PatioResponseDto novoPatio = patioMapper.toResponseDto(patioService.criarPatio(patioRequestDto)); //
        log.info("Pátio criado com ID: {}", novoPatio.getIdPatio()); //
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPatio); //
    }

    @Operation(summary = "Atualizar pátio existente", description = "Atualiza dados de um pátio.") //
    @ApiResponse(responseCode = "200", description = "Pátio atualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PatioResponseDto.class))) //
    @ApiResponse(responseCode = "404", description = "Pátio não encontrado") // Tratado globalmente
    @ApiResponse(responseCode = "409", description = "Conflito de dados (ex: nome duplicado)") // Tratado globalmente
    @PutMapping("/{id}")
    public ResponseEntity<PatioResponseDto> atualizarPatio(@PathVariable Long id, @Valid @RequestBody PatioRequestDto patioRequestDto) { //
        log.info("Atualizando pátio ID {}: {}", id, patioRequestDto); //
        PatioResponseDto patioAtualizado = patioMapper.toResponseDto(patioService.atualizarPatio(id, patioRequestDto)); //
        log.info("Pátio ID {} atualizado.", id); //
        return ResponseEntity.ok(patioAtualizado);
    }

    @Operation(
        summary = "Atualizar status do pátio",
        description = "Atualiza apenas o status de um pátio sem alterar seus relacionamentos. " +
                      "Status válidos: 'A' (Ativo) ou 'I' (Inativo). " +
                      "Este endpoint é ideal para ativar/desativar um pátio rapidamente sem precisar enviar todos os dados."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Status do pátio atualizado com sucesso",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = PatioResponseDto.class)
        )
    )
    @ApiResponse(
        responseCode = "404",
        description = "Pátio não encontrado"
    )
    @ApiResponse(
        responseCode = "400",
        description = "Status inválido. Use 'A' (Ativo) ou 'I' (Inativo)"
    )
    @PatchMapping("/{id}/status")
    public ResponseEntity<PatioResponseDto> atualizarStatusPatio(
            @PathVariable(value = "id") Long id, 
            @RequestParam(value = "status") String status) {
        log.info("Atualizando status do pátio ID {} para: {}", id, status);
        
        // Validar status
        if (!status.equals("A") && !status.equals("I")) {
            throw new InvalidInputException(
                "status", 
                status, 
                "Status inválido. Use 'A' (Ativo) ou 'I' (Inativo)."
            );
        }
        
        PatioResponseDto patioAtualizado = patioMapper.toResponseDto(
            patioService.atualizarStatusPatio(id, status)
        );
        
        log.info("Status do pátio ID {} atualizado para: {}", id, status);
        return ResponseEntity.ok(patioAtualizado);
    }

    @Operation(summary = "Deletar pátio", description = "Exclui um pátio.") //
    @ApiResponse(responseCode = "204", description = "Pátio deletado") //
    @ApiResponse(responseCode = "404", description = "Pátio não encontrado") // Tratado globalmente
    @ApiResponse(responseCode = "409", description = "Pátio em uso (estacionamentos ativos ou veículos associados)") // Tratado globalmente
    @ApiResponse(responseCode = "403", description = "Operação não permitida (erro ao processar dependências)") // Tratado globalmente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPatio(@PathVariable Long id) {
        log.info("Deletando pátio ID: {}", id); //
        patioService.deletarPatio(id); //
        log.info("Pátio ID {} deletado.", id); //
        return ResponseEntity.noContent().build(); //
    }

    @Operation(
            summary = "Buscar pátios para DataTable",
            description = "Retorna pátios formatados para DataTable com paginação, ordenação e filtros."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Dados formatados para DataTable",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DataTableResponse.class))
    )
    @PostMapping("/datatable")
    public ResponseEntity<DataTableResponse<PatioResponseDto>> buscarParaDataTable(
            @RequestBody DataTableRequest request,
            @Parameter(description = "Filtros adicionais", in = ParameterIn.QUERY) PatioFilter filter) {
        log.info("📊 Buscando pátios para DataTable - draw: {}", request.getDraw());
        return ResponseEntity.ok(patioService.buscarParaDataTable(request, filter));
    }

    // Endpoint para criar Pátio completo (wizard)
    @PostMapping("/completo")
    public ResponseEntity<PatioResponseDto> criarPatioCompleto(@Valid @RequestBody PatioCompletoRequestDto dto) {
        Patio patio = patioService.criarPatioCompleto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(patioMapper.toResponseDto(patio));
    }

    // --- Endpoints de Associação de Veículos com Pátio ---
    @Operation(summary = "Associar veículo a um pátio") //
    @ApiResponse(responseCode = "201", description = "Associação criada") //
    @PostMapping("/{patioId}/veiculos/{veiculoId}/associar")
    public ResponseEntity<String> associarPatioVeiculo(@PathVariable Long patioId, @PathVariable Long veiculoId) { //
        log.info("Associando veículo ID {} ao pátio ID {}.", veiculoId, patioId); //
        patioService.associarPatioVeiculo(patioId, veiculoId); //
        log.info("Associação Pátio {} e Veículo {} criada.", patioId, veiculoId); //
        return ResponseEntity.status(HttpStatus.CREATED).body("Associação criada com sucesso."); //
    }

    @Operation(summary = "Desassociar veículo de um pátio") //
    @ApiResponse(responseCode = "204", description = "Associação removida") //
    @DeleteMapping("/{patioId}/veiculos/{veiculoId}/desassociar")
    public ResponseEntity<Void> desassociarPatioVeiculo(@PathVariable Long patioId, @PathVariable Long veiculoId) {
        log.info("Desassociando veículo ID {} do pátio ID {}.", veiculoId, patioId); //
        patioService.desassociarPatioVeiculo(patioId, veiculoId); //
        log.info("Associação Pátio {} e Veículo {} removida.", patioId, veiculoId); //
        return ResponseEntity.noContent().build(); //
    }

    @Operation(summary = "Listar veículos de um pátio") //
    @ApiResponse(responseCode = "200", description = "Veículos do pátio", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Set.class))) //
    @GetMapping("/{patioId}/veiculos")
    public ResponseEntity<Set<VeiculoResponseDto>> getVeiculosByPatioId(@PathVariable Long patioId) {
        log.info("Buscando veículos do pátio ID: {}", patioId); //
        Set<VeiculoResponseDto> veiculos = patioService.getVeiculosByPatioId(patioId) //
                .stream().map(veiculoMapper::toResponseDto).collect(Collectors.toSet());
        log.info("Retornando {} veículos para o pátio ID {}.", veiculos.size(), patioId); //
        return ResponseEntity.ok(veiculos);
    }

    // --- Endpoints de Associação de Zonas com Pátio ---

    @Operation(summary = "Listar zonas de um pátio") //
    @ApiResponse(responseCode = "200", description = "Zonas do pátio", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Set.class))) //
    @GetMapping("/{patioId}/zonas")
    public ResponseEntity<Set<ZonaResponseDto>> getZonasByPatioId(@PathVariable Long patioId) {
        log.info("Buscando zonas do pátio ID: {}", patioId); //
        Set<ZonaResponseDto> zonas = patioService.getZonasByPatioId(patioId) //
                .stream().map(zonaMapper::toResponseDto).collect(Collectors.toSet());
        log.info("Retornando {} zonas para o pátio ID {}.", zonas.size(), patioId); //
        return ResponseEntity.ok(zonas);
    }

    // --- Endpoints para FK direta ---
    @Operation(summary = "Obter contato de um pátio") //
    @ApiResponse(responseCode = "200", description = "Contato do pátio") //
    @GetMapping("/{patioId}/contato")
    public ResponseEntity<ContatoResponseDto> getContatoByPatioId(@PathVariable Long patioId) {
        log.info("Buscando contato do pátio ID: {}", patioId); //
        Contato contato = patioService.getContatoByPatioId(patioId);
        ContatoResponseDto contatoDto = contatoMapper.toResponseDto(contato);
        log.info("Retornando contato para o pátio ID {}.", patioId); //
        return ResponseEntity.ok(contatoDto);
    }

    @Operation(summary = "Obter endereço de um pátio") //
    @ApiResponse(responseCode = "200", description = "Endereço do pátio") //
    @GetMapping("/{patioId}/endereco")
    public ResponseEntity<EnderecoResponseDto> getEnderecoByPatioId(@PathVariable Long patioId) {
        log.info("Buscando endereço do pátio ID: {}", patioId); //
        Endereco endereco = patioService.getEnderecoByPatioId(patioId);
        EnderecoResponseDto enderecoDto = enderecoMapper.toResponseDto(endereco);
        log.info("Retornando endereço para o pátio ID {}.", patioId); //
        return ResponseEntity.ok(enderecoDto);
    }

    @Operation(summary = "Listar boxes de um pátio") //
    @ApiResponse(responseCode = "200", description = "Boxes do pátio", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Set.class))) //
    @GetMapping("/{patioId}/boxes")
    public ResponseEntity<Set<BoxResponseDto>> getBoxesByPatioId(@PathVariable Long patioId) {
        log.info("Buscando boxes do pátio ID: {}", patioId); //
        Set<BoxResponseDto> boxes = patioService.getBoxesByPatioId(patioId) //
                .stream().map(boxMapper::toResponseDto).collect(Collectors.toSet());
        log.info("Retornando {} boxes para o pátio ID {}.", boxes.size(), patioId); //
        return ResponseEntity.ok(boxes);
    }

    // ==================================================
    // ENDPOINTS HIERÁRQUICOS PARA FRONTEND
    // ==================================================

    // --- Endpoints para Zonas por Pátio ---
    @Operation(summary = "Listar zonas de um pátio com paginação", 
               description = "Retorna uma página de zonas de um pátio específico com status.")
    @GetMapping("/{patioId}/status/{patioStatus}/zonas")
    public ResponseEntity<Page<ZonaResponseDto>> listarZonasPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PageableDefault(size = 10, sort = "nome") Pageable pageable) {
        log.info("Buscando zonas do pátio ID: {} com status: {}", patioId, patioStatus);
        Page<ZonaResponseDto> zonas = patioService.listarZonasPorPatio(patioId, patioStatus, pageable);
        log.info("Retornando {} zonas para o pátio ID {}.", zonas.getNumberOfElements(), patioId);
        return ResponseEntity.ok(zonas);
    }

    @Operation(summary = "Criar zona em um pátio", 
               description = "Cria uma nova zona associada a um pátio específico.")
    @PostMapping("/{patioId}/status/{patioStatus}/zonas")
    public ResponseEntity<ZonaResponseDto> criarZonaPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @Valid @RequestBody ZonaRequestDto zonaRequestDto) {
        log.info("Criando zona para o pátio ID: {} com status: {}", patioId, patioStatus);
        ZonaResponseDto zona = patioService.criarZonaPorPatio(patioId, patioStatus, zonaRequestDto);
        log.info("Zona criada com ID: {} para o pátio ID: {}", zona.getIdZona(), patioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(zona);
    }

    @Operation(summary = "Buscar zona por ID em um pátio", 
               description = "Retorna uma zona específica de um pátio.")
    @GetMapping("/{patioId}/status/{patioStatus}/zonas/{zonaId}")
    public ResponseEntity<ZonaResponseDto> buscarZonaPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PathVariable Long zonaId) {
        log.info("Buscando zona ID: {} do pátio ID: {} com status: {}", zonaId, patioId, patioStatus);
        ZonaResponseDto zona = patioService.buscarZonaPorPatio(patioId, patioStatus, zonaId);
        log.info("Zona ID: {} encontrada no pátio ID: {}", zonaId, patioId);
        return ResponseEntity.ok(zona);
    }

    @Operation(summary = "Atualizar zona em um pátio", 
               description = "Atualiza uma zona específica de um pátio.")
    @PutMapping("/{patioId}/status/{patioStatus}/zonas/{zonaId}")
    public ResponseEntity<ZonaResponseDto> atualizarZonaPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PathVariable Long zonaId,
            @Valid @RequestBody ZonaRequestDto zonaRequestDto) {
        log.info("Atualizando zona ID: {} do pátio ID: {} com status: {}", zonaId, patioId, patioStatus);
        ZonaResponseDto zona = patioService.atualizarZonaPorPatio(patioId, patioStatus, zonaId, zonaRequestDto);
        log.info("Zona ID: {} atualizada no pátio ID: {}", zonaId, patioId);
        return ResponseEntity.ok(zona);
    }

    @Operation(summary = "Excluir zona de um pátio", 
               description = "Remove uma zona específica de um pátio.")
    @DeleteMapping("/{patioId}/status/{patioStatus}/zonas/{zonaId}")
    public ResponseEntity<Void> excluirZonaPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PathVariable Long zonaId) {
        log.info("Excluindo zona ID: {} do pátio ID: {} com status: {}", zonaId, patioId, patioStatus);
        patioService.excluirZonaPorPatio(patioId, patioStatus, zonaId);
        log.info("Zona ID: {} excluída do pátio ID: {}", zonaId, patioId);
        return ResponseEntity.noContent().build();
    }

    // --- Endpoints para Boxes por Pátio ---
    @Operation(summary = "Listar boxes de um pátio com paginação", 
               description = "Retorna uma página de boxes de um pátio específico com status.")
    @GetMapping("/{patioId}/status/{patioStatus}/boxes")
    public ResponseEntity<Page<BoxResponseDto>> listarBoxesPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PageableDefault(size = 10, sort = "nome") Pageable pageable) {
        log.info("Buscando boxes do pátio ID: {} com status: {}", patioId, patioStatus);
        Page<BoxResponseDto> boxes = patioService.listarBoxesPorPatio(patioId, patioStatus, pageable);
        log.info("Retornando {} boxes para o pátio ID {}.", boxes.getNumberOfElements(), patioId);
        return ResponseEntity.ok(boxes);
    }

    @Operation(summary = "Criar box em um pátio", 
               description = "Cria um novo box associado a um pátio específico.")
    @PostMapping("/{patioId}/status/{patioStatus}/boxes")
    public ResponseEntity<BoxResponseDto> criarBoxPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @Valid @RequestBody BoxRequestDto boxRequestDto) {
        log.info("Criando box para o pátio ID: {} com status: {}", patioId, patioStatus);
        BoxResponseDto box = patioService.criarBoxPorPatio(patioId, patioStatus, boxRequestDto);
        log.info("Box criado com ID: {} para o pátio ID: {}", box.getIdBox(), patioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(box);
    }

    @Operation(summary = "Buscar box por ID em um pátio", 
               description = "Retorna um box específico de um pátio.")
    @GetMapping("/{patioId}/status/{patioStatus}/boxes/{boxId}")
    public ResponseEntity<BoxResponseDto> buscarBoxPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PathVariable Long boxId) {
        log.info("Buscando box ID: {} do pátio ID: {} com status: {}", boxId, patioId, patioStatus);
        BoxResponseDto box = patioService.buscarBoxPorPatio(patioId, patioStatus, boxId);
        log.info("Box ID: {} encontrado no pátio ID: {}", boxId, patioId);
        return ResponseEntity.ok(box);
    }

    @Operation(summary = "Atualizar box em um pátio", 
               description = "Atualiza um box específico de um pátio.")
    @PutMapping("/{patioId}/status/{patioStatus}/boxes/{boxId}")
    public ResponseEntity<BoxResponseDto> atualizarBoxPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PathVariable Long boxId,
            @Valid @RequestBody BoxRequestDto boxRequestDto) {
        log.info("Atualizando box ID: {} do pátio ID: {} com status: {}", boxId, patioId, patioStatus);
        BoxResponseDto box = patioService.atualizarBoxPorPatio(patioId, patioStatus, boxId, boxRequestDto);
        log.info("Box ID: {} atualizado no pátio ID: {}", boxId, patioId);
        return ResponseEntity.ok(box);
    }

    @Operation(summary = "Excluir box de um pátio", 
               description = "Remove um box específico de um pátio.")
    @DeleteMapping("/{patioId}/status/{patioStatus}/boxes/{boxId}")
    public ResponseEntity<Void> excluirBoxPorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @PathVariable Long boxId) {
        log.info("Excluindo box ID: {} do pátio ID: {} com status: {}", boxId, patioId, patioStatus);
        patioService.excluirBoxPorPatio(patioId, patioStatus, boxId);
        log.info("Box ID: {} excluído do pátio ID: {}", boxId, patioId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Gerar boxes em lote para um pátio", 
               description = "Cria múltiplos boxes com prefixo sequencial para um pátio.")
    @PostMapping("/{patioId}/status/{patioStatus}/boxes/gerar-lote")
    public ResponseEntity<Void> gerarBoxesEmLotePorPatio(
            @PathVariable Long patioId,
            @PathVariable String patioStatus,
            @Valid @RequestBody BoxController.GerarBoxRequestDto request) {
        log.info("Gerando {} boxes com prefixo '{}' para o pátio ID: {} com status: {}", 
                request.quantidade(), request.prefixo(), patioId, patioStatus);
        patioService.gerarBoxesEmLotePorPatio(patioId, patioStatus, request.prefixo(), request.quantidade());
        log.info("{} boxes gerados para o pátio ID: {}", request.quantidade(), patioId);
        return ResponseEntity.ok().build();
    }

}