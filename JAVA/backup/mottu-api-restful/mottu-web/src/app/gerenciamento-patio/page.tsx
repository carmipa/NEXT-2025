"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { PatioService, ZonaService, BoxService } from '@/utils/api';

export default function GerenciamentoPatioPage() {
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState<string>('--:--:--');
    const [metrics, setMetrics] = useState({
        totalPatios: 0,
        totalZonas: 0,
        totalBoxes: 0,
        boxesOcupados: 0,
        taxaOcupacao: 0,
    });

    useEffect(() => {
        let alive = true;
        const POLLING_MS = 3000;

        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const [patiosPage, zonasPage, boxesPage, boxesOcupPage] = await Promise.all([
                    PatioService.listarPaginadoFiltrado({}, 0, 1),
                    ZonaService.listarPaginadoFiltrado({}, 0, 1),
                    BoxService.listarPaginadoFiltrado({}, 0, 1),
                    BoxService.listarPaginadoFiltrado({ status: 'O' } as any, 0, 1),
                ]);

                const totalPatios = (patiosPage as any).totalElements ?? patiosPage.content.length;
                const totalZonas = (zonasPage as any).totalElements ?? zonasPage.content.length;
                const totalBoxes = (boxesPage as any).totalElements ?? boxesPage.content.length;
                const boxesOcupados = (boxesOcupPage as any).totalElements ?? boxesOcupPage.content.length;
                const taxaOcupacao = totalBoxes > 0 ? Number(((boxesOcupados / totalBoxes) * 100).toFixed(1)) : 0;

                if (alive) {
                    setMetrics({ totalPatios, totalZonas, totalBoxes, boxesOcupados, taxaOcupacao });
                    setLastSync(new Date().toLocaleTimeString('pt-BR'));
                }
            } catch (e) {
                // mantém últimos valores em caso de erro
            } finally {
                if (alive) setLoading(false);
            }
        };

        // Set initial time on client mount
        if (typeof window !== 'undefined') {
            setLastSync(new Date().toLocaleTimeString('pt-BR'));
        }

        fetchMetrics();
        const t = setInterval(fetchMetrics, POLLING_MS);
        return () => { alive = false; clearInterval(t); };
    }, []);

    const menuItems = [
        {
            id: 'patios',
            title: 'Pátios',
            description: 'Gerenciar pátios do sistema',
            icon: 'ion-ios-home',
            href: '/gerenciamento-patio/patio',
            color: 'bg-blue-500',
            status: 'ativo'
        },
        {
            id: 'zonas',
            title: 'Zonas',
            description: 'Configurar zonas dos pátios',
            icon: 'ion-ios-grid',
            href: '/gerenciamento-patio/zona',
            color: 'bg-green-500',
            status: 'ativo'
        },
        {
            id: 'boxes',
            title: 'Boxes',
            description: 'Gerenciar boxes das zonas',
            icon: 'ion-ios-square',
            href: '/gerenciamento-patio/box',
            color: 'bg-orange-500',
            status: 'ativo'
        }
    ];

    const quickStats = [
        {
            title: 'Pátios Ativos',
            value: metrics.totalPatios,
            icon: 'ion-ios-business',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        },
        {
            title: 'Zonas Configuradas',
            value: metrics.totalZonas,
            icon: 'ion-ios-map',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        },
        {
            title: 'Boxes Disponíveis',
            value: metrics.totalBoxes,
            icon: 'ion-ios-grid',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/20'
        },
        {
            title: 'Taxa de Ocupação',
            value: `${metrics.taxaOcupacao}%`,
            icon: 'ion-ios-pulse',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20'
        }
    ];

    return (
        <div className="min-h-screen bg-black relative">
            <ParticleBackground />
            <div className="relative z-10 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 lg:p-8 mb-8 border border-white/20">
                        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center mb-4 lg:mb-0">
                                <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 lg:mr-6">
                                    <i className="ion-ios-business text-white text-2xl lg:text-3xl"></i>
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Gerenciamento de Pátios
                                    </h1>
                                    <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Dashboard executivo e controle operacional completo
                                    </p>
                                </div>
                            </div>
                            
                            {/* Botão Novo Pátio */}
                            <Link
                                href="/patio/novo-assistente"
                                className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 lg:py-4 px-4 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400 hover:border-red-300 w-full lg:w-auto"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                                    <i className="ion-ios-add text-red-600 text-xs lg:text-sm"></i>
                                </div>
                                <div className="relative flex items-center gap-2 lg:gap-3">
                                    <div className="p-1.5 lg:p-2 bg-white/25 rounded-full">
                                        <i className="ion-ios-add text-lg lg:text-xl"></i>
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="text-sm lg:text-lg font-black">NOVO PÁTIO</div>
                                        <div className="text-xs text-red-100 font-semibold hidden lg:block">Criar novo pátio</div>
                                    </div>
                                    <i className="ion-ios-arrow-forward text-sm lg:text-lg group-hover:translate-x-1.5 transition-transform duration-300"></i>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
                        {quickStats.map((stat, index) => (
                            <div key={index} className="neumorphic-container p-4">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 lg:p-3 rounded-lg ${stat.bgColor}`}>
                                        <i className={`${stat.icon} ${stat.color} text-lg lg:text-2xl`}></i>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg lg:text-2xl font-bold text-gray-800">{loading ? '...' : stat.value}</div>
                                        <div className="text-xs lg:text-sm text-gray-600">{stat.title}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Menu Principal */}
                    <div className="neumorphic-container mb-8">
                        <div className="text-center mb-6 lg:mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-settings text-blue-600 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                                Menu de Gerenciamento
                            </h2>
                            <p className="text-gray-600 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Acesse as funcionalidades do sistema
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {menuItems.map((item) => (
                                <Link key={item.id} href={item.href}>
                                    <div className="group neumorphic-container p-4 lg:p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`${item.color} p-3 lg:p-4 rounded-xl shadow-lg`}>
                                                <i className={`${item.icon} text-white text-lg lg:text-2xl`}></i>
                                            </div>
                                            {item.status === 'novo' && (
                                                <span className="bg-emerald-500 text-white text-xs font-bold px-2 lg:px-3 py-1 rounded-full animate-pulse shadow-lg">
                                                    NOVO
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base lg:text-xl font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-xs lg:text-sm mb-4">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-emerald-600 text-xs lg:text-sm font-medium group-hover:text-emerald-500 transition-colors">
                                                Acessar
                                            </span>
                                            <i className="ion-ios-arrow-forward text-emerald-600 group-hover:translate-x-1 transition-transform"></i>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                        
                    {/* Footer com Informações do Sistema */}
                    <div className="neumorphic-container">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <i className="ion-ios-flash text-emerald-600 text-xl"></i>
                            <span className="text-sm font-medium text-emerald-600" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Sistema Atualizado
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm text-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Dados atualizados em tempo real • Última sincronização: {lastSync}
                        </p>
                    </div>
                </div>
            </div>
    </div>
    );
}