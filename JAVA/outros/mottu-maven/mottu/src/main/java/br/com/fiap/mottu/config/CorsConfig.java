package br.com.fiap.mottu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment; // Importe para verificar os perfis ativos
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
            // --- CONFIGURAÇÃO PARA PRODUÇÃO ---
            System.out.println(">>>>>>>>>> CARREGANDO CONFIGURAÇÃO DE CORS PARA PRODUÇÃO <<<<<<<<<<");
            if (productionAllowedOrigins != null && productionAllowedOrigins.length > 0 &&
                    productionAllowedOrigins[0] != null && !productionAllowedOrigins[0].isEmpty() &&
                    !productionAllowedOrigins[0].equalsIgnoreCase("https://seu-dominio-de-producao.com")) { // Checa se é diferente do valor padrão não configurado
                System.out.println("Allowed Origins (prod): " + String.join(", ", productionAllowedOrigins));
                registry.addMapping("/**")
                        .allowedOrigins(productionAllowedOrigins)
                        .allowedMethods("GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS", "HEAD")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            } else {
                System.out.println("WARN: Nenhuma origem de produção VÁLIDA configurada para CORS (cors.production.allowed.origins). CORS estará altamente restrito ou desabilitado para produção.");
                // Por segurança, não permita origens amplas em produção se não estiver configurado corretamente.
                // Você pode optar por não adicionar nenhum mapping ou um muito restrito.
                registry.addMapping("/**")
                        .allowedOrigins("https://fallback-seguro-obrigatorio.com") // Deve ser um valor que nunca será usado ou uma URL real
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        } else {
            // --- CONFIGURAÇÃO PARA DESENVOLVIMENTO OU PADRÃO (NÃO-PRODUÇÃO) ---
            // Permite localhost em portas específicas e um padrão mais amplo.
            String[] developmentAllowedOrigins = {
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001"
                    // Adicione outras portas de desenvolvimento se necessário
            };
            // Para maior flexibilidade em desenvolvimento, se os padrões abaixo funcionarem corretamente com sua versão do Spring:
            // String[] developmentOriginPatterns = { "http://localhost:[*]", "http://127.0.0.1:[*]" };

            System.out.println(">>>>>>>>>> CARREGANDO CONFIGURAÇÃO DE CORS PARA DESENVOLVIMENTO/PADRÃO <<<<<<<<<<");
            // Vamos tentar com allowedOrigins primeiro, pois é mais explícito e menos propenso a problemas com a sintaxe do padrão
            System.out.println("Allowed Origins (dev/default): " + String.join(", ", developmentAllowedOrigins));
            registry.addMapping("/**")
                    .allowedOrigins(developmentAllowedOrigins) // MUDADO DE allowedOriginPatterns PARA allowedOrigins com lista explícita
                    .allowedMethods("GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS", "HEAD")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }
    }
}