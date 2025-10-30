package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.mapglobal.MapGlobalPatioDto;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.service.MapGlobalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller para operações do mapa global
 */
@RestController
@RequestMapping("/api/mapa-global")
@Tag(name = "Mapa Global", description = "Endpoints para visualização de todos os pátios em mapa global")
@Slf4j
public class MapGlobalController {
    
    private final MapGlobalService mapGlobalService;
    
    @Autowired
    public MapGlobalController(MapGlobalService mapGlobalService) {
        this.mapGlobalService = mapGlobalService;
    }
    
    @Operation(
        summary = "Buscar todos os pátios para mapa global",
        description = "Retorna todos os pátios ativos com informações completas para exibição no mapa global, incluindo coordenadas, estatísticas de vagas e percentual de ocupação."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Lista de pátios retornada com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MapGlobalPatioDto.class),
                examples = @ExampleObject(
                    value = """
                    {
                      "patios": [
                        {
                          "id": 1,
                          "nome": "Mottu Patio Guarulhos",
                          "endereco": "Rua Antônio Pegoraro, 110 - Jardim dos Afonsos",
                          "cidade": "Guarulhos",
                          "estado": "SP",
                          "cep": "07115-000",
                          "latitude": -23.4538,
                          "longitude": -46.5331,
                          "totalVagas": 100,
                          "vagasLivres": 75,
                          "vagasOcupadas": 20,
                          "vagasManutencao": 5,
                          "percentualOcupacao": 20.0,
                          "status": "ATIVO"
                        }
                      ],
                      "totalPatios": 1,
                      "totalVagas": 100,
                      "totalVagasLivres": 75,
                      "totalVagasOcupadas": 20,
                      "totalVagasManutencao": 5,
                      "percentualOcupacaoGeral": 20.0,
                      "ultimaAtualizacao": "2025-01-24T14:30:00"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Erro interno do servidor",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                      "erro": "Erro ao buscar pátios: Mensagem do erro"
                    }
                    """
                )
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<MapGlobalPatioDto>> buscarTodosPatios() {
        try {
            log.info("🗺️ MapGlobalController: Buscando todos os pátios para mapa global");
            List<MapGlobalPatioDto> patios = mapGlobalService.buscarTodosPatios();
            log.info("✅ MapGlobalController: Retornando {} pátios", patios.size());
            log.info("🔍 MapGlobalController: Dados dos pátios: {}", patios);
            return ResponseEntity.ok(patios);
        } catch (Exception e) {
            log.error("❌ MapGlobalController: Erro ao buscar pátios", e);
            throw e;
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugPatios() {
        try {
            log.info("🔍 MapGlobalController: Debug - Verificando pátios");
            
            Map<String, Object> result = new HashMap<>();
            
            // Buscar pátios diretamente do repository
            List<Patio> patios = mapGlobalService.getPatioRepository().findAll();
            result.put("totalPatios", patios.size());
            result.put("patios", patios.stream().map(p -> Map.of(
                "id", p.getIdPatio(),
                "nome", p.getNomePatio(),
                "status", p.getStatus()
            )).toList());
            
            // Testar query do mapa global
            List<MapGlobalPatioDto> patiosMapa = mapGlobalService.buscarTodosPatios();
            result.put("patiosMapa", patiosMapa.size());
            result.put("patiosMapaData", patiosMapa);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ MapGlobalController: Erro no debug", e);
            throw e;
        }
    }
    
    @Operation(
        summary = "Buscar pátios com paginação",
        description = "Retorna pátios paginados para o mapa global. Útil para grandes volumes de dados."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Pátios paginados retornados com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class)
            )
        )
    })
    @GetMapping("/paginado")
    public ResponseEntity<Page<MapGlobalPatioDto>> buscarPatiosPaginados(
            @Parameter(description = "Número da página (começando em 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Tamanho da página", example = "10")
            @RequestParam(defaultValue = "10") int size,
            
            @Parameter(description = "Campo para ordenação", example = "nome")
            @RequestParam(defaultValue = "nome") String sortBy,
            
            @Parameter(description = "Direção da ordenação (ASC ou DESC)", example = "ASC")
            @RequestParam(defaultValue = "ASC") String sortDir) {
        
        try {
            log.info("🗺️ MapGlobalController: Buscando pátios paginados - página: {}, tamanho: {}", page, size);
            
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<MapGlobalPatioDto> response = mapGlobalService.buscarPatiosPaginados(pageable);
            log.info("✅ MapGlobalController: Retornando {} pátios da página {}", 
                    response.getContent().size(), page);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ MapGlobalController: Erro ao buscar pátios paginados", e);
            throw e;
        }
    }
    
    @Operation(
        summary = "Buscar pátios por cidade",
        description = "Retorna pátios filtrados por cidade para o mapa global."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Pátios da cidade retornados com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MapGlobalPatioDto.class)
            )
        )
    })
    @GetMapping("/cidade/{cidade}")
    public ResponseEntity<List<MapGlobalPatioDto>> buscarPatiosPorCidade(
            @Parameter(description = "Nome da cidade para filtrar", example = "São Paulo")
            @PathVariable String cidade) {
        
        try {
            log.info("🗺️ MapGlobalController: Buscando pátios na cidade: {}", cidade);
            List<MapGlobalPatioDto> patios = mapGlobalService.buscarPatiosPorCidade(cidade);
            log.info("✅ MapGlobalController: Retornando {} pátios na cidade {}", 
                    patios.size(), cidade);
            
            return ResponseEntity.ok(patios);
        } catch (Exception e) {
            log.error("❌ MapGlobalController: Erro ao buscar pátios por cidade", e);
            throw e;
        }
    }
    
    @Operation(
        summary = "Invalidar cache do mapa global",
        description = "Remove todos os dados em cache do mapa global, forçando uma nova consulta ao banco de dados."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Cache invalidado com sucesso",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                      "mensagem": "Cache do mapa global invalidado com sucesso",
                      "timestamp": "2025-01-24T14:30:00"
                    }
                    """
                )
            )
        )
    })
    @PostMapping("/invalidate-cache")
    public ResponseEntity<Object> invalidarCache() {
        try {
            log.info("🗑️ MapGlobalController: Invalidando cache do mapa global");
            mapGlobalService.invalidarCache();
            
            return ResponseEntity.ok(java.util.Map.of(
                "mensagem", "Cache do mapa global invalidado com sucesso",
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.error("❌ MapGlobalController: Erro ao invalidar cache", e);
            throw e;
        }
    }
}
