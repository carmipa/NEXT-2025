# Estrutura de pastas do projeto next atual!

---

📁 mottu-web/
├── 📄 .env.local               # Variáveis de ambiente locais (não vai para o Git)
├── 📜 .eslintrc.json           # Configurações do ESLint para qualidade de código
├── 📜 .gitignore               # Arquivos e pastas ignorados pelo Git
├── 📜 next.config.mjs          # Configurações do Next.js
├── 📦 package-lock.json        # Lockfile das versões das dependências
├── 📦 package.json             # Define as dependências e scripts do projeto
├── 📜 postcss.config.mjs         # Configurações do PostCSS (usado pelo Tailwind)
├── 📖 README.md                # Documentação do projeto
├── 📜 tailwind.config.ts       # Configurações do Tailwind CSS
└── 📜 tsconfig.json             # Configurações do TypeScript

├── 📁 public/                   # ➔ Arquivos estáticos acessíveis publicamente
│   ├── 🖼️ fotos-equipe/
│   │   ├── 🖼️ arthur.jpg
│   │   ├── 🖼️ joao.jpg
│   │   └── 🖼️ paulo.jpg
│   ├── 🌐 favicon.ico
│   ├── 🖼️ mottu-logo-dark-bg.png
│   ├── 🖼️ mottu-logo-light-bg.png
│   ├── 📜 next.svg
│   └── 📜 vercel.svg

└── 📁 src/                      # ➔ Código-fonte da aplicação
    ├── 📁 app/                  # ➔ Core do App Router: páginas, rotas e layouts
    │   ├── 📁 (auth)/           # ➔ Grupo de rotas para autenticação
    │   │   └── 📁 login/
    │   │       └── ⚛️ page.tsx
    │   ├── 📁 api/
    │   │   └── 📁 auth/
    │   │       └── 📁 [...nextauth]/
    │   │           └── 📜 route.ts
    │   ├── 📁 clientes/
    │   │   ├── 📁 alterar/
    │   │   │   └── 📁 [id]/
    │   │   │       └── ⚛️ page.tsx
    │   │   ├── 📁 buscar/
    │   │   │   └── ⚛️ page.tsx
    │   │   ├── 📁 cadastrar/
    │   │   │   └── ⚛️ page.tsx
    │   │   ├── 📁 listar/
    │   │   │   └── ⚛️ page.tsx
    │   │   └── ⚛️ layout.tsx
    │   ├── 📁 contato/
    │   │   └── ⚛️ page.tsx
    │   ├── 📁 mapa-do-site/
    │   │   └── ⚛️ page.tsx
    │   ├── 📁 relatorios/
    │   │   ├── 📁 clientes-por-mes/
    │   │   │   └── ⚛️ page.tsx
    │   │   └── ⚛️ page.tsx
    │   ├── 🎨 globals.css       # Estilos globais da aplicação
    │   └── ⚛️ layout.tsx        # Layout principal (root) da aplicação
    │   └── ⚛️ page.tsx          # Página inicial (Home)
    │
    ├── 📁 components/            # ➔ Componentes React reutilizáveis
    │   ├── ⚛️ GraficoDeBarras.tsx
    │   ├── ⚛️ LeafletMap.tsx
    │   └── ⚛️ nav-bar.tsx
    │
    ├── 📁 types/                 # ➔ Definições de tipos TypeScript
    │   ├── 📜 cliente.d.ts
    │   └── 📜 next-auth.d.ts
    │
    └── 📁 utils/                 # ➔ Utilitários e helpers
        └── 📜 api.ts             # Configuração do Axios e serviços de API