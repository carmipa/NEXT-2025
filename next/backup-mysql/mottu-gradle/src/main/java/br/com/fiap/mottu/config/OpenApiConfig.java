package br.com.fiap.mottu.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "MOTTU API",
        version = "v1",
        description = "API de gestão de pátios e relatórios",
        contact = @Contact(name = "Equipe MOTTU")
    ),
    servers = {
        @Server(url = "/", description = "Servidor Atual")
    }
)
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("🏍️ MOTTU API RESTful - Sistema Inteligente de Gestão de Pátios")
                        .version("2.0.0")
                        .description("API do sistema MOTTU")
                        .contact(new io.swagger.v3.oas.models.info.Contact()
                                .name("Metamind Solution")
                                .email("RM557568@fiap.com.br")
                                .url("https://wa.me/5511912345678")
                        )
                        .license(new io.swagger.v3.oas.models.info.License()
                                .name("Licença de Uso")
                                .url("https://github.com/carmipa/challenge_2025_1_semestre_mottu/tree/main/Java_Advanced")
                        )
                )
                .servers(List.of(
                        new io.swagger.v3.oas.models.servers.Server().url("/").description("Servidor relativo (porta dinâmica)")
                ));
    }

    @Bean
    public GroupedOpenApi apiGroup() {
        return GroupedOpenApi.builder()
                .group("mottu")
                .packagesToScan("br.com.fiap.mottu")
                .build();
    }
}
