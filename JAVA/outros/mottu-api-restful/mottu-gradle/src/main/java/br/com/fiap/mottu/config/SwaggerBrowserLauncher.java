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

    // Pode vir "", "/", "/minhaapp" ou "/minhaapp/"
    @Value("${server.servlet.context-path:}")
    private String contextPath;

    // Deve ser um path, ex.: "/swagger-ui/index.html" ou "swagger-ui/index.html"
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

        String normalizedContext = normalizeContextPath(contextPath);   // "" ou "/algo" (sem barra no fim)
        String normalizedSwagger = normalizeUiPath(swaggerUiPath);      // sempre "/algo/.."

        // Base SEM path; resolve lida com as barras corretamente
        URI base = URI.create("http://localhost:" + serverPort + "/");

        // Junta com segurança (sem gerar //)
        String joinedPath = (normalizedContext + normalizedSwagger).replaceAll("/{2,}", "/");
        String url = base.resolve(joinedPath).toString();

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

    /** ""  -> ""
     *  "/" -> ""
     *  "/app/" -> "/app"
     *  "app" -> "/app"
     */
    private static String normalizeContextPath(String cp) {
        if (cp == null) return "";
        cp = cp.trim();
        if (cp.isEmpty() || "/".equals(cp)) return "";
        if (!cp.startsWith("/")) cp = "/" + cp;
        if (cp.endsWith("/")) cp = cp.substring(0, cp.length() - 1);
        return cp;
    }

    /** null|"" -> "/swagger-ui/index.html" (default)
     *  "swagger-ui/index.html" -> "/swagger-ui/index.html"
     *  "/swagger-ui/index.html" -> "/swagger-ui/index.html"
     *  Remove barras duplicadas internas.
     */
    private static String normalizeUiPath(String p) {
        if (p == null || p.isBlank()) p = "/swagger-ui/index.html";
        p = p.trim();
        if (!p.startsWith("/")) p = "/" + p;
        return p.replaceAll("/{2,}", "/");
    }
}
