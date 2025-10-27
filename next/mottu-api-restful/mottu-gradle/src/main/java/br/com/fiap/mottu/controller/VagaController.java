package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.service.VagaOracleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.*;

/**
 * Endpoints para ocupação de boxes.
 * Sem DTOs extras de "mapa": retornos em JSON simples para a UI.
 */
@RestController
@RequestMapping("/api/vagas")
@Tag(name = "Vagas", description = "Mapa 2D e alocação de boxes (Oracle)")
@Slf4j
public class VagaController {

    private final VagaOracleService service;

    public VagaController(VagaOracleService service) {
        this.service = service;
    }

    /**
     * Lista todas as vagas com informações completas.
     * Retorna um array de vagas com dados do pátio, box e veículo.
     */
    @Operation(summary = "Listar todas as vagas com informações completas")
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarVagas() {
        log.info("📋 VagaController: Listando todas as vagas");
        
        var vagas = service.listarTodasVagasComDetalhes();
        log.info("📊 VagaController: Encontradas {} vagas", vagas.size());
        
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (var vaga : vagas) {
            Map<String, Object> vagaData = new LinkedHashMap<>();
            vagaData.put("idVaga", vaga.idVaga());
            vagaData.put("nomeBox", vaga.nomeBox());
            vagaData.put("status", vaga.status());
            vagaData.put("placa", vaga.placa());
            vagaData.put("dataHoraOcupacao", vaga.dataHoraOcupacao());
            vagaData.put("dataHoraLiberacao", vaga.dataHoraLiberacao());
            
            // Dados do pátio
            Map<String, Object> patioData = new LinkedHashMap<>();
            patioData.put("idPatio", vaga.idPatio());
            patioData.put("nomePatio", vaga.nomePatio());
            patioData.put("endereco", vaga.endereco());
            vagaData.put("patio", patioData);
            
            resultado.add(vagaData);
        }
        
        return ResponseEntity.ok(resultado);
    }

    /**
     * Mapa 2D atual.
     * Retorna um JSON no formato:
     * {
     *   "rows": 4,
     *   "cols": 5,
     *   "boxes": [
     *     { "box": <BoxResponseDto>, "placa": "ABC1D23" | null }
     *   ]
     * }
     */
    @Operation(summary = "Mapa 2D com detalhes do veículo. Cada item contém dados do box e, se ocupado, um objeto 'veiculo'.")
    @GetMapping("/mapa")
    public ResponseEntity<Map<String, Object>> mapa(@RequestParam(required = false) Long patioId) {
        log.info("🗺️ VagaController: Recebida requisição para mapa com patioId = {}", patioId);
        final int rows = 4; // Seus valores de layout
        final int cols = 5;

        // ALTERADO: Chama o novo método do serviço com filtro por pátio
        var rowsDb = service.listarBoxesComDetalhesVeiculo(patioId);
        log.info("📊 VagaController: Recebidos {} boxes do serviço", rowsDb.size());

        List<Map<String, Object>> boxes = new ArrayList<>(rowsDb.size());
        for (var r : rowsDb) {
            Map<String, Object> boxData = new LinkedHashMap<>();
            boxData.put("idBox", r.idBox());
            boxData.put("nome", r.nome());
            boxData.put("status", r.status());
            boxData.put("dataEntrada", r.dataEntrada());
            boxData.put("dataSaida", r.dataSaida());
            boxData.put("observacao", r.observacao());

            // CORREÇÃO: No modelo atual, STATUS='O' significa ocupado, 'L' significa livre
            if ("O".equals(r.status()) && r.placa() != null) {
                Map<String, Object> veiculoData = new LinkedHashMap<>();
                veiculoData.put("placa", r.placa());
                veiculoData.put("modelo", r.modelo());
                veiculoData.put("fabricante", r.fabricante());
                veiculoData.put("tagBleId", r.tagBleId());
                boxData.put("veiculo", veiculoData);
            } else {
                boxData.put("veiculo", null);
            }

            boxes.add(boxData);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("rows", rows);
        body.put("cols", cols);
        body.put("boxes", boxes);
        log.info("✅ VagaController: Retornando resposta com {} boxes", boxes.size());
        return ResponseEntity.ok(body);
    }
    /**
     * Armazena (aloca) uma placa em um box.
     * body:
     * { "placa": "ABC1D23", "boxId": 12 (opcional) }
     *
     * resposta: { ok, message, placa, boxId }
     */
    @Operation(summary = "Armazenar placa (aloca box). Se não informar boxId, usa primeiro livre.")
    @PostMapping("/armazenar")
    public ResponseEntity<Map<String, Object>> armazenar(@RequestBody Map<String, String> body) {
        String placa = Objects.toString(body.get("placa"), "").trim().toUpperCase();
        String boxIdStr = body.get("boxId");
        Long preferido = (boxIdStr == null || boxIdStr.isBlank()) ? null : Long.valueOf(boxIdStr);

        var res = service.alocarPlaca(placa, preferido);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("ok", true);
        out.put("message", "Vaga cadastrada");
        out.put("placa", res.placa());
        out.put("boxId", res.boxId());
        return ResponseEntity.status(201).body(out);
    }

    /**
     * Libera um box (remove vínculo e marca STATUS='L').
     * resposta: { ok, boxId }
     */
    @Operation(summary = "Liberar box (remove vínculo e marca STATUS='L')")
    @PostMapping("/liberar/{boxId}")
    public ResponseEntity<Map<String, Object>> liberar(@PathVariable Long boxId) {
        service.liberarBox(boxId);
        return ResponseEntity.ok(Map.of("ok", true, "boxId", boxId));
    }

    /**
     * Busca a placa e diz em qual box está.
     * resposta, quando encontrado:
     * { found: true, placa, boxId, boxNome, status }
     * caso contrário:
     * { found: false, placa }
     */
    @Operation(summary = "Buscar placa e retornar box atual")
    @GetMapping("/buscar-placa/{placa}")
    public ResponseEntity<Map<String, Object>> buscarPlaca(@PathVariable String placa) {
        return service.buscarBoxPorPlaca(placa)
                .<ResponseEntity<Map<String, Object>>>map(b -> ResponseEntity.ok(Map.of(
                        "found", true,
                        "placa", placa.toUpperCase(),
                        "boxId", b.idBox(),
                        "boxNome", b.nomeBox(),
                        "status", b.status()
                )))
                .orElse(ResponseEntity.ok(Map.of("found", false, "placa", placa.toUpperCase())));
    }

    @PostMapping("/corrigir-boxes-inconsistentes")
    @Operation(summary = "Corrigir boxes inconsistentes", description = "Libera boxes que estão ocupados mas sem veículo associado")
    public ResponseEntity<Map<String, Object>> corrigirBoxesInconsistentes() {
        try {
            int boxesCorrigidos = service.corrigirBoxesInconsistentes();
            Map<String, Object> response = new HashMap<>();
            response.put("boxesCorrigidos", boxesCorrigidos);
            response.put("mensagem", "Boxes inconsistentes corrigidos com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Falha ao corrigir boxes: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/teste")
    @Operation(summary = "Teste simples", description = "Teste básico para verificar se o serviço está funcionando")
    public ResponseEntity<Map<String, Object>> teste() {
        try {
            log.info("🧪 Teste: Iniciando teste simples");
            var boxes = service.listarBoxesComDetalhesVeiculo(3L);
            log.info("🧪 Teste: Encontrados {} boxes", boxes.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalBoxes", boxes.size());
            response.put("boxes", boxes);
            response.put("mensagem", "Teste executado com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Teste: Erro no teste", e);
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Falha no teste: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
