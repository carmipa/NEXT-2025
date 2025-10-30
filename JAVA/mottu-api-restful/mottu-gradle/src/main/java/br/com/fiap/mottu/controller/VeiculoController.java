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
import org.springframework.data.domain.Page; // Para resultados paginados
import org.springframework.data.domain.PageRequest; // Para criar Pageable
import org.springframework.data.domain.Pageable; // Para controle de paginação e ordenação
import org.springframework.data.web.PageableDefault; // Para valores padrão de Pageable
import org.springframework.http.HttpStatus; // Enum para códigos de status HTTP
import org.springframework.http.ResponseEntity; // Classe para construir respostas HTTP
import org.springframework.web.bind.annotation.*; // Anotações para mapeamento de requisições web
import jakarta.validation.Valid; // Para validar DTOs de entrada

import java.util.Optional; // Para Optional
import java.util.HashMap; // Para HashMap
import java.util.Map; // Para Map
import java.util.List; // Para List
import java.util.ArrayList;

@RestController
@RequestMapping("/api/veiculos")
@Tag(name = "Veiculos", description = "Gerenciamento de Veículos, incluindo Rastreamento e Localização")
public class VeiculoController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoController.class);
    private final VeiculoService veiculoService;
    private final VeiculoMapper veiculoMapper;
    private final VeiculoRepository veiculoRepository; // Injetado para o novo endpoint

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

    // NOVO ENDPOINT: Para buscar facilmente os veículos estacionados
    @Operation(summary = "Listar todos os veículos que estão atualmente estacionados")
    @GetMapping("/estacionados")
    public ResponseEntity<List<VeiculoLocalizacaoResponseDto>> getVeiculosEstacionados() {
        log.info("Buscando todos os veículos atualmente estacionados.");
        List<VeiculoLocalizacaoResponseDto> localizacoes = veiculoService.listarVeiculosEstacionados();

        log.info("Retornando {} veículos estacionados.", localizacoes.size());
        return ResponseEntity.ok(localizacoes);
    }

    // NOVO ENDPOINT: Debug para verificar se uma placa específica existe
    @Operation(summary = "Debug: Verificar se uma placa específica existe no banco")
    @GetMapping("/debug-placa/{placa}")
    public ResponseEntity<Map<String, Object>> debugPlaca(@PathVariable String placa) {
        log.info("Debug: Verificando se a placa {} existe no banco.", placa);
        
        Map<String, Object> response = new HashMap<>();
        response.put("placaBuscada", placa);
        
        // Teste 1: Busca exata
        Optional<Veiculo> veiculoExato = veiculoRepository.findByPlaca(placa);
        response.put("buscaExata", veiculoExato.isPresent());
        if (veiculoExato.isPresent()) {
            response.put("veiculoExato", Map.of(
                "id", veiculoExato.get().getIdVeiculo(),
                "placa", veiculoExato.get().getPlaca(),
                "modelo", veiculoExato.get().getModelo()
            ));
        }
        
        // Teste 2: Busca case-insensitive
        Optional<Veiculo> veiculoIgnoreCase = veiculoRepository.findByPlacaIgnoreCase(placa);
        response.put("buscaIgnoreCase", veiculoIgnoreCase.isPresent());
        if (veiculoIgnoreCase.isPresent()) {
            response.put("veiculoIgnoreCase", Map.of(
                "id", veiculoIgnoreCase.get().getIdVeiculo(),
                "placa", veiculoIgnoreCase.get().getPlaca(),
                "modelo", veiculoIgnoreCase.get().getModelo()
            ));
        }
        
        // Teste 3: Busca com filtro
        try {
            VeiculoFilter filter = new VeiculoFilter(placa, null, null, null, null, null, null, null, null, null, null, null, null);
            Page<Veiculo> veiculosPage = veiculoService.buscarVeiculosPorFiltro(filter, PageRequest.of(0, 1));
            response.put("buscaComFiltro", veiculosPage.getTotalElements() > 0);
            if (veiculosPage.getTotalElements() > 0) {
                Veiculo veiculo = veiculosPage.getContent().get(0);
                response.put("veiculoFiltro", Map.of(
                    "id", veiculo.getIdVeiculo(),
                    "placa", veiculo.getPlaca(),
                    "modelo", veiculo.getModelo()
                ));
            }
        } catch (Exception e) {
            response.put("erroFiltro", e.getMessage());
        }
        
        // Teste 4: Listar todas as placas para comparação
        List<String> todasPlacas = veiculoRepository.listarPlacas();
        response.put("totalPlacasNoBanco", todasPlacas.size());
        response.put("placasSimilares", todasPlacas.stream()
            .filter(p -> p.contains(placa.toUpperCase()) || placa.toUpperCase().contains(p))
            .toList());
        
        return ResponseEntity.ok(response);
    }

    // NOVO ENDPOINT: Debug para verificar dados de pátio
    @Operation(summary = "Debug: Verificar dados de pátio para veículos estacionados")
    @GetMapping("/debug-patio")
    public ResponseEntity<Map<String, Object>> debugPatio() {
        log.info("Debug: Verificando dados de pátio para veículos estacionados.");
        
        List<VeiculoLocalizacaoResponseDto> veiculos = veiculoService.listarVeiculosEstacionados();
        List<Map<String, Object>> debugInfo = new ArrayList<>();
        
        for (VeiculoLocalizacaoResponseDto veiculo : veiculos) {
            Map<String, Object> info = new HashMap<>();
            info.put("veiculoId", veiculo.getIdVeiculo());
            info.put("placa", veiculo.getPlaca());
            info.put("modelo", veiculo.getModelo());
            
            // Verificar informações do box associado
            if (veiculo.getBoxAssociado() != null) {
                info.put("boxId", veiculo.getBoxAssociado().getIdBox());
                info.put("boxNome", veiculo.getBoxAssociado().getNome());
                info.put("boxStatus", veiculo.getBoxAssociado().getStatus());
            } else {
                info.put("boxId", null);
                info.put("boxNome", "NULL");
                info.put("boxStatus", "NULL");
            }
            
            // Verificar informações do pátio associado
            if (veiculo.getPatioAssociado() != null) {
                info.put("patioId", veiculo.getPatioAssociado().getIdPatio());
                info.put("patioNome", veiculo.getPatioAssociado().getNomePatio());
            } else {
                info.put("patioId", null);
                info.put("patioNome", "NULL");
            }
            debugInfo.add(info);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalVeiculos", veiculos.size());
        result.put("veiculos", debugInfo);
        
        return ResponseEntity.ok(result);
    }

    // NOVO ENDPOINT: Verificar dados de pátio no banco
    @Operation(summary = "Debug: Verificar dados de pátio no banco")
    @GetMapping("/debug-patio-db")
    public ResponseEntity<Map<String, Object>> debugPatioDb() {
        log.info("Debug: Verificando dados de pátio no banco de dados.");
        
        Map<String, Object> result = new HashMap<>();
        
        // Verificar se há pátios cadastrados
        List<VeiculoLocalizacaoResponseDto> veiculos = veiculoService.listarVeiculosEstacionados();
        result.put("totalVeiculosEstacionados", veiculos.size());
        
        // Verificar boxes e seus pátios
        List<Map<String, Object>> boxesInfo = new ArrayList<>();
        for (VeiculoLocalizacaoResponseDto veiculo : veiculos) {
            Map<String, Object> boxInfo = new HashMap<>();
            boxInfo.put("veiculoPlaca", veiculo.getPlaca());
            
            if (veiculo.getBoxAssociado() != null) {
                boxInfo.put("boxId", veiculo.getBoxAssociado().getIdBox());
                boxInfo.put("boxNome", veiculo.getBoxAssociado().getNome());
                boxInfo.put("boxStatus", veiculo.getBoxAssociado().getStatus());
                
                // Verificar se o pátio está carregado
                if (veiculo.getPatioAssociado() != null) {
                    boxInfo.put("patioId", veiculo.getPatioAssociado().getIdPatio());
                    boxInfo.put("patioNome", veiculo.getPatioAssociado().getNomePatio());
                    boxInfo.put("patioCarregado", true);
                } else {
                    boxInfo.put("patioId", null);
                    boxInfo.put("patioNome", "NULL");
                    boxInfo.put("patioCarregado", false);
                }
            } else {
                boxInfo.put("boxId", null);
                boxInfo.put("boxNome", "NULL");
                boxInfo.put("boxStatus", "NULL");
                boxInfo.put("patioId", null);
                boxInfo.put("patioNome", "NULL");
                boxInfo.put("patioCarregado", false);
            }
            
            boxesInfo.add(boxInfo);
        }
        
        result.put("boxes", boxesInfo);
        return ResponseEntity.ok(result);
    }

    // NOVO ENDPOINT: Associar pátio padrão aos boxes sem pátio
    @Operation(summary = "Debug: Associar pátio padrão aos boxes sem pátio")
    @PostMapping("/debug-associar-patio")
    public ResponseEntity<Map<String, Object>> associarPatioPadrao() {
        log.info("Debug: Associando pátio padrão aos boxes sem pátio.");
        
        Map<String, Object> result = new HashMap<>();
        
        // Buscar veículos estacionados
        List<VeiculoLocalizacaoResponseDto> veiculos = veiculoService.listarVeiculosEstacionados();
        int boxesSemPatio = 0;
        int boxesComPatio = 0;
        
        for (VeiculoLocalizacaoResponseDto veiculo : veiculos) {
            if (veiculo.getBoxAssociado() != null) {
                if (veiculo.getPatioAssociado() == null) {
                    boxesSemPatio++;
                    log.warn("Box {} não tem pátio associado", veiculo.getBoxAssociado().getNome());
                } else {
                    boxesComPatio++;
                }
            }
        }
        
        result.put("boxesSemPatio", boxesSemPatio);
        result.put("boxesComPatio", boxesComPatio);
        result.put("totalBoxes", boxesSemPatio + boxesComPatio);
        result.put("mensagem", "Verificação concluída. Use o endpoint de pátios para associar boxes a pátios.");
        
        return ResponseEntity.ok(result);
    }

    // NOVO ENDPOINT: Teste simples para verificar dados de pátio
    @Operation(summary = "Teste: Verificar dados de pátio simples")
    @GetMapping("/teste-patio")
    public ResponseEntity<Map<String, Object>> testePatio() {
        log.info("Teste: Verificando dados de pátio de forma simples.");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<VeiculoLocalizacaoResponseDto> veiculos = veiculoService.listarVeiculosEstacionados();
            result.put("totalVeiculos", veiculos.size());
            
            List<Map<String, Object>> veiculosInfo = new ArrayList<>();
            for (VeiculoLocalizacaoResponseDto veiculo : veiculos) {
                Map<String, Object> veiculoInfo = new HashMap<>();
                veiculoInfo.put("placa", veiculo.getPlaca());
                veiculoInfo.put("modelo", veiculo.getModelo());
                
                List<Map<String, Object>> boxesInfo = new ArrayList<>();
                if (veiculo.getBoxAssociado() != null) {
                    Map<String, Object> boxInfo = new HashMap<>();
                    boxInfo.put("boxNome", veiculo.getBoxAssociado().getNome());
                    boxInfo.put("boxStatus", veiculo.getBoxAssociado().getStatus());
                    
                    // Verificar pátio associado
                    if (veiculo.getPatioAssociado() != null) {
                        boxInfo.put("patioId", veiculo.getPatioAssociado().getIdPatio());
                        boxInfo.put("patioNome", veiculo.getPatioAssociado().getNomePatio());
                        boxInfo.put("patioCarregado", true);
                    } else {
                        boxInfo.put("patioId", null);
                        boxInfo.put("patioNome", "NULL");
                        boxInfo.put("patioCarregado", false);
                    }
                    
                    boxesInfo.add(boxInfo);
                }
                
                veiculoInfo.put("boxes", boxesInfo);
                veiculosInfo.add(veiculoInfo);
            }
            
            result.put("veiculos", veiculosInfo);
            result.put("sucesso", true);
            
        } catch (Exception e) {
            result.put("sucesso", false);
            result.put("erro", e.getMessage());
            log.error("Erro no teste de pátio: ", e);
        }
        
        return ResponseEntity.ok(result);
    }

    // NOVO ENDPOINT: Para gerar automaticamente a próxima Tag BLE
    @Operation(
            summary = "Gerar próxima Tag BLE disponível",
            description = "Gera automaticamente a próxima Tag BLE disponível no formato TAG001, TAG002, etc.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Próxima Tag BLE gerada com sucesso",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"tagBleId\": \"TAG001\"}")))
            }
    )
    @GetMapping("/proxima-tag-ble")
    public ResponseEntity<ProximaTagBleResponse> gerarProximaTagBle() {
        log.info("Gerando próxima Tag BLE disponível.");
        String proximaTag = veiculoService.gerarProximaTagBle();
        log.info("Próxima Tag BLE gerada: {}", proximaTag);
        return ResponseEntity.ok(new ProximaTagBleResponse(proximaTag));
    }

    // Classe interna para resposta da próxima tag
    public static class ProximaTagBleResponse {
        private final String tagBleId;

        public ProximaTagBleResponse(String tagBleId) {
            this.tagBleId = tagBleId;
        }

        public String getTagBleId() {
            return tagBleId;
        }
    }
}
