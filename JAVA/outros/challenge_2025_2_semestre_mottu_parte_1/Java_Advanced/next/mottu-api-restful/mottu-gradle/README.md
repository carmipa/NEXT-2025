
# Estrutura atual do projeto java!

---

📁 mottu-gradle/
├── 📁 .gradle/                   # ➔ Arquivos de cache e metadados do Gradle
├── 📁 .idea/                     # ➔ Configurações específicas do IntelliJ IDEA
├── 📁 build/                     # ➔ Arquivos gerados pela compilação (classes, .jar)
├── 📁 gradle/                    # ➔ Scripts do Gradle Wrapper
├── 📁 src/                       # ➔ Código-fonte do projeto
│   ├── 📁 main/
│   │   ├── 📁 java/
│   │   │   └── 📁 br/com/fiap/mottu/
│   │   │       ├── ☕ MottuApplication.java # Ponto de entrada da aplicação Spring Boot
│   │   │       ├── 📁 config/           # ➔ Classes de configuração (CORS, OpenAPI/Swagger)
│   │   │       ├── 📁 controller/       # ➔ Controladores REST (APIs que o frontend consome)
│   │   │       ├── 📁 dto/              # ➔ Data Transfer Objects (objetos que definem o formato dos dados da API)
│   │   │       ├── 📁 exception/        # ➔ Classes de exceções customizadas
│   │   │       ├── 📁 external/         # ➔ Integração com serviços externos (ex: ViaCEP)
│   │   │       ├── 📁 filter/           # ➔ Classes para filtros de busca (Records)
│   │   │       ├── 📁 mapper/           # ➔ Interfaces do MapStruct para conversão de Entidade <=> DTO
│   │   │       ├── 📁 model/            # ➔ Entidades JPA que representam as tabelas do banco de dados
│   │   │       ├── 📁 repository/       # ➔ Interfaces do Spring Data JPA para acesso ao banco de dados
│   │   │       ├── 📁 service/          # ➔ Classes que contêm a lógica de negócio da aplicação
│   │   │       └── 📁 specification/    # ➔ Classes para criar consultas dinâmicas com base nos filtros
│   │   └── 📁 resources/
│   │       ├── 🖼️ static/
│   │       ├── 🎨 templates/
│   │       └── 📜 application.properties  # Configurações da aplicação (banco de dados, servidor, etc.)
│   └── 📁 test/
│       └── 📁 java/
│           └── 📁 br/com/fiap/mottu/
│               └── ☕ MottuGradleApplicationTests.java # Testes da aplicação
├── 📜 .gitignore                # Arquivos e pastas ignorados pelo Git
├── 📜 build.gradle               # Arquivo principal de configuração do Gradle
├── 📜 gradlew                   # Script do Gradle Wrapper para Linux/macOS
├── 📜 gradlew.bat               # Script do Gradle Wrapper para Windows
├── 📖 HELP.md                   # Documentação gerada pelo Spring Initializr
└── 📜 settings.gradle           # Configurações do projeto Gradle