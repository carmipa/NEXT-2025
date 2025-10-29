package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.service.ocr.OcrSession;
import br.com.fiap.mottu.service.ocr.OcrSessionManager;
import br.com.fiap.mottu.service.ocr.PlateRecognizer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/radar")
@Tag(name = "Radar", description = "Operações de OCR com Celular")
public class RadarController {

    private static final Logger log = LoggerFactory.getLogger(RadarController.class);

    private final OcrSessionManager sessionManager;
    private final PlateRecognizer plateRecognizer;

    public RadarController(OcrSessionManager sessionManager, PlateRecognizer plateRecognizer) {
        this.sessionManager = sessionManager;
        this.plateRecognizer = plateRecognizer;
    }

    @Operation(summary = "Iniciar Sessão de OCR")
    @PostMapping("/iniciar-sessao")
    public ResponseEntity<Map<String, String>> iniciarSessao() {
        OcrSession session = sessionManager.createSession(); // id gerado e status PENDING  :contentReference[oaicite:12]{index=12}
        log.info("Nova sessão de OCR criada: {}", session.getId());
        return ResponseEntity.ok(Map.of("sessionId", session.getId()));
    }

    @Operation(summary = "Verificar Status da Sessão")
    @GetMapping("/status-sessao/{sessionId}")
    public ResponseEntity<OcrSession> getStatusSessao(@PathVariable String sessionId) {
        return sessionManager.getSession(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Upload de Imagem da Placa")
    @PostMapping(
            value = "/upload-imagem/{sessionId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> uploadImagem(
            @PathVariable String sessionId,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        log.info("Recebida requisição de upload para a sessão: {}", sessionId);

        Optional<OcrSession> optSession = sessionManager.getSession(sessionId);
        if (optSession.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Sessão inválida ou expirada."));
        }

        MultipartFile mainPart = (image != null && !image.isEmpty()) ? image : file;

        if (mainPart == null || mainPart.isEmpty()) {
            log.warn("Sessão {}: Multipart sem 'image' nem 'file', ou vazio.", sessionId);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Arquivo ausente. Envie o campo 'image' (ou 'file') em multipart/form-data."
            ));
        }

        try {
            byte[] imageBytes = mainPart.getBytes();
            log.info("Sessão {}: Imagem lida com {} bytes.", sessionId, imageBytes.length);

            // Dispara processamento assíncrono no motor configurado (OpenALPR @Primary por padrão).
            plateRecognizer.extractPlate(sessionId, imageBytes);

            return ResponseEntity.accepted().body(Map.of("status", "Processamento da imagem iniciado."));

        } catch (IOException e) {
            log.error("Sessão {}: Falha ao ler os bytes da imagem.", sessionId, e);
            sessionManager.updateSessionError(sessionId, "Erro ao ler o arquivo de imagem.");
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno ao ler o arquivo enviado."));

        } catch (Throwable ex) { // captura erros inesperados (ex.: JNI nativo, etc.)
            log.error("Erro inesperado no controller (sessão {}): {}", sessionId, ex.toString(), ex);
            sessionManager.updateSessionError(sessionId, "Erro interno ao processar a imagem.");
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno ao processar a imagem."));
        }
    }
}
