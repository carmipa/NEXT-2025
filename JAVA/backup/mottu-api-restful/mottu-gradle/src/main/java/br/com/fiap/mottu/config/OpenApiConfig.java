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
                        .title("🏍️ MOTTU API RESTful - Sistema Inteligente de Gestão de Pátios")
                        .version("2.0.0")
                        .description("""
                                **CHALLENGE - MOTTU - FINALISTA - NEXT/2025 - FIAP/2025**
                                
                                API RESTful completa para o sistema MOTTU, oferecendo funcionalidades avançadas de:
                                
                                ## 📋 Funcionalidades Principais
                                
                                ### 🏢 **Gestão de Pátios**
                                - CRUD completo de pátios
                                - Gestão de zonas e boxes
                                - Controle de ocupação em tempo real
                                - Relatórios de performance
                                
                                ### 🏍️ **Gestão de Veículos**
                                - Cadastro e rastreamento de motocicletas
                                - Sistema de tags BLE para localização
                                - Histórico de movimentações
                                - Integração com OCR para reconhecimento de placas
                                
                                ### 📊 **Relatórios e Analytics**
                                - Ocupação atual por pátio
                                - Movimentação diária de veículos
                                - Performance de pátios
                                - Horários de pico
                                - Exportação de dados
                                
                                ### 🎯 **Tecnologias Utilizadas**
                                - **Backend:** Spring Boot 3.x, Java 17
                                - **Banco:** Oracle Database 21c
                                - **Frontend:** Next.js 14, React 18, TypeScript
                                - **Documentação:** Swagger/OpenAPI 3
                                - **IA:** Gemini AI para análise de dados
                                - **Visão:** OpenCV para OCR
                                
                                ## 🔗 Links Importantes
                                
                                - **GitHub Principal:** [challenge_2025_2_semestre_mottu_parte_1](https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1)
                                - **Repositório Java:** [Java_Advanced](https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1/tree/main/Java_Advanced)
                                - **Documentação Frontend:** [Next.js App](http://localhost:3000)
                                
                                ## 👥 Equipe de Desenvolvimento
                                
                                | Nome | RM | Email | Turma | GitHub |
                                |------|----|----|--------|---------|
                                | **Arthur Bispo de Lima** | RM557568 | RM557568@fiap.com.br | 2TDSPV | [ArthurBispo00](https://github.com/ArthurBispo00) |
                                | **João Paulo Moreira** | RM557808 | RM557808@fiap.com.br | 2TDSPV | [joao1015](https://github.com/joao1015) |
                                | **Paulo André Carminati** | RM557881 | RM557881@fiap.com.br | 2TDSPZ | [carmipa](https://github.com/carmipa) |
                                
                                ## 📞 Suporte
                                
                                - **WhatsApp:** [Contato Equipe](https://wa.me/5511912345678)
                                - **Email:** RM557568@fiap.com.br
                                
                                ---
                                *Desenvolvido com ❤️ pela equipe METAMIND SOLUTIONS*
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
                // Servidores configurados para funcionar com portas dinâmicas
                .servers(List.of(
                        new Server().url("/").description("Servidor relativo (porta dinâmica)"),
                        new Server().url("http://localhost:8080").description("Servidor local porta 8080"),
                        new Server().url("http://localhost:8081").description("Servidor local porta 8081"),
                        new Server().url("http://localhost:8082").description("Servidor local porta 8082")
                ));
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
