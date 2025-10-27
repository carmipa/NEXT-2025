package br.com.fiap.mottu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.models.GroupedOpenApi; // opcional
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenApiConfig.class);

    @Bean
    public OpenAPI customOpenAPI() {
        log.info("🔧 Configuração personalizada do OpenAPI inicializada com dados completos.");

        return new OpenAPI()
                .info(new Info()
                        .title("Challenge-2025-FIAP-TEMMU-METAMIND SOLUTIONS")
                        .version("1.0")
                        .description("""
                                **CHALLENGE - SPRINT 3 - FIAP 2025**

                                API RESTful para o Challenge Mottu - Rastreamento e organização dos veículos!.

                                **Endereço do Projeto GitHub:** [GitHub - Mottu](https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1)
                                
                                **Endereço do repositório da matéria no GitHub:** [GitHub - Mottu](https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1/tree/main/Java_Advanced)
                                
                                **Matéria:** Java Advanced

                                **Turma:** 2TDSPV / 2TDSPZ

                                **Contatos da Equipe:**
                                
                                - Arthur Bispo de Lima - RM557568: RM557568@fiap.com.br - 2TDSPV - [GitHub - ArthurBispo00](https://github.com/ArthurBispo00)
                                
                                - João Paulo Moreira - RM557808: RM557808@fiap.com.br - 2TDSPV - [GitHub - joao1015](https://github.com/joao1015)
                                
                                - Paulo André Carminati - RM557881: RM557881@fiap.com.br - 2TDSPZ - [GitHub - carmipa](https://github.com/carmipa)
                                
                                """)
                        .contact(new Contact()
                                .name("Metamind Solution")
                                .email("RM557568@fiap.com.br")
                                .url("https://wa.me/5511912345678")

                )
                        .license(new License()
                                .name("Licença de Uso")
                                .url("https://github.com/carmipa/challenge_2025_1_semestre_mottu/tree/main/Java_Advanced")
                        )
                )
                // Use server relativo para não “grudar” localhost:8080 no contrato
                .servers(List.of(new Server().url("/").description("Servidor relativo")));
    }

    // OPCIONAL: só se quiser documentar/grupar um pacote específico
    @Bean
    public GroupedOpenApi apiGroup() {
        return GroupedOpenApi.builder()
                .group("mottu")
                .packagesToScan("br.com.fiap.mottu") // ajuste se necessário
                .build();
    }
}
