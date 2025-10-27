package br.com.fiap.mottu.controller;

// DTOs de Requisição e Resposta
import br.com.fiap.mottu.dto.patio.PatioRequestDto; //
import br.com.fiap.mottu.dto.patio.PatioResponseDto; //
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto; //
import br.com.fiap.mottu.dto.zona.ZonaResponseDto;       //
import br.com.fiap.mottu.dto.box.BoxResponseDto;         //
import br.com.fiap.mottu.dto.contato.ContatoResponseDto; //
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto; //
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
// Exceções (tratadas globalmente)
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
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired // Construtor para injeção de dependências
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

    @Operation(summary = "Deletar pátio", description = "Exclui um pátio.") //
    @ApiResponse(responseCode = "204", description = "Pátio deletado") //
    @ApiResponse(responseCode = "404", description = "Pátio não encontrado") // Tratado globalmente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPatio(@PathVariable Long id) {
        log.info("Deletando pátio ID: {}", id); //
        patioService.deletarPatio(id); //
        log.info("Pátio ID {} deletado.", id); //
        return ResponseEntity.noContent().build(); //
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
    @Operation(summary = "Associar zona a um pátio") //
    @ApiResponse(responseCode = "201", description = "Associação criada") //
    @PostMapping("/{patioId}/zonas/{zonaId}/associar")
    public ResponseEntity<String> associarPatioZona(@PathVariable Long patioId, @PathVariable Long zonaId) { //
        log.info("Associando zona ID {} ao pátio ID {}.", zonaId, patioId); //
        patioService.associarPatioZona(patioId, zonaId); //
        log.info("Associação Pátio {} e Zona {} criada.", patioId, zonaId); //
        return ResponseEntity.status(HttpStatus.CREATED).body("Associação criada com sucesso."); //
    }

    @Operation(summary = "Desassociar zona de um pátio") //
    @ApiResponse(responseCode = "204", description = "Associação removida") //
    @DeleteMapping("/{patioId}/zonas/{zonaId}/desassociar")
    public ResponseEntity<Void> desassociarPatioZona(@PathVariable Long patioId, @PathVariable Long zonaId) {
        log.info("Desassociando zona ID {} do pátio ID {}.", zonaId, patioId); //
        patioService.desassociarPatioZona(patioId, zonaId); //
        log.info("Associação Pátio {} e Zona {} removida.", patioId, zonaId); //
        return ResponseEntity.noContent().build(); //
    }

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

    // --- Endpoints de Associação de Contatos com Pátio ---
    @Operation(summary = "Associar contato a um pátio") //
    @ApiResponse(responseCode = "201", description = "Associação criada") //
    @PostMapping("/{patioId}/contatos/{contatoId}/associar")
    public ResponseEntity<String> associarPatioContato(@PathVariable Long patioId, @PathVariable Long contatoId) { //
        log.info("Associando contato ID {} ao pátio ID {}.", contatoId, patioId); //
        patioService.associarPatioContato(patioId, contatoId); //
        log.info("Associação Pátio {} e Contato {} criada.", patioId, contatoId); //
        return ResponseEntity.status(HttpStatus.CREATED).body("Associação criada com sucesso."); //
    }

    @Operation(summary = "Desassociar contato de um pátio") //
    @ApiResponse(responseCode = "204", description = "Associação removida") //
    @DeleteMapping("/{patioId}/contatos/{contatoId}/desassociar")
    public ResponseEntity<Void> desassociarPatioContato(@PathVariable Long patioId, @PathVariable Long contatoId) {
        log.info("Desassociando contato ID {} do pátio ID {}.", contatoId, patioId); //
        patioService.desassociarPatioContato(patioId, contatoId); //
        log.info("Associação Pátio {} e Contato {} removida.", patioId, contatoId); //
        return ResponseEntity.noContent().build(); //
    }

    @Operation(summary = "Listar contatos de um pátio") //
    @ApiResponse(responseCode = "200", description = "Contatos do pátio", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Set.class))) //
    @GetMapping("/{patioId}/contatos")
    public ResponseEntity<Set<ContatoResponseDto>> getContatosByPatioId(@PathVariable Long patioId) {
        log.info("Buscando contatos do pátio ID: {}", patioId); //
        Set<ContatoResponseDto> contatos = patioService.getContatosByPatioId(patioId) //
                .stream().map(contatoMapper::toResponseDto).collect(Collectors.toSet());
        log.info("Retornando {} contatos para o pátio ID {}.", contatos.size(), patioId); //
        return ResponseEntity.ok(contatos);
    }

    // --- Endpoints de Associação de Endereços com Pátio ---
    @Operation(summary = "Associar endereço a um pátio") //
    @ApiResponse(responseCode = "201", description = "Associação criada") //
    @PostMapping("/{patioId}/enderecos/{enderecoId}/associar")
    public ResponseEntity<String> associarPatioEndereco(@PathVariable Long patioId, @PathVariable Long enderecoId) { //
        log.info("Associando endereço ID {} ao pátio ID {}.", enderecoId, patioId); //
        patioService.associarPatioEndereco(patioId, enderecoId); //
        log.info("Associação Pátio {} e Endereço {} criada.", patioId, enderecoId); //
        return ResponseEntity.status(HttpStatus.CREATED).body("Associação criada com sucesso."); //
    }

    @Operation(summary = "Desassociar endereço de um pátio") //
    @ApiResponse(responseCode = "204", description = "Associação removida") //
    @DeleteMapping("/{patioId}/enderecos/{enderecoId}/desassociar")
    public ResponseEntity<Void> desassociarPatioEndereco(@PathVariable Long patioId, @PathVariable Long enderecoId) {
        log.info("Desassociando endereço ID {} do pátio ID {}.", enderecoId, patioId); //
        patioService.desassociarPatioEndereco(patioId, enderecoId); //
        log.info("Associação Pátio {} e Endereço {} removida.", patioId, enderecoId); //
        return ResponseEntity.noContent().build(); //
    }

    @Operation(summary = "Listar endereços de um pátio") //
    @ApiResponse(responseCode = "200", description = "Endereços do pátio", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Set.class))) //
    @GetMapping("/{patioId}/enderecos")
    public ResponseEntity<Set<EnderecoResponseDto>> getEnderecosByPatioId(@PathVariable Long patioId) {
        log.info("Buscando endereços do pátio ID: {}", patioId); //
        Set<EnderecoResponseDto> enderecos = patioService.getEnderecosByPatioId(patioId) //
                .stream().map(enderecoMapper::toResponseDto).collect(Collectors.toSet());
        log.info("Retornando {} endereços para o pátio ID {}.", enderecos.size(), patioId); //
        return ResponseEntity.ok(enderecos);
    }

    // --- Endpoints de Associação de Boxes com Pátio ---
    @Operation(summary = "Associar box a um pátio") //
    @ApiResponse(responseCode = "201", description = "Associação criada") //
    @PostMapping("/{patioId}/boxes/{boxId}/associar")
    public ResponseEntity<String> associarPatioBox(@PathVariable Long patioId, @PathVariable Long boxId) { //
        log.info("Associando box ID {} ao pátio ID {}.", boxId, patioId); //
        patioService.associarPatioBox(patioId, boxId); //
        log.info("Associação Pátio {} e Box {} criada.", patioId, boxId); //
        return ResponseEntity.status(HttpStatus.CREATED).body("Associação criada com sucesso."); //
    }

    @Operation(summary = "Desassociar box de um pátio") //
    @ApiResponse(responseCode = "204", description = "Associação removida") //
    @DeleteMapping("/{patioId}/boxes/{boxId}/desassociar")
    public ResponseEntity<Void> desassociarPatioBox(@PathVariable Long patioId, @PathVariable Long boxId) {
        log.info("Desassociando box ID {} do pátio ID {}.", boxId, patioId); //
        patioService.desassociarPatioBox(patioId, boxId); //
        log.info("Associação Pátio {} e Box {} removida.", patioId, boxId); //
        return ResponseEntity.noContent().build(); //
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
}