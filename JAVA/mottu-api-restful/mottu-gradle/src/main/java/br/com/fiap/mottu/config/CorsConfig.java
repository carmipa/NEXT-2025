package br.com.fiap.mottu.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);
    private final Environment env;

    /**
     * Em 'application-prod.properties' ou 'application-prod.yml', defina as origens permitidas.
     * Exemplo em .properties:
     * cors.allowed-origins=https://app.mottu.com,https://admin.mottu.com
     *
     * Exemplo em .yml:
     * cors:
     * allowed-origins:
     * - https://app.mottu.com
     * - https://admin.mottu.com
     */
    @Value("${cors.allowed-origins:}")
    private String[] allowedOrigins;

    public CorsConfig(Environment env) {
        this.env = env;
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        log.info("CORS: Configurando mapeamentos CORS...");
        log.info("CORS: Perfis ativos: {}", Arrays.toString(env.getActiveProfiles()));
        
        // Aplica configurações específicas por ambiente (profile)
        String[] activeProfiles = env.getActiveProfiles();
        if (Arrays.asList(activeProfiles).contains("prod")) {
            configureProductionCors(registry);
        } else if (Arrays.asList(activeProfiles).contains("vps")) {
            // Perfil VPS: usa configuração flexível similar ao dev, mas com suporte a IPs externos
            configureVpsCors(registry);
        } else {
            configureDevelopmentCors(registry);
        }
    }

    private void configureProductionCors(CorsRegistry registry) {
        log.info("CORS: Ativando perfil de PRODUÇÃO.");
        if (allowedOrigins == null || allowedOrigins.length == 0) {
            log.error("CORS (PROD): Nenhuma origem permitida foi configurada em 'cors.allowed-origins'. " +
                      "Requisições de origem cruzada serão bloqueadas por segurança.");
            // Falha segura: não permite nenhuma origem se a propriedade não estiver definida
            registry.addMapping("/**")
                    .allowedOrigins("https://bloqueio-por-seguranca.com") // Domínio inexistente para bloquear tudo
                    .allowCredentials(true);
            return;
        }
        
        String[] safeOrigins = allowedOrigins != null ? allowedOrigins : new String[0];
        registry.addMapping("/**")
                .allowedOrigins(safeOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("Location", "Content-Disposition", "X-Total-Count", "ETag")
                .allowCredentials(true)
                .maxAge(7200); // Em produção, credenciais são quase sempre necessárias

        log.info("CORS (PROD): {} origem(ns) liberada(s): {}", safeOrigins.length, Arrays.toString(safeOrigins));
    }

    private void configureDevelopmentCors(CorsRegistry registry) {
        log.info("CORS: Ativando perfil de DESENVOLVIMENTO/PADRÃO.");
        registry.addMapping("/**")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("Location", "Content-Disposition", "X-Total-Count", "ETag")
                .allowedHeaders("Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With")
                .allowedOriginPatterns(
                    // Padrões para localhost, cobrindo qualquer porta
                    "http://localhost:*",
                    "https://localhost:*",
                    "http://127.0.0.1:*",
                    "https://127.0.0.1:*",
                    // Padrões para IPs de rede local (Wi-Fi, Ethernet, Tethering)
                    "http://192.168.*.*:*",
                    "https://192.168.*.*:*",
                    "http://10.*.*.*:*",
                    "https://10.*.*.*:*",
                    // Padrão para domínios de desenvolvimento local com TLS (ex: via Caddy, mkcert)
                    "https://*.local:*",
                    // Padrões para IPs externos (VPS)
                    "http://91.108.120.60:*",
                    "https://91.108.120.60:*",
                    "http://72.61.219.15:*",
                    "https://72.61.219.15:*"
                )
                .allowCredentials(true)
                .maxAge(7200); // Cache de preflight por 2 horas

        log.info("CORS (DEV): Padrões de origem flexíveis para localhost e rede local foram aplicados.");
    }

    private void configureVpsCors(CorsRegistry registry) {
        log.info("CORS: Ativando perfil de VPS.");
        
        // Verifica se há origens configuradas via propriedade (prioridade)
        if (allowedOrigins != null && allowedOrigins.length > 0) {
            log.info("CORS (VPS): Usando origens configuradas via propriedade.");
            String[] safeOrigins = allowedOrigins;
            registry.addMapping("/**")
                    .allowedOrigins(safeOrigins)
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                    .allowedHeaders("*")
                    .exposedHeaders("Location", "Content-Disposition", "X-Total-Count", "ETag")
                    .allowCredentials(true)
                    .maxAge(7200);
            log.info("CORS (VPS): {} origem(ns) liberada(s): {}", safeOrigins.length, Arrays.toString(safeOrigins));
        } else {
            // Configuração flexível para VPS com padrões de IPs externos
            log.info("CORS (VPS): Usando padrões flexíveis para VPS.");
            registry.addMapping("/**")
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                    .allowedHeaders("*")
                    .exposedHeaders("Location", "Content-Disposition", "X-Total-Count", "ETag")
                    .allowedOriginPatterns(
                        // Padrões para localhost, cobrindo qualquer porta
                        "http://localhost:*",
                        "https://localhost:*",
                        "http://127.0.0.1:*",
                        "https://127.0.0.1:*",
                        // Padrões para IPs de rede local (Wi-Fi, Ethernet, Tethering)
                        "http://192.168.*.*:*",
                        "https://192.168.*.*:*",
                        "http://10.*.*.*:*",
                        "https://10.*.*.*:*",
                        // Padrão para domínios de desenvolvimento local com TLS
                        "https://*.local:*",
                        // Padrões para IPs externos (VPS) - adicionar mais se necessário
                        "http://91.108.120.60:*",
                        "https://91.108.120.60:*",
                        "http://72.61.219.15:*",
                        "https://72.61.219.15:*"
                    )
                    .allowCredentials(true)
                    .maxAge(7200); // Cache de preflight por 2 horas
            
            log.info("CORS (VPS): Padrões flexíveis aplicados para localhost, rede local e IPs externos.");
        }
    }
}
