package br.com.fiap.mottu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server; // Importação necessária para a classe Server
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List; // Importação necessária para List

/**
 * Classe de configuração do Springdoc OpenAPI para definir as informações detalhadas da API.
 * Isso inclui título, versão, descrição completa com Markdown, informações de contato da equipe
 * e detalhes de licença, que serão exibidos na interface do Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenApiConfig.class);

    @Bean
    public OpenAPI customOpenAPI() {
        log.info("🔧 Configuração personalizada do OpenAPI inicializada com dados completos.");

        return new OpenAPI()
                .info(new Info()
                        .title("Challenge-2025-FIAP-TEMMU-METAMIND SOLUTIONS") // Título completo do seu projeto
                        .version("1.0") // Versão do seu projeto
                        .description("""
                                **CHALLENGE FIAP 2025**

                                API RESTful para o Challenge Mottu - Gestão de Clientes, Veículos, Endereços, Contatos e mais.

                                **Endereço do Projeto GitHub:** [GitHub - Mottu](https://github.com/carmipa/challenge_2025_1_semestre_mottu)

                                **Turma:** 2TDSPV / 2TDSPZ

                                **Contatos da Equipe:**
                                - Arthur Bispo de Lima RM557568: [RM557568@fiap.com.br](mailto:RM557568@fiap.com.br) | [GitHub](https://github.com/ArthurBispo00)
                                - João Paulo Moreira RM557808: [RM557808@fiap.com.br](mailto:RM557808@fiap.com.br) | [GitHub](https://github.com/joao1015)
                                - Paulo André Carminati RM557881: [RM557881@fiap.com.br](mailto:RM557881@fiap.com.br) | [GitHub](https://github.com/carmipa)
                                """)
                        .contact(new Contact()
                                .name("Metamind Solution") // Nome da equipe
                                .email("RM557568@fiap.com.br") // E-mail de contato da equipe
                                .url("https://github.com/carmipa/challenge_2025_1_semestre_mottu") // URL do projeto ou da equipe
                        )
                        .license(new License()
                                .name("Licença de Uso") // Nome da licença
                                .url("https://github.com/carmipa/challenge_2025_1_semestre_mottu/tree/main/Java_Advanced") // URL da licença
                        )
                )
                // Adicione a seção de servidores se desejar, como você tinha no seu código anterior
                .servers(List.of(new Server().url("http://localhost:8080").description("Servidor Local")));
    }
}