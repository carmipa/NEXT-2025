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
                detail: "Painel de controle com estatísticas de ocupação, veículos estacionados e métricas operacionais em tempo real. Inclui gráficos interativos, paginação e modais de detalhes." 
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
        description: "Relatórios de ocupação e evolução com gráficos interativos e análise de dados.",
        links: [
            { 
                name: "Relatórios Gerais", 
                path: "/relatorios", 
                icon: <i className="ion-ios-stats text-blue-500"></i>, 
                detail: "Hub principal para todos os relatórios do sistema com navegação intuitiva e métricas gerais." 
            },
            { 
                name: "Ocupação Diária", 
                path: "/relatorios/ocupacao-diaria", 
                icon: <i className="ion-ios-pie text-purple-500"></i>, 
                detail: "Relatórios diários de ocupação com gráficos de pizza, evolução temporal e filtros por período." 
            },
            { 
                name: "Movimentação", 
                path: "/relatorios/movimentacao", 
                icon: <i className="ion-ios-trending text-orange-500"></i>, 
                detail: "Análise de movimentação de veículos, padrões de uso do pátio e estatísticas de entrada/saída." 
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
        name: "👥 Gerenciamento de Clientes",
        icon: <i className="ion-ios-people text-4xl text-blue-400"></i>,
        description: "Centralize todas as informações dos seus clientes com sistema completo de gestão e interface neumórfica.",
        links: [
            { name: "Listar Clientes", path: "/clientes/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualize clientes com filtros e paginação; acesse detalhes/editar/excluir pela lista." },
            { name: "Cadastrar Cliente", path: "/clientes/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Formulário neumórfico para cadastro de novos clientes." },
            { name: "Buscar Clientes", path: "/clientes/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca avançada por múltiplos critérios com interface neumórfica." },
            { name: "Alterar Cliente", path: "/clientes/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de clientes existentes. Acesse através da lista de clientes." },
            { name: "Detalhes do Cliente", path: "/clientes/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações do cliente. Acesse através da lista de clientes." },
            { name: "Deletar Cliente", path: "/clientes/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de clientes do sistema. Acesse através da lista de clientes." }
        ]
    },
    {
        name: "🏍️ Gerenciamento de Veículos",
        icon: <i className="ion-ios-car text-4xl text-green-400"></i>,
        description: "Gerencie toda a frota de motos com sistema de tags BLE automáticas, rastreamento em tempo real e interface neumórfica.",
        links: [
            { name: "Listar Motos", path: "/veiculo/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualize motos com status e localização; acesse detalhes/editar/excluir pela lista." },
            { name: "Cadastrar Moto", path: "/veiculo/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro neumórfico com geração automática de Tag BLE (TAG001, TAG002, etc.)." },
            { name: "Buscar Motos", path: "/veiculo/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por placa, modelo, fabricante ou tag BLE com interface neumórfica." },
            { name: "Alterar Moto", path: "/veiculo/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de motos existentes. Acesse através da lista de veículos." },
            { name: "Detalhes da Moto", path: "/veiculo/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações da moto. Acesse através da lista de veículos." },
            { name: "Deletar Moto", path: "/veiculo/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de motos do sistema. Acesse através da lista de veículos." }
        ]
    },
    {
        name: "🏢 Gestão de Pátios",
        icon: <i className="ion-ios-business text-4xl text-orange-400"></i>,
        description: "Representam as grandes áreas do estacionamento com gestão completa de dados e interface neumórfica.",
        links: [
            { name: "Listar Pátios", path: "/patio/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de todos os pátios com filtros e paginação." },
            { name: "Cadastrar Pátio", path: "/patio/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro com campos: Nome, Observação, Data de Cadastro automática." },
            { name: "Novo Assistente", path: "/patio/novo-assistente", icon: <i className="ion-ios-add text-emerald-500"></i>, detail: "Assistente wizard neumórfico para criação completa de pátio com zonas e boxes." },
            { name: "Alterar Pátio", path: "/patio/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Wizard neumórfico para alteração de pátios existentes com todas as etapas. Acesse através da lista de pátios." },
            { name: "Buscar Pátios", path: "/patio/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca avançada; acesse detalhes/editar/excluir pela lista." },
            { name: "Detalhes do Pátio", path: "/patio/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações do pátio. Acesse através da lista de pátios." },
            { name: "Deletar Pátio", path: "/patio/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de pátios do sistema. Acesse através da lista de pátios." }
        ]
    },
    {
        name: "🗺️ Zonas",
        icon: <i className="ion-ios-map text-3xl text-purple-400"></i>,
        description: "Subdivisões dentro de um pátio (ex: Setor A, Setor B). Gerenciadas através do pátio pai.",
        links: [
            { name: "Listar Zonas", path: "/zona/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de todas as zonas do sistema." },
            { name: "Cadastrar Zona", path: "/zona/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro vinculado a um pátio específico." },
            { name: "Buscar Zonas", path: "/zona/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por nome, pátio ou observações." },
            { name: "Alterar Zona", path: "/zona/buscar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de zonas existentes. Acesse através da busca de zonas." },
            { name: "Detalhes da Zona", path: "/zona/buscar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações da zona. Acesse através da busca de zonas." },
            { name: "Gerenciar Zonas", path: "/gerenciamento-patio/patio", icon: <i className="ion-ios-settings text-yellow-500"></i>, detail: "Alterar, visualizar detalhes e deletar zonas através da gestão do pátio." }
        ]
    },
    {
        name: "📦 Boxes (Vagas)",
        icon: <i className="ion-ios-cube text-3xl text-orange-400"></i>,
        description: "Unidades finais de alocação com status em tempo real (Livre/Ocupado). Gerenciadas através do pátio pai.",
        links: [
            { name: "Listar Boxes", path: "/box/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de todas as vagas do sistema." },
            { name: "Cadastrar Box", path: "/box/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro manual de vagas individuais." },
            { name: "Gerar em Lote", path: "/box/gerar", icon: <i className="ion-ios-add text-emerald-500"></i>, detail: "Geração automática de múltiplas vagas por zona." },
            { name: "Buscar Boxes", path: "/box/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por código, status ou pátio." },
            { name: "Alterar Box", path: "/box/listar", icon: <i className="ion-ios-create text-yellow-500"></i>, detail: "Edição de dados de boxes existentes. Acesse através da lista de boxes." },
            { name: "Detalhes do Box", path: "/box/listar", icon: <i className="ion-ios-eye text-purple-500"></i>, detail: "Visualização detalhada de informações do box. Acesse através da lista de boxes." },
            { name: "Deletar Box", path: "/box/listar", icon: <i className="ion-ios-trash text-red-500"></i>, detail: "Remoção de boxes do sistema. Acesse através da lista de boxes." },
            { name: "Gerenciar Boxes", path: "/gerenciamento-patio/box", icon: <i className="ion-ios-settings text-yellow-500"></i>, detail: "Alterar, visualizar detalhes e deletar boxes através da gestão do pátio." }
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
            { name: "API Swagger", path: "http://localhost:8080/swagger-ui.html", icon: <i className="ion-ios-document text-blue-500"></i>, detail: "Documentação completa da API REST com interface Swagger UI." },
            { name: "Teste de API (Removido)", path: "#", icon: <i className="ion-ios-flask text-gray-500"></i>, detail: "Página de teste de API foi removida do sistema. Use o Swagger para testes." }
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
        <main className="min-h-screen text-white p-4 md:p-8 pb-32">
                <div className="container mx-auto neumorphic-container p-6 md:p-8 pb-16">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-slate-800 tracking-tight mb-4 flex items-center justify-center gap-3">
                            <i className="ion-ios-map text-emerald-600 text-5xl"></i>
                            <span style={{fontFamily: 'Montserrat, sans-serif'}}>Mapa do Site - Sistema Radar Mottu</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Guia completo de todas as funcionalidades do sistema de gestão de estacionamento inteligente. 
                            Navegue pelas seções para entender cada módulo e suas capacidades operacionais.
                        </p>
                        <div className="mt-6 neumorphic-container p-6 max-w-2xl mx-auto">
                            <div className="text-slate-800 text-base flex flex-col items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-lightbulb text-yellow-500 text-2xl"></i>
                                    <span className="font-bold text-slate-800">Dica:</span>
                                </div>
                                <p className="text-emerald-600 text-center font-medium">
                                    Use o menu de navegação principal para acessar rapidamente qualquer seção do sistema.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-10">
                        {sections.map((section, index) => (
                            <div key={section.name} className="neumorphic-fieldset p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                                <legend className="neumorphic-legend flex items-center gap-3 mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <span className="text-3xl bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                    {section.name}
                                </legend>
                                <p className="text-slate-600 text-xl mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>{section.description}</p>
                                <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {section.links.map((link, linkIndex) => (
                                        <div key={`${link.path}-${linkIndex}`} 
                                             className="group neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                                            <Link 
                                                href={link.path} 
                                                className="flex items-center gap-3 text-xl font-semibold text-slate-800 hover:text-emerald-600 transition-all duration-200"
                                                style={{fontFamily: 'Montserrat, sans-serif'}}
                                            >
                                                {link.icon} 
                                                <span>{link.name}</span>
                                            </Link>
                                            <p className="text-slate-600 mt-3 text-sm leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                {link.detail}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Seção de Informações Adicionais */}
                    <div className="mt-16 space-y-8">
                        {/* Características Principais */}
                        <div className="neumorphic-fieldset p-8">
                            <legend className="neumorphic-legend flex items-center gap-2 mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-star text-yellow-500 text-2xl"></i>
                                Características Principais do Sistema
                            </legend>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="neumorphic-container p-6 text-center">
                                    <i className="ion-ios-flash text-4xl text-emerald-500 mb-4"></i>
                                    <h4 className="font-semibold text-slate-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Interface Neumórfica
                                    </h4>
                                    <p className="text-slate-600 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Design moderno com efeitos de profundidade e sombras suaves</p>
                                </div>
                                <div className="neumorphic-container p-6 text-center">
                                    <i className="ion-ios-analytics text-4xl text-blue-500 mb-4"></i>
                                    <h4 className="font-semibold text-slate-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Tempo Real
                                    </h4>
                                    <p className="text-slate-600 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Atualizações instantâneas de status e ocupação</p>
                                </div>
                                <div className="neumorphic-container p-6 text-center">
                                    <i className="ion-ios-map text-4xl text-purple-500 mb-4"></i>
                                    <h4 className="font-semibold text-slate-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Visualização
                                    </h4>
                                    <p className="text-slate-600 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Mapas 2D interativos, visualização de vagas em tempo real, mapa do FIAP e interface responsiva</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 neumorphic-container p-6">
                                <h4 className="font-semibold text-slate-800 mb-3 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-stats text-emerald-500 text-2xl"></i>
                                    Estatísticas do Sistema
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-emerald-600" style={{fontFamily: 'Montserrat, sans-serif'}}>50+</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Páginas Implementadas</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-blue-600" style={{fontFamily: 'Montserrat, sans-serif'}}>12</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Módulos Principais</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-purple-600" style={{fontFamily: 'Montserrat, sans-serif'}}>8</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Provedores Email</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-orange-600" style={{fontFamily: 'Montserrat, sans-serif'}}>100%</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>CRUD Completo</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 neumorphic-container p-6">
                                <h4 className="font-semibold text-slate-800 mb-4 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-code text-emerald-500 text-2xl"></i>
                                    Stack Tecnológico
                                </h4>
                                <div className="flex justify-center items-center gap-3 flex-wrap mb-6">
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
                                        <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" className="badge-tech transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/50" loading="lazy" />
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
                                    <p className="text-slate-600 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>
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