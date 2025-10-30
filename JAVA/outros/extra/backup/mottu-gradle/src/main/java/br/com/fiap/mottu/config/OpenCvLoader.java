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
            log.info("OpenCV nativo carregado com sucesso.");
        } catch (Throwable t) {
            log.warn("OpenCV não pôde ser carregado. A detecção de placa será ignorada. ({})", t.toString());
        }
    }
}
