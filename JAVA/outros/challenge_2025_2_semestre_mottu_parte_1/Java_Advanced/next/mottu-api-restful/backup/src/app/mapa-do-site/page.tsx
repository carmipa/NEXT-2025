"use client";

import NavBar from '@/components/nav-bar';
import Link from 'next/link';
import '@/types/styles/neumorphic.css';

// Estrutura de dados para descrever as seções do site
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
                detail: "Painel de controle com estatísticas de ocupação, veículos estacionados e métricas operacionais em tempo real." 
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
        isGroup: true,
        description: "Sistema completo de gestão de clientes com operações CRUD completas.",
        items: [
            {
                name: "Clientes",
                icon: <i className="ion-ios-people text-3xl text-cyan-400"></i>,
                description: "Centralize todas as informações dos seus clientes com sistema completo de gestão.",
                links: [
                    { name: "Listar Clientes", path: "/clientes/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualize clientes com filtros e paginação; acesse detalhes/editar/excluir pela lista." },
                    { name: "Cadastrar Cliente", path: "/clientes/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Formulário para cadastro de novos clientes." },
                    { name: "Buscar Clientes", path: "/clientes/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca avançada por múltiplos critérios." },
                ]
            }
        ]
    },
    {
        name: "🚗 Gerenciamento de Veículos",
        isGroup: true,
        description: "Sistema completo de gestão da frota com tags BLE automáticas e rastreamento.",
        items: [
            {
                name: "Motos",
                icon: <i className="ion-ios-bicycle text-3xl text-purple-400"></i>,
                description: "Gerencie toda a frota de motos com sistema de tags BLE automáticas e rastreamento em tempo real.",
                links: [
                    { name: "Listar Motos", path: "/veiculo/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualize motos com status e localização; acesse detalhes/editar/excluir pela lista." },
                    { name: "Cadastrar Moto", path: "/veiculo/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro com geração automática de Tag BLE (TAG001, TAG002, etc.)." },
                    { name: "Buscar Motos", path: "/veiculo/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por placa, modelo, fabricante ou tag BLE." },
                ]
            }
        ]
    },
    {
        name: "🏢 Gerenciamento Unificado de Pátios",
        isGroup: true,
        description: "Sistema integrado para gestão completa da estrutura física: Pátios → Zonas → Boxes.",
        items: [
            {
                name: "Gerenciamento Unificado",
                icon: <i className="ion-ios-home text-3xl text-emerald-400"></i>,
                description: "Interface unificada para gerenciar toda a estrutura física do sistema com abas integradas.",
                links: [
                    { name: "Gerenciamento Principal", path: "/gerenciamento-patio", icon: <i className="ion-ios-home text-emerald-500"></i>, detail: "Interface principal com navegação hierárquica entre pátios, zonas e boxes." },
                    { name: "Aba Pátios", path: "/gerenciamento-patio/patio", icon: <i className="ion-ios-home text-green-500"></i>, detail: "Aba específica para gestão de pátios com estatísticas e operações CRUD." },
                    { name: "Aba Zonas", path: "/gerenciamento-patio/zona", icon: <i className="ion-ios-map text-purple-500"></i>, detail: "Aba específica para gestão de zonas dentro dos pátios." },
                    { name: "Aba Boxes", path: "/gerenciamento-patio/box", icon: <i className="ion-ios-cube text-orange-500"></i>, detail: "Aba específica para gestão de boxes/vagas com status em tempo real." },
                ]
            }
        ]
    },
    {
        name: "🏗️ Estrutura Física (Gestão Individual)",
        isGroup: true,
        description: "Gestão individual de cada componente da estrutura física com operações CRUD completas.",
        items: [
            {
                name: "Pátios",
                icon: <i className="ion-ios-home text-3xl text-green-400"></i>,
                description: "Representam as grandes áreas do estacionamento com gestão completa de dados.",
                links: [
                    { name: "Listar Pátios", path: "/patio/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de todos os pátios com filtros e paginação." },
                    { name: "Cadastrar Pátio", path: "/patio/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro com campos: Nome, Observação, Data de Cadastro automática." },
                    { name: "Novo Assistente", path: "/patio/novo-assistente", icon: <i className="ion-ios-add text-emerald-500"></i>, detail: "Assistente wizard para criação completa de pátio com zonas e boxes." },
                    { name: "Buscar Pátios", path: "/patio/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca avançada; acesse detalhes/editar/excluir pela lista." },
                ]
            },
            {
                name: "Zonas",
                icon: <i className="ion-ios-map text-3xl text-purple-400"></i>,
                description: "Subdivisões dentro de um pátio (ex: Setor A, Setor B) com gestão completa.",
                links: [
                    { name: "Listar Zonas", path: "/zona/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de zonas; acesse detalhes/editar/excluir pela lista." },
                    { name: "Cadastrar Zona", path: "/zona/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro vinculado a um pátio específico." },
                    { name: "Buscar Zonas", path: "/zona/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por nome, pátio ou observações." },
                ]
            },
            {
                name: "Boxes (Vagas)",
                icon: <i className="ion-ios-cube text-3xl text-orange-400"></i>,
                description: "Unidades finais de alocação com status em tempo real (Livre/Ocupado).",
                links: [
                    { name: "Listar Boxes", path: "/box/listar", icon: <i className="ion-ios-list text-blue-500"></i>, detail: "Visualização de vagas; acesse detalhes/editar/excluir pela lista." },
                    { name: "Cadastrar Box", path: "/box/cadastrar", icon: <i className="ion-ios-add text-green-500"></i>, detail: "Cadastro manual de vagas individuais." },
                    { name: "Gerar em Lote", path: "/box/gerar", icon: <i className="ion-ios-add text-emerald-500"></i>, detail: "Geração automática de múltiplas vagas por zona." },
                    { name: "Buscar Boxes", path: "/box/buscar", icon: <i className="ion-ios-search text-orange-500"></i>, detail: "Busca por código, status ou pátio." },
                ]
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
            { 
                name: "Teste API", 
                path: "/teste-api", 
                icon: <i className="ion-ios-code text-yellow-500"></i>, 
                detail: "Interface para testar endpoints da API e verificar conectividade." 
            },
        ]
    },
    {
        name: "📞 Suporte e Contato",
        icon: <i className="ion-ios-mail text-4xl text-pink-400"></i>,
        description: "Canais de comunicação e suporte ao usuário com sistema inteligente de email.",
        links: [
            { 
                name: "Fale Conosco", 
                path: "/contato", 
                icon: <i className="ion-ios-mail text-pink-500"></i>, 
                detail: "Formulário de contato inteligente com opções múltiplas de envio: Gmail, Outlook ou cliente de email genérico. Após validar o formulário, escolha seu provedor preferido para enviar automaticamente a mensagem pré-preenchida. Inclui informações da equipe, mapa interativo e repositórios do projeto." 
            },
        ]
    }
];

export default function MapaDoSitePage() {
    return (
        <>
            <NavBar active="mapa-do-site" />
            <main className="min-h-screen text-white p-4 md:p-8 mb-16">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 pb-16 rounded-lg shadow-xl">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-white tracking-tight mb-4 flex items-center justify-center gap-3">
                            <i className="ion-ios-map text-emerald-400 text-5xl"></i>
                            <span style={{fontFamily: 'Montserrat, sans-serif'}}>Mapa do Site - Sistema Radar Mottu</span>
                        </h1>
                        <p className="text-xl text-slate-200 max-w-4xl mx-auto leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Guia completo de todas as funcionalidades do sistema de gestão de estacionamento inteligente. 
                            Navegue pelas seções para entender cada módulo e suas capacidades operacionais.
                        </p>
                        <div className="mt-6 neumorphic-container p-6 max-w-2xl mx-auto">
                            <div className="text-slate-800 text-base flex flex-col items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-lightbulb text-yellow-500 text-2xl"></i>
                                    <span className="font-bold text-black">Dica:</span>
                                </div>
                                <p className="text-red-600 text-center font-medium">
                                    Use o menu de navegação principal para acessar rapidamente qualquer seção do sistema.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-10">
                        {sections.map((section, index) => (
                            <div key={section.name} className="neumorphic-fieldset p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                                {section.isGroup ? (
                                    <>
                                        <legend className="neumorphic-legend flex items-center gap-3 mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                            <span className="text-3xl bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                            {section.name}
                                        </legend>
                                        <p className="text-slate-800 text-xl mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>{section.description}</p>
                                        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {section.items?.map((item, itemIndex) => (
                                                <div key={`${section.name}-${item.name}-${itemIndex}`} 
                                                     className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        {item.icon}
                                                        <h3 className="text-2xl font-bold text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>{item.name}</h3>
                                                    </div>
                                                    <p className="text-base text-slate-600 mb-4 leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>{item.description}</p>
                                                    <div className="space-y-2">
                                                        {item.links.map((link, linkIndex) => (
                                                            <div key={`${link.path}-${linkIndex}`} className="group">
                                                                <Link 
                                                                    href={link.path} 
                                                                    className="flex items-center gap-2 text-slate-800 hover:text-emerald-600 transition-all duration-200 hover:translate-x-2"
                                                                    style={{fontFamily: 'Montserrat, sans-serif'}}
                                                                >
                                                                    {link.icon} 
                                                                    <span className="font-medium text-base">{link.name}</span>
                                                                    <i className="ion-ios-arrow-forward opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600"></i>
                                                                </Link>
                                                                {link.detail && (
                                                                    <p className="text-sm text-slate-600 ml-6 mt-1 leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                                        {link.detail}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <legend className="neumorphic-legend flex items-center gap-4 mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                            <span className="text-2xl bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                            {section.icon}
                                            <div>
                                                <h2 className="text-3xl font-bold">{section.name}</h2>
                                                <p className="text-slate-800 text-xl">{section.description}</p>
                                            </div>
                                        </legend>
                                        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                                            {section.links.map((link, linkIdx) => (
                                                <div key={`${link.path}-${linkIdx}`} 
                                                     className="group neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                                                    <Link 
                                                        href={link.path} 
                                                        className="flex items-center gap-3 text-xl font-semibold text-slate-800 hover:text-emerald-600 transition-all duration-200"
                                                        style={{fontFamily: 'Montserrat, sans-serif'}}
                                                    >
                                                        {link.icon} 
                                                        <span>{link.name}</span>
                                                        <i className="ion-ios-arrow-forward text-xl opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1 text-emerald-600"></i>
                                                    </Link>
                                                    <p className="text-base text-slate-600 pl-8 mt-2 leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>{link.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer com informações adicionais */}
                    <footer className="mt-16 pt-8 pb-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-rocket text-orange-500 text-3xl"></i>
                                Funcionalidades Principais do Sistema
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-base">
                                <div className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-target text-orange-500 text-2xl"></i>
                                        Operações Core
                                    </h4>
                                    <p className="text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Estacionamento automático, busca de veículos, OCR de placas e rastreamento em tempo real</p>
                                </div>
                                <div className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-analytics text-emerald-500 text-2xl"></i>
                                        Monitoramento
                                    </h4>
                                    <p className="text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Dashboard com métricas, ocupação, estatísticas operacionais e modais de detalhes</p>
                                </div>
                                <div className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-build text-purple-500 text-2xl"></i>
                                        Gestão Completa
                                    </h4>
                                    <p className="text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>CRUD completo para clientes, veículos, pátios, zonas e boxes com paginação</p>
                                </div>
                                <div className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-map text-blue-500 text-2xl"></i>
                                        Visualização
                                    </h4>
                                    <p className="text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Mapas 2D interativos, visualização de vagas em tempo real e interface responsiva</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 neumorphic-container p-6">
                                <h4 className="font-semibold text-slate-800 mb-3 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-stats text-emerald-500 text-2xl"></i>
                                    Estatísticas do Sistema
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-emerald-600" style={{fontFamily: 'Montserrat, sans-serif'}}>52</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Páginas Totais</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-blue-600" style={{fontFamily: 'Montserrat, sans-serif'}}>8</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Módulos Principais</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-purple-600" style={{fontFamily: 'Montserrat, sans-serif'}}>100%</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>CRUD Completo</div>
                                    </div>
                                    <div className="hover:scale-110 transition-transform duration-300">
                                        <div className="text-3xl font-bold text-orange-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Responsivo</div>
                                        <div className="text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Mobile + Desktop</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 neumorphic-container p-6">
                                <h4 className="font-semibold text-slate-800 mb-4 text-lg flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-mail text-pink-500 text-2xl"></i>
                                    Sistema de Contato Inteligente
                                </h4>
                                <div className="grid md:grid-cols-3 gap-4 text-center mb-6">
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-logo-google text-red-600 text-2xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 transition-colors duration-300 group-hover:text-red-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Gmail</h5>
                                        <p className="text-sm text-slate-600 transition-colors duration-300 group-hover:text-red-500" style={{fontFamily: 'Montserrat, sans-serif'}}>Abre diretamente no Gmail com mensagem pré-preenchida</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-ios-mail text-blue-600 text-2xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 transition-colors duration-300 group-hover:text-blue-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Outlook</h5>
                                        <p className="text-sm text-slate-600 transition-colors duration-300 group-hover:text-blue-500" style={{fontFamily: 'Montserrat, sans-serif'}}>Abre diretamente no Outlook com mensagem pré-preenchida</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 hover:-translate-y-1 cursor-pointer group">
                                        <i className="ion-ios-mail text-gray-600 text-2xl mb-2 transition-all duration-300 group-hover:scale-110"></i>
                                        <h5 className="font-semibold text-slate-800 mb-1 transition-colors duration-300 group-hover:text-gray-700" style={{fontFamily: 'Montserrat, sans-serif'}}>Email Genérico</h5>
                                        <p className="text-sm text-slate-600 transition-colors duration-300 group-hover:text-gray-700" style={{fontFamily: 'Montserrat, sans-serif'}}>Abre o cliente de email padrão do sistema</p>
                                    </div>
                                </div>
                                <p className="text-base text-slate-600 text-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <strong>Como funciona:</strong> Preencha o formulário, clique em "Validar Formulário" e escolha seu provedor de email preferido. 
                                    A mensagem será automaticamente redirecionada com assunto e corpo já preenchidos.
                                </p>
                            </div>

                            <div className="mt-8 neumorphic-container p-6">
                                <p className="text-lg text-slate-800 font-bold" style={{fontFamily: 'Montserrat, sans-serif'}}>CHALLENGE - NEXT/2025 - FIAP 2025</p>
                                <p className="text-base text-slate-600 mt-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Produzido e desenvolvido pela equipe <span className="font-semibold text-emerald-600">MetaMind Solutions</span>
                                </p>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>
        </>
    );
}
