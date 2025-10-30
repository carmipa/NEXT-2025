package br.com.fiap.mottu.config;

import jakarta.annotation.PostConstruct;
import nu.pattern.OpenCV;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class OpenCvLoader {

    private static final Logger log = LoggerFactory.getLogger(OpenCvLoader.class);

    @PostConstruct
    public void init() {
        try {
            OpenCV.loadLocally(); // carrega nativos do pacote org.openpnp:opencv
            log.info("✅ OpenCV carregado com sucesso - suporte para pré-processamento de imagens.");
            log.info("✅ Sistema configurado: OpenALPR (principal) + OpenCV (suporte) + Tesseract (fallback).");
        } catch (Throwable t) {
            log.warn("⚠️ OpenCV não pôde ser carregado. Sistema continuará com OpenALPR + Tesseract. ({})", t.toString());
            log.info("ℹ️ OpenALPR será usado como principal para reconhecimento de placas Mercosul.");
        }
    }
}
