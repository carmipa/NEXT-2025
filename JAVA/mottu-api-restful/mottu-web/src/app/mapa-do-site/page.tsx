"use client";

import Link from 'next/link';
import '@/types/styles/neumorphic.css';

// Estrutura de dados para descrever as seções do site - BASEADA NA ANÁLISE REAL DO SISTEMA
const sections = [
    {
        name: "🏠 Páginas Iniciais",
        icon: <i className="ion-ios-home text-4xl text-blue-400"></i>,
        description: "Páginas de entrada e navegação principal do sistema.",
        links: [
            { 
                name: "Página Inicial", 
                path: "/", 
                icon: <i className="ion-ios-home text-blue-500"></i>, 
                detail: "Landing page principal com apresentação do sistema e links de acesso rápido." 
            },
            { 
                name: "Página de Entrada", 
                path: "/inicio", 
                icon: <i className="ion-ios-home text-cyan-500"></i>, 
                detail: "Página alternativa de boas-vindas com informações sobre o sistema." 
            },
        ]
    },
    {
        name: "📊 Dashboard e Monitoramento",
        icon: <i className="ion-ios-analytics text-4xl text-emerald-400"></i>,
        description: "Central de controle com métricas em tempo real e visão geral do sistema.",
        links: [
            { 
                name: "Dashboard Principal", 
                path: "/dashboard", 
                icon: <i className="ion-ios-analytics text-emerald-500"></i>, 
                detail: "Painel de controle com estatísticas de ocupação, veículos estacionados e métricas operacionais em tempo real. Inclui gráficos interativos, paginação moderna e modais de detalhes." 
            },
        ]
    },
    {
        name: "🎯 Operações Radar (Core)",
        icon: <i className="ion-ios-search text-4xl text-orange-400"></i>,
        description: "Funcionalidades centrais para operação diária do pátio - interface principal para usuários finais.",
        links: [
            { 
                name: "Radar Principal", 
                path: "/radar", 
                icon: <i className="ion-ios-search text-orange-500"></i>, 
                detail: "Hub principal para todas as operações de estacionamento e localização de veículos." 
            },
            { 
                name: "Armazenar Moto", 
                path: "/radar/armazenar", 
                icon: <i className="ion-ios-add text-green-500"></i>, 
                detail: "Interface para escanear placas e estacionar motos em vagas livres automaticamente." 
            },
            { 
                name: "Buscar e Localizar Moto", 
                path: "/radar/buscar", 
                icon: <i className="ion-ios-search text-blue-500"></i>, 
                detail: "Localize veículos estacionados no pátio através de busca por placa com informações detalhadas." 
            },
            { 
                name: "Localizar por Placa", 
                path: "/radar/buscar", 
                icon: <i className="ion-ios-locate text-purple-500"></i>, 
                detail: "Localização específica de veículo por placa com detalhes completos. Use a página de busca para acessar." 
            },
            { 
                name: "Upload Mobile", 
                path: "/radar/buscar", 
                icon: <i className="ion-ios-cloud-upload text-cyan-500"></i>, 
                detail: "Interface para upload de imagens via dispositivos móveis. Acesse através do sistema de upload." 
            }
        ]
    },
    {
        name: "📈 Relatórios e Analytics",
        icon: <i className="ion-ios-stats text-4xl text-purple-400"></i>,
        description: "Sistema completo de relatórios com dados reais, análises avançadas e paginação moderna para tomada de decisão.",
        links: [
            { 
                name: "Relatórios Gerais", 
                path: "/relatorios", 
                icon: <i className="ion-ios-stats text-blue-500"></i>, 
                detail: "Hub principal para todos os relatórios do sistema com navegação intuitiva, métricas gerais e design responsivo." 
            },
            { 
                name: "Ocupação Diária", 
                path: "/relatorios/ocupacao-diaria", 
                icon: <i className="ion-ios-pie text-purple-500"></i>, 
                detail: "Relatórios diários de ocupação com gráficos interativos, evolução temporal, filtros por período e paginação moderna." 
            },
            { 
                name: "Movimentação", 
                path: "/relatorios/movimentacao", 
                icon: <i className="ion-ios-trending text-orange-500"></i>, 
                detail: "Análise de movimentação de veículos, padrões de uso do pátio, estatísticas de entrada/saída e paginação moderna." 
            },
            { 
                name: "Heatmap de Ocupação", 
                path: "/relatorios/heatmap", 
                icon: <i className="ion-ios-thermometer text-red-500"></i>, 
                detail: "Visualização térmica da ocupação por pátio com cores indicativas de densidade e design responsivo." 
            },
            { 
                name: "Análise Comportamental", 
                path: "/relatorios/comportamental", 
                icon: <i className="ion-ios-people text-green-500"></i>, 
                detail: "Análise de padrões de comportamento dos clientes com dados reais, insights e paginação moderna." 
            },
            { 
                name: "Dashboard IA", 
                path: "/relatorios/dashboard-ia", 
                icon: <i className="ion-ios-brain text-cyan-500"></i>, 
                detail: "Inteligência artificial para previsões e otimização com algoritmos avançados e design responsivo." 
            },
            { 
                name: "Relatórios Avançados", 
                path: "/relatorios/avancados", 
                icon: <i className="ion-ios-settings text-indigo-500"></i>, 
                detail: "Métricas de sistema, performance, manutenção e analytics avançados em tempo real com paginação moderna." 
            },
            { 
                name: "Notificações do Sistema", 
                path: "/relatorios/notificacoes", 
                icon: <i className="ion-ios-notifications text-yellow-500"></i>, 
                detail: "Central de notificações do sistema com filtros, ações, links de redirecionamento e paginação moderna." 
            }
        ]
    },
    {
        name: "🗺️ Visualizações e Mapas",
        icon: <i className="ion-ios-map text-4xl text-purple-400"></i>,
        description: "Ferramentas visuais para análise espacial e navegação no sistema.",
        links: [
            { 
                name: "Mapa 2D do Pátio", 
                path: "/mapa-2d", 
                icon: <i className="ion-ios-map text-purple-500"></i>, 
                detail: "Visualização esquemática 2D do pátio com disposição de galpões, acessos e áreas de circulação." 
            },
            { 
                name: "Mapa de Vagas", 
                path: "/vagas/mapa", 
                icon: <i className="ion-ios-map text-pink-500"></i>, 
                detail: "Visualização interativa das vagas disponíveis e ocupadas em tempo real." 
            },
            { 
                name: "Buscar Vagas", 
                path: "/vagas/buscar", 
                icon: <i className="ion-ios-search text-blue-500"></i>, 
                detail: "Interface para busca de vagas livres por critérios específicos (pátio, zona, tipo)." 
            },
        ]
    },
    {
        name: "🎯 Mapa de Vagas Avançado",
        icon: <i className="ion-ios-grid text-4xl text-emerald-400"></i>,
        description: "Sistema completo de visualização e gestão de vagas com múltiplas visualizações, filtros avançados e estatísticas em tempo real.",
        links: [
            { 
                name: "Mapa de Vagas Principal", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-grid text-emerald-500"></i>, 
                detail: "Hub principal para visualização avançada de vagas com 5 modos de visualização: Pátio, Mapa, Grade, Abas e Global." 
            },
            { 
                name: "Visualização por Pátio", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-home text-blue-500"></i>, 
                detail: "Visualização organizada por pátio com estatísticas, filtros por status e design responsivo. Acesse através do mapa-box." 
            },
            { 
                name: "Visualização em Mapa", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-map text-purple-500"></i>, 
                detail: "Mapa interativo com coordenadas reais, localização por GPS e visualização espacial das vagas. Acesse através do mapa-box." 
            },
            { 
                name: "Visualização em Grade", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-grid text-orange-500"></i>, 
                detail: "Grade visual das vagas com cores por status, hover effects e seleção interativa. Acesse através do mapa-box." 
            },
            { 
                name: "Visualização em Abas", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-list text-cyan-500"></i>, 
                detail: "Lista tabular com paginação moderna, filtros avançados e ações em massa. Acesse através do mapa-box." 
            },
            { 
                name: "Mapa Global", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-globe text-green-500"></i>, 
                detail: "Visualização global de todos os pátios com coordenadas geográficas e estatísticas consolidadas. Acesse através do mapa-box." 
            },
            { 
                name: "Estatísticas de Vagas", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-analytics text-indigo-500"></i>, 
                detail: "Dashboard de estatísticas com gráficos de ocupação, evolução temporal e métricas de performance. Acesse através do mapa-box." 
            },
            { 
                name: "Filtros Avançados", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-funnel text-yellow-500"></i>, 
                detail: "Sistema de filtros por pátio, status, zona e período com interface intuitiva e resultados em tempo real. Acesse através do mapa-box." 
            },
            { 
                name: "Teste de API", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-flask text-red-500"></i>, 
                detail: "Ferramenta de teste de endpoints da API com validação de dados e monitoramento de performance. Acesse através do mapa-box." 
            },
            { 
                name: "Debug e Navegação", 
                path: "/mapa-box", 
                icon: <i className="ion-ios-bug text-gray-500"></i>, 
                detail: "Ferramentas de debug para desenvolvedores com logs detalhados e navegação entre visualizações. Acesse através do mapa-box." 
            }
        ]
    },
    {
        name: "👥 Gerenciamento de Clientes",
        icon: <i className="ion-ios-people text-4xl text-blue-400"></i>,
        description: "Centralize todas as informações dos seus clientes com sistema completo de gestão e interface neumórfica.",
        links: [
            { name: "Listar Clientes", path: "/clientes/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualize clientes com filtros, paginação moderna e design responsivo; acesse detalhes/editar/excluir pela lista." },
            { name: "Cadastrar Cliente", path: "/clientes/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Formulário neumórfico responsivo para cadastro de novos clientes com validação em tempo real." },
            { name: "Buscar Clientes", path: "/clientes/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca avançada por múltiplos critérios com interface neumórfica e design responsivo." },
            { name: "Alterar Cliente", path: "/clientes/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de clientes existentes com interface responsiva. Acesse através da lista de clientes." },
            { name: "Detalhes do Cliente", path: "/clientes/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações do cliente com design responsivo. Acesse através da lista de clientes." },
            { name: "Deletar Cliente", path: "/clientes/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de clientes do sistema. Acesse através da lista de clientes." }
        ]
    },
    {
        name: "🏍️ Gerenciamento de Veículos",
        icon: <i className="ion-ios-car text-4xl text-green-400"></i>,
        description: "Gerencie toda a frota de motos com sistema de tags BLE automáticas, rastreamento em tempo real e interface neumórfica.",
        links: [
            { name: "Listar Motos", path: "/veiculo/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualize motos com status e localização, paginação moderna e design responsivo; acesse detalhes/editar/excluir pela lista." },
            { name: "Cadastrar Moto", path: "/veiculo/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro neumórfico responsivo com geração automática de Tag BLE (TAG001, TAG002, etc.) e validação em tempo real." },
            { name: "Buscar Motos", path: "/veiculo/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por placa, modelo, fabricante ou tag BLE com interface neumórfica e design responsivo." },
            { name: "Alterar Moto", path: "/veiculo/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de motos existentes com interface responsiva. Acesse através da lista de veículos." },
            { name: "Detalhes da Moto", path: "/veiculo/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações da moto com design responsivo. Acesse através da lista de veículos." },
            { name: "Deletar Moto", path: "/veiculo/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de motos do sistema. Acesse através da lista de veículos." }
        ]
    },
    {
        name: "🏢 Gestão de Pátios",
        icon: <i className="ion-ios-business text-4xl text-orange-400"></i>,
        description: "Representam as grandes áreas do estacionamento com gestão completa de dados e interface neumórfica.",
        links: [
            { name: "Listar Pátios", path: "/patio/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de todos os pátios com filtros, paginação moderna e design responsivo." },
            { name: "Cadastrar Pátio", path: "/patio/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro responsivo com campos: Nome, Observação, Data de Cadastro automática e validação em tempo real." },
            { name: "Novo Assistente", path: "/patio/novo-assistente", icon: <i className="ion-ios-add text-emerald-500"></i>, detail: "Assistente wizard neumórfico responsivo para criação completa de pátio com zonas e boxes." },
            { name: "Alterar Pátio", path: "/patio/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Wizard neumórfico responsivo para alteração de pátios existentes com todas as etapas. Acesse através da lista de pátios." },
            { name: "Buscar Pátios", path: "/patio/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca avançada com design responsivo; acesse detalhes/editar/excluir pela lista." },
            { name: "Detalhes do Pátio", path: "/patio/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações do pátio com design responsivo. Acesse através da lista de pátios." },
            { name: "Deletar Pátio", path: "/patio/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de pátios do sistema. Acesse através da lista de pátios." }
        ]
    },
    {
        name: "🗺️ Zonas",
        icon: <i className="ion-ios-map text-3xl text-purple-400"></i>,
        description: "Subdivisões dentro de um pátio (ex: Setor A, Setor B). Gerenciadas através do pátio pai.",
        links: [
            { name: "Listar Zonas", path: "/zona/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de todas as zonas do sistema com paginação moderna e design responsivo." },
            { name: "Cadastrar Zona", path: "/zona/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro responsivo vinculado a um pátio específico com validação em tempo real." },
            { name: "Buscar Zonas", path: "/zona/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por nome, pátio ou observações com design responsivo e paginação moderna." },
            { name: "Alterar Zona", path: "/zona/buscar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de zonas existentes com interface responsiva. Acesse através da busca de zonas." },
            { name: "Detalhes da Zona", path: "/zona/buscar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações da zona com design responsivo. Acesse através da busca de zonas." },
            { name: "Gerenciar Zonas", path: "/gerenciamento-patio/patio", icon: <i className="ion-ios-settings text-yellow-500"></i>, detail: "Alterar, visualizar detalhes e deletar zonas através da gestão do pátio com paginação moderna." }
        ]
    },
    {
        name: "📦 Boxes (Vagas)",
        icon: <i className="ion-ios-cube text-3xl text-orange-400"></i>,
        description: "Unidades finais de alocação com status em tempo real (Livre/Ocupado). Gerenciadas através do pátio pai.",
        links: [
            { name: "Listar Boxes", path: "/box/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de todas as vagas do sistema com paginação moderna e design responsivo." },
            { name: "Cadastrar Box", path: "/box/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro manual responsivo de vagas individuais com validação em tempo real." },
            { name: "Gerar em Lote", path: "/box/gerar", icon: <i className="ion-ios-add text-emerald-500"></i>, detail: "Geração automática de múltiplas vagas por zona com interface responsiva." },
            { name: "Buscar Boxes", path: "/box/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por código, status ou pátio com design responsivo e paginação moderna." },
            { name: "Alterar Box", path: "/box/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de boxes existentes com interface responsiva. Acesse através da lista de boxes." },
            { name: "Detalhes do Box", path: "/box/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações do box com design responsivo. Acesse através da lista de boxes." },
            { name: "Deletar Box", path: "/box/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de boxes do sistema. Acesse através da lista de boxes." },
            { name: "Gerenciar Boxes", path: "/gerenciamento-patio/box", icon: <i className="ion-ios-settings text-yellow-500"></i>, detail: "Alterar, visualizar detalhes e deletar boxes através da gestão do pátio com paginação moderna." }
        ]
    },
    {
        name: "⚙️ Gerenciamento de Pátios",
        icon: <i className="ion-ios-settings text-4xl text-indigo-400"></i>,
        description: "Interface centralizada para gestão completa de pátios, zonas e boxes com paginação moderna e design responsivo.",
        links: [
            { 
                name: "Dashboard de Gerenciamento", 
                path: "/gerenciamento-patio", 
                icon: <i className="ion-ios-analytics text-indigo-500"></i>, 
                detail: "Hub central para gestão de pátios com visão geral, estatísticas e acesso rápido a todas as funcionalidades." 
            },
            { 
                name: "Gestão de Zonas", 
                path: "/gerenciamento-patio/zona", 
                icon: <i className="ion-ios-map text-purple-500"></i>, 
                detail: "Interface completa para gerenciar zonas com paginação moderna, filtros avançados e design responsivo." 
            },
            { 
                name: "Gestão de Pátios", 
                path: "/gerenciamento-patio/patio", 
                icon: <i className="ion-ios-business text-orange-500"></i>, 
                detail: "Gestão centralizada de pátios com paginação moderna, visualização em cards/tabela e design responsivo." 
            },
            { 
                name: "Gestão de Boxes", 
                path: "/gerenciamento-patio/box", 
                icon: <i className="ion-ios-cube text-green-500"></i>, 
                detail: "Controle completo de boxes/vagas com paginação moderna, filtros por status e design responsivo." 
            }
        ]
    },
    {
        name: "🏢 Unidades Organizacionais",
        icon: <i className="ion-ios-settings text-4xl text-red-400"></i>,
        description: "Gestão de unidades administrativas e ferramentas de desenvolvimento do sistema.",
        links: [
            { 
                name: "Administração", 
                path: "/unidades/administracao", 
                icon: <i className="ion-ios-settings text-red-500"></i>, 
                detail: "Painel administrativo para gestão de pátios, zonas e boxes com importação JSON." 
            },
            { 
                name: "Designer", 
                path: "/unidades/designer", 
                icon: <i className="ion-ios-color-palette text-pink-500"></i>, 
                detail: "Interface para customização visual e design do sistema." 
            },
        ]
    },
    {
        name: "🔧 Ferramentas de Desenvolvimento",
        icon: <i className="ion-ios-code text-4xl text-yellow-400"></i>,
        description: "Ferramentas para desenvolvedores e testes do sistema.",
        links: [
            
        ]
    },
    {
        name: "📞 Suporte e Contato",
        icon: <i className="ion-ios-mail text-4xl text-pink-400"></i>,
        description: "Canais de comunicação e suporte ao usuário com sistema inteligente de email e mapa interativo.",
        links: [
            { 
                name: "Fale Conosco", 
                path: "/contato", 
                icon: <i className="ion-ios-mail text-pink-500"></i>, 
                detail: "Formulário de contato inteligente com 8 provedores de email (Gmail, Outlook, Yahoo, iCloud, Zoho, Proton, Locaweb, UOL Host). Inclui mapa interativo do FIAP, informações da equipe e repositórios do projeto com efeitos hover." 
            },
        ]
    },
    {
        name: "💬 Sistema de Feedback",
        icon: <i className="ion-ios-chatbubbles text-4xl text-green-400"></i>,
        description: "Sistema inteligente de feedback com detecção automática de cliente de email e múltiplas opções de envio.",
        links: [
            { 
                name: "Enviar Feedback", 
                path: "/ajuda/feedback", 
                icon: <i className="ion-ios-chatbubbles text-green-500"></i>, 
                detail: "Sistema completo de feedback com upload de imagens, captura automática de URL, tipos de feedback (Bug, Sugestão, Dúvida, Elogio) e 8 provedores de email com detecção automática." 
            },
        ]
    }
];

export default function MapaDoSitePage() {
    return (
        <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 pb-16 sm:pb-32">
                <div className="container mx-auto neumorphic-container p-3 sm:p-6 md:p-8 pb-8 sm:pb-16">
                    <header className="text-center mb-8 sm:mb-12">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight mb-3 sm:mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                            <i className="ion-ios-map text-emerald-600 text-3xl sm:text-4xl md:text-5xl"></i>
                            <span style={{fontFamily: 'Montserrat, sans-serif'}}>Mapa do Site - Sistema Radar Mottu</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Guia completo de todas as funcionalidades do sistema de gestão de estacionamento inteligente. 
                            Navegue pelas seções para entender cada módulo e suas capacidades operacionais.
                        </p>
                        <div className="mt-4 sm:mt-6 neumorphic-container p-4 sm:p-6 max-w-2xl mx-auto">
                            <div className="text-slate-800 text-sm sm:text-base flex flex-col items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-lightbulb text-yellow-500 text-xl sm:text-2xl"></i>
                                    <span className="font-bold text-slate-800">Dica:</span>
                                </div>
                                <p className="text-emerald-600 text-center font-medium text-xs sm:text-sm">
                                    Use o menu de navegação principal para acessar rapidamente qualquer seção do sistema.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                        {sections.map((section, index) => (
                            <div key={section.name} className="neumorphic-fieldset p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                                <legend className="neumorphic-legend flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <span className="text-xl sm:text-2xl md:text-3xl bg-emerald-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-sm sm:text-base md:text-lg lg:text-xl">{section.name}</span>
                                </legend>
                                <p className="text-slate-600 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>{section.description}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                    {section.links.map((link, linkIndex) => (
                                        <div key={`${link.path}-${linkIndex}`} 
                                             className="group neumorphic-container p-4 sm:p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                                            <Link 
                                                href={link.path} 
                                                className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-semibold text-slate-800 hover:text-emerald-600 transition-all duration-200"
                                                style={{fontFamily: 'Montserrat, sans-serif'}}
                                            >
                                                {link.icon} 
                                                <span className="truncate">{link.name}</span>
                                            </Link>
                                            <p className="text-slate-600 mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                {link.detail}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Seção de Informações Adicionais */}
                    <div className="mt-8 sm:mt-12 lg:mt-16 space-y-6 sm:space-y-8">
                        {/* Características Principais */}
                        <div className="neumorphic-fieldset p-4 sm:p-6 md:p-8">
                            <legend className="neumorphic-legend flex items-center gap-2 mb-4 sm:mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-star text-yellow-500 text-xl sm:text-2xl"></i>
                                <span className="text-sm sm:text-base md:text-lg">Características Principais do Sistema</span>
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="neumorphic-container p-4 sm:p-6 text-center">
                                    <i className="ion-ios-flash text-3xl sm:text-4xl text-emerald-500 mb-3 sm:mb-4"></i>
                                    <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Interface Neumórfica
                                    </h4>
                                    <p className="text-slate-600 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Design moderno com efeitos de profundidade e sombras suaves</p>
                                </div>
                                <div className="neumorphic-container p-4 sm:p-6 text-center">
                                    <i className="ion-ios-analytics text-3xl sm:text-4xl text-blue-500 mb-3 sm:mb-4"></i>
                                    <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Tempo Real
                                    </h4>
                                    <p className="text-slate-600 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Atualizações instantâneas de status e ocupação</p>
                                </div>
                                <div className="neumorphic-container p-4 sm:p-6 text-center">
                                    <i className="ion-ios-map text-3xl sm:text-4xl text-purple-500 mb-3 sm:mb-4"></i>
                                    <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Visualização
                                    </h4>
                                    <p className="text-slate-600 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Mapas 2D interativos, visualização de vagas em tempo real, mapa do FIAP e interface responsiva</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 sm:mt-8 neumorphic-container p-4 sm:p-6">
                                <h4 className="font-semibold text-slate-800 mb-3 text-base sm:text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-stats text-emerald-500 text-xl sm:text-2xl"></i>
                                    <span>Estatísticas do Sistema</span>
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-2xl sm:text-3xl font-bold text-emerald-600" style={{fontFamily: 'Montserrat, sans-serif'}}>59+</div>
                                        <div className="text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Páginas Implementadas</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-2xl sm:text-3xl font-bold text-blue-600" style={{fontFamily: 'Montserrat, sans-serif'}}>13</div>
                                        <div className="text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Módulos Principais</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-2xl sm:text-3xl font-bold text-purple-600" style={{fontFamily: 'Montserrat, sans-serif'}}>5</div>
                                        <div className="text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Visualizações Mapa-Box</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-2xl sm:text-3xl font-bold text-orange-600" style={{fontFamily: 'Montserrat, sans-serif'}}>100%</div>
                                        <div className="text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>CRUD Completo</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-8 neumorphic-container p-4 sm:p-6">
                                <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-code text-emerald-500 text-xl sm:text-2xl"></i>
                                    <span>Stack Tecnológico</span>
                                </h4>
                                <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6">
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-orange-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white" alt="Gradle" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle DB" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-red-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-cyan-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-teal-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/50" loading="lazy" />
                                    </div>
                                    
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/OpenALPR-blue?style=for-the-badge" alt="OpenALPR" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="SCSS" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-pink-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Stadia%20Maps-0A0A0A?style=for-the-badge&logo=stadiamaps&logoColor=white" alt="Stadia Maps" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/OpenStreetMap-77B657?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="OpenStreetMap" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white" alt="Mapbox" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/ViaCEP-2E7D32?style=for-the-badge&logoColor=white" alt="ViaCEP" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/ChatGPT-00A67E?style=for-the-badge&logo=openai&logoColor=white" alt="ChatGPT" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white" alt="Cursor IDE" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Tesseract-000000?style=for-the-badge&logo=tesseract&logoColor=white" alt="Tesseract" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/CodePen-000000?style=for-the-badge&logo=codepen&logoColor=white" alt="CodePen" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/50" loading="lazy" />
                                    </div>
                                    <div className="group cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-1">
                                        <img src="https://img.shields.io/badge/Hostinger-0066FF?style=for-the-badge&logo=hostinger&logoColor=white" alt="Hostinger" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/50" loading="lazy" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 neumorphic-container p-6">
                                <h4 className="font-semibold text-slate-800 mb-4 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-mail text-pink-500 text-2xl"></i>
                                    Sistema de Email Inteligente
                                </h4>
                                <div className="grid md:grid-cols-4 gap-3 text-center mb-6">
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-logo-google text-red-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-red-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Gmail</h5>
                                    </div>
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-logo-microsoft text-blue-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-blue-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Outlook</h5>
                                    </div>
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-logo-yahoo text-purple-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-purple-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Yahoo</h5>
                                    </div>
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-logo-apple text-gray-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-gray-600" style={{fontFamily: 'Montserrat, sans-serif'}}>iCloud</h5>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-4 gap-3 text-center mb-4">
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-ios-mail text-orange-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-orange-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Zoho</h5>
                                    </div>
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-ios-shield text-indigo-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-indigo-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Proton</h5>
                                    </div>
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-ios-business text-green-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-green-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Locaweb</h5>
                                    </div>
                                    <div className="neumorphic-container p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-ios-globe text-yellow-600 text-xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 text-xs transition-colors duration-300 group-hover:text-yellow-600" style={{fontFamily: 'Montserrat, sans-serif'}}>UOL Host</h5>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-600 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-information-circle text-blue-500 mr-1"></i>
                                        <strong>8 Provedores:</strong> Sistema detecta automaticamente o cliente de email e oferece múltiplas opções de envio.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </main>
    );
}