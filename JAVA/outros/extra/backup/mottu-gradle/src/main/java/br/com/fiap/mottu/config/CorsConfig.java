package br.com.fiap.mottu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final Environment environment;

    @Value("${cors.production.allowed.origins:https://seu-dominio-de-producao.com}")
    private String[] productionAllowedOrigins;

    public CorsConfig(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        boolean isProdProfileActive = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (isProdProfileActive) {
            // PRODUÇÃO
            if (productionAllowedOrigins != null && productionAllowedOrigins.length > 0 &&
                    productionAllowedOrigins[0] != null && !productionAllowedOrigins[0].isEmpty() &&
                    !productionAllowedOrigins[0].equalsIgnoreCase("https://seu-dominio-de-producao.com")) {
                registry.addMapping("/**")
                        .allowedOrigins(productionAllowedOrigins)
                        .allowedMethods("GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS", "HEAD")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            } else {
                registry.addMapping("/**")
                        .allowedOrigins("https://fallback-seguro-obrigatorio.com")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        } else {
            // DESENVOLVIMENTO
            String[] developmentAllowedOrigins = new String[] {
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://192.168.0.3:3000",
                    "http://10.199.82.137:3000", // <- seu IP na LAN/tethering
                    "https://app.local:3443"    // <- se usar Caddy HTTPS com hostname
            };

            registry.addMapping("/**")
                    .allowedOrigins(developmentAllowedOrigins)
                    .allowedMethods("GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS", "HEAD")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }
    }
}
