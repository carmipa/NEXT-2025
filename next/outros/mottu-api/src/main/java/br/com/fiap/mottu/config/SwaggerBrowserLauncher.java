package br.com.fiap.mottu.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@Component
public class SwaggerBrowserLauncher {

    private static final Logger log = LoggerFactory.getLogger(SwaggerBrowserLauncher.class);

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${springdoc.swagger-ui.path:/swagger-ui/index.html}")
    private String swaggerUiPath;

    @Value("${app.launch-swagger-on-startup:true}")
    private boolean launchSwaggerOnStartup;

    @EventListener(ApplicationReadyEvent.class)
    public void launchBrowserOnStartup() {
        if (!launchSwaggerOnStartup) {
            log.info("Abertura automática do Swagger no navegador está desabilitada.");
            return;
        }

        String url = "http://localhost:" + serverPort + contextPath + swaggerUiPath;
        log.info("Tentando abrir o Swagger UI em: {}", url);

        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            try {
                Desktop.getDesktop().browse(new URI(url));
                log.info("Navegador aberto com sucesso na URL do Swagger UI.");
            } catch (IOException | URISyntaxException e) {
                log.error("Erro ao tentar abrir o navegador para o Swagger UI: {}", e.getMessage());
            }
        } else {
            log.warn("Abertura automática do navegador não é suportada neste ambiente. Acesse manualmente: {}", url);
        }
    }
}
