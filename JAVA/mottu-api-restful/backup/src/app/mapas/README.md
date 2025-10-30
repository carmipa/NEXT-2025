# 🗺️ Sistema de Mapas Mottu

## Visão Geral

O Sistema de Mapas Mottu é uma evolução do sistema anterior que oferece duas visualizações distintas para gerenciar vagas e pátios:

1. **Mapa de Pátio** (`/mapas/patio`) - Mapas 2D tradicionais por pátio
2. **Mapa de Vagas** (`/mapas/mapa-box`) - Sistema dinâmico de pátios

## 🎯 Mapa de Vagas Dinâmico

### Características Principais

- **Sistema Escalável**: Não requer programação para novos pátios
- **Visualização de Pátio**: Interface intuitiva para seleção de vagas
- **Dados em Tempo Real**: Integração direta com a API backend
- **Filtros Avançados**: Busca por pátio, status, placa e nome do box
- **Múltiplas Vistas**: Pátio (assentos), Mapa (geográfica), Grade (quadros) e Abas (cards/tabela/gráficos)

### Funcionalidades

#### Vista Pátio
- Grid de vagas organizadas por pátio
- Cores indicativas de status:
  - 🟢 Verde: Livre
  - 🔴 Vermelho: Ocupado
  - 🟡 Amarelo: Manutenção
- Clique para ver detalhes completos
- Filtros por status em tempo real

#### Vista Mapa
- Mapa Leaflet com localização dos pátios
- Marcadores com estatísticas de cada pátio
- Foco automático em pátios específicos
- Coordenadas geográficas dos endereços

### API Endpoints

#### `/api/vagas/status/all`
Retorna todas as vagas com informações completas:

```typescript
interface VagaCompleta {
    idBox: number;
    nome: string;
    status: 'L' | 'O' | 'M';
    patio: {
        idPatio: number;
        nomePatio: string;
        endereco?: {
            logradouro: string;
            cidade: string;
            estado: string;
            latitude?: number;
            longitude?: number;
        };
    };
    veiculo?: {
        placa: string;
        modelo: string;
        cliente: {
            nome: string;
            telefone: string;
        };
    };
}
```

### Parâmetros de Filtro

- `patioId`: Filtrar por pátio específico
- `status`: Filtrar por status (L/O/M)
- `placa`: Buscar por placa do veículo
- `nomeBox`: Buscar por nome do box

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/app/mapas/
├── layout.tsx                 # Layout principal com navegação
├── patio/
│   └── page.tsx              # Mapas 2D tradicionais
├── mapa-box/
│   ├── page.tsx              # Página principal do mapa dinâmico
│   ├── types/
│   │   └── VagaCompleta.ts   # Tipos TypeScript
│   └── components/
│       ├── MapaVagasDinamico.tsx
│       ├── VistaCinema.tsx
│       ├── VistaMapa.tsx
│       ├── FiltrosVagas.tsx
│       └── EstatisticasVagas.tsx
└── README.md                  # Esta documentação
```

### Componentes Principais

#### MapaVagasDinamico
- Container principal que gerencia o estado
- Alterna entre vista cinema e mapa
- Modal de detalhes da vaga selecionada

#### VistaCinema
- Renderização estilo cinema
- Grid responsivo de vagas
- Agrupamento por pátio
- Filtros de status

#### VistaMapa
- Integração com LeafletMap
- Marcadores geográficos
- Estatísticas por pátio
- Controles de foco

#### FiltrosVagas
- Interface de filtros
- Busca em tempo real
- Indicadores de filtros ativos

#### EstatisticasVagas
- Cards com estatísticas gerais
- Contadores em tempo real
- Indicadores visuais

## 🎨 Design System

### Cores de Status

```typescript
const STATUS_COLORS = {
    'L': { bg: 'bg-green-500', icon: '🟢' },    // Livre
    'O': { bg: 'bg-red-500', icon: '🔴' },     // Ocupado
    'M': { bg: 'bg-yellow-500', icon: '🟡' }   // Manutenção
};
```

### Componentes Visuais

- **Neumorphic Design**: Bordas suaves e sombras
- **Gradientes**: Fundos com partículas animadas
- **Responsividade**: Adaptação para mobile e desktop
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 🚀 Benefícios da Nova Arquitetura

### Escalabilidade
- ✅ Novos pátios = apenas dados, sem código
- ✅ Manutenção simplificada
- ✅ Performance otimizada

### Flexibilidade
- ✅ Adaptação automática ao número de vagas
- ✅ Layout responsivo
- ✅ Integração com APIs externas

### UX Melhorada
- ✅ Interface unificada
- ✅ Navegação intuitiva
- ✅ Visualização clara do status

## 🔧 Configuração

### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Dependências

- Next.js 14+
- React 18+
- Leaflet para mapas
- Lucide React para ícones
- Tailwind CSS para estilos

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:

- **Mobile**: 1-2 colunas de vagas
- **Tablet**: 3-4 colunas de vagas  
- **Desktop**: 6-8 colunas de vagas
- **Large**: 8+ colunas de vagas

## 🔄 Migração

O sistema antigo (`/mapa-2d`) foi mantido para compatibilidade e redireciona automaticamente para `/mapas/patio`.

### URLs de Acesso

- **Mapas Antigos**: `/mapas/patio` (Guarulhos, Limão)
- **Mapa Dinâmico**: `/mapas/mapa-box` (Nova funcionalidade)
- **Redirecionamento**: `/mapa-2d` → `/mapas/patio`

## 🎯 Próximos Passos

1. **Integração com Sistema de Rastreamento**
2. **Notificações em Tempo Real**
3. **Relatórios Avançados**
4. **API de Reservas**
5. **Integração com Apps Mobile**

---

**Desenvolvido com ❤️ pela equipe Mottu**
