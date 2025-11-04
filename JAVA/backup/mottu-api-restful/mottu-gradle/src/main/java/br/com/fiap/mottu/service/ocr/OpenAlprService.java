package br.com.fiap.mottu.service.ocr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
@Primary
public class OpenAlprService implements PlateRecognizer {

    private static final Logger log = LoggerFactory.getLogger(OpenAlprService.class);
    private final ObjectMapper om = new ObjectMapper();
    private final OcrSessionManager sessionManager;

    public OpenAlprService(OcrSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @Value("${mottu.ocr.alpr.command:alpr}")
    private String alprCommand;

    @Value("${mottu.ocr.alpr.region:br}")
    private String region;

    @Value("${mottu.ocr.alpr.topn:10}")
    private int topN;

    @Value("${mottu.ocr.alpr.minConfidence:80}")
    private double minConfidence;

    @Value("${mottu.ocr.alpr.timeoutMs:15000}")
    private long timeoutMs;

    @Value("${mottu.ocr.alpr.debugOutputDir:logs}")
    private String debugOutputDir;

    @Override
    public void extractPlate(String sessionId, byte[] imageBytes) {
        sessionManager.setSessionProcessing(sessionId);
        CompletableFuture.runAsync(() -> runWithFallback(sessionId, imageBytes));
    }

    private void runWithFallback(String sessionId, byte[] imageBytes) {
        File tmp = null;
        try {
            tmp = Files.createTempFile("mottu-plate-", ".jpg").toFile();
            try (FileOutputStream fos = new FileOutputStream(tmp)) {
                fos.write(imageBytes);
            }
            log.info("[OCR:{}] Temp image: {}", sessionId, tmp.getAbsolutePath());

            // 1) tenta com a região configurada
            Result r = runOnce(sessionId, tmp, region);
            if (r.ok() && r.normalizedPlate() != null) {
                sessionManager.updateSessionSuccess(sessionId, r.normalizedPlate());
                return;
            }

            // 2) se foi erro típico de perfil ausente (ex.: br.xml), tenta 'eu'
            if (needsEuFallback(r.stderrOrMixed())) {
                log.warn("[OCR:{}] Região '{}' falhou. Tentando fallback 'eu'…", sessionId, region);
                Result r2 = runOnce(sessionId, tmp, "eu");
                if (r2.ok() && r2.normalizedPlate() != null) {
                    sessionManager.updateSessionSuccess(sessionId, r2.normalizedPlate());
                    return;
                }
                sessionManager.updateSessionError(sessionId, r2.messageForUser());
                return;
            }

            // 3) sem fallback aplicável
            sessionManager.updateSessionError(sessionId, r.messageForUser());

        } catch (Throwable t) {
            log.error("[OCR:{}] Erro no OpenALPR", sessionId, t);
            sessionManager.updateSessionError(sessionId, "Erro interno no reconhecimento.");
        } finally {
            if (tmp != null) try { Files.deleteIfExists(tmp.toPath()); } catch (IOException ignored) {}
        }
    }

    private Result runOnce(String sessionId, File imageFile, String cfgRegion) {
        try {
            List<String> cmd = new ArrayList<>();
            cmd.add(alprCommand);
            cmd.add("-j");
            cmd.add("-c"); cmd.add(cfgRegion);
            cmd.add("-n"); cmd.add(String.valueOf(topN));
            cmd.add(imageFile.getAbsolutePath());

            log.info("[OCR:{}] Executando ({}): {}", sessionId, cfgRegion, String.join(" ", cmd));

            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process p = pb.start();

            boolean finished = p.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
            if (!finished) {
                p.destroyForcibly();
                return Result.error("Timeout executando o OpenALPR (" + cfgRegion + ").", null);
            }

            String mixedOut = readAll(p.getInputStream());
            int exit = p.exitValue();

            // dump debug
            dumpJsonDebug(mixedOut, cfgRegion);

            if (exit != 0) {
                return Result.error("OpenALPR retornou código " + exit + " (" + cfgRegion + ").", mixedOut);
            }

            // corta somente o JSON (ignora ruídos antes/depois)
            String json = extractJson(mixedOut);
            if (json == null) {
                return Result.error("Saída inválida do OpenALPR (" + cfgRegion + ").", mixedOut);
            }

            Optional<String> best = pickBest(json);
            if (best.isEmpty()) {
                return Result.error("Nenhuma placa encontrada (" + cfgRegion + ").", json);
            }

            String normalized = PlateUtils.normalizeMercosul(best.get());
            if (normalized == null || normalized.isBlank()) {
                return Result.error("Falha ao normalizar a placa.", json);
            }

            return Result.success(normalized, mixedOut);

        } catch (IOException | InterruptedException e) {
            return Result.error("Falha ao executar o OpenALPR (" + cfgRegion + ").", e.toString());
        }
    }

    /** detecta mensagens clássicas de perfil ausente/ruído do opencv */
    private boolean needsEuFallback(String mixed) {
        if (mixed == null) return false;
        String s = mixed.toLowerCase();
        return s.contains("cpu classifier") || s.contains("error loading")
                || s.contains("missing config for the country") || s.contains("br.xml");
    }

    /** extrai apenas o JSON (do primeiro '{' ao último '}') */
    private String extractJson(String mixed) {
        if (mixed == null) return null;
        int start = mixed.indexOf('{');
        int end = mixed.lastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) return null;
        return mixed.substring(start, end + 1);
    }

    private Optional<String> pickBest(String json) {
        try {
            JsonNode root = om.readTree(json);
            JsonNode results = root.get("results");
            if (results == null || !results.isArray() || results.isEmpty()) return Optional.empty();

            double bestScore = -1.0;
            String bestPlate = null;

            for (JsonNode r : results) {
                if (r.hasNonNull("plate") && r.hasNonNull("confidence")) {
                    String p = r.get("plate").asText("");
                    double c = r.get("confidence").asDouble(0.0);
                    if (c >= minConfidence && c > bestScore) { bestScore = c; bestPlate = p; }
                }
                JsonNode cs = r.get("candidates");
                if (cs != null && cs.isArray()) {
                    for (JsonNode cand : cs) {
                        String p = cand.hasNonNull("plate") ? cand.get("plate").asText("") : "";
                        double c = cand.hasNonNull("confidence") ? cand.get("confidence").asDouble(0.0) : 0.0;
                        boolean matches = cand.hasNonNull("matches_template") && cand.get("matches_template").asInt(0) == 1;
                        double score = c + (matches ? 2.0 : 0.0);
                        if (c >= minConfidence && score > bestScore) { bestScore = score; bestPlate = p; }
                    }
                }
            }
            return Optional.ofNullable(bestPlate);
        } catch (IOException e) {
            log.warn("Falha ao parsear JSON do OpenALPR", e);
            return Optional.empty();
        }
    }

    private void dumpJsonDebug(String mixedOut, String cfgRegion) {
        try {
            Path dir = Path.of(debugOutputDir);
            Files.createDirectories(dir);
            Files.writeString(dir.resolve("ultima-saida-alpr-cfg-" + cfgRegion + ".json"), mixedOut);
            String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            Files.writeString(dir.resolve("saida-" + cfgRegion + "-" + ts + ".json"), mixedOut);
        } catch (IOException e) {
            log.debug("Não foi possível salvar JSON de debug: {}", e.toString());
        }
    }

    private static String readAll(InputStream in) throws IOException {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(in))) {
            StringBuilder sb = new StringBuilder();
            String s;
            while ((s = br.readLine()) != null) sb.append(s).append('\n');
            return sb.toString();
        }
    }

    // ---------------- Result helper ----------------
    /** record privado; accessors públicos gerados automaticamente (ok(), normalizedPlate(), stderrOrMixed(), userMsg()) */
    private record Result(boolean ok, String normalizedPlate, String stderrOrMixed, String userMsg) {
        static Result success(String plate, String mixed) { return new Result(true, plate, mixed, null); }
        static Result error(String msg, String mixed)    { return new Result(false, null, mixed, msg); }
        String messageForUser() { return userMsg != null ? userMsg : "Falha no reconhecimento."; }
    }
}
