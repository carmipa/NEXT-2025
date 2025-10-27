"use client";

import Link from 'next/link';
import ParticleBackground from '@/components/particula/ParticleBackground';

export default function RelatoriosPage() {

    const relatorios = [
        {
            id: 'ocupacao-diaria',
            title: 'Ocupação Diária',
            description: 'Relatório de ocupação das vagas por dia com dados reais do sistema',
            icon: 'ion-ios-calendar',
            href: '/relatorios/ocupacao-diaria',
            color: 'bg-blue-500',
            status: 'ativo'
        },
        {
            id: 'movimentacao',
            title: 'Movimentação',
            description: 'Relatório de entrada e saída de veículos em tempo real',
            icon: 'ion-ios-swap',
            href: '/relatorios/movimentacao',
            color: 'bg-green-500',
            status: 'ativo'
        },
        {
            id: 'heatmap',
            title: 'Heatmap de Ocupação',
            description: 'Visualização geográfica da ocupação em tempo real',
            icon: 'ion-ios-map',
            href: '/relatorios/heatmap',
            color: 'bg-red-500',
            status: 'novo'
        },
        {
            id: 'comportamental',
            title: 'Análise Comportamental',
            description: 'Padrões de uso e comportamento dos usuários',
            icon: 'ion-ios-people',
            href: '/relatorios/comportamental',
            color: 'bg-indigo-500',
            status: 'novo'
        },
        {
            id: 'dashboard-ia',
            title: 'Dashboard IA',
            description: 'Analytics inteligente e previsões baseadas em IA',
            icon: 'ion-ios-analytics',
            href: '/relatorios/dashboard-ia',
            color: 'bg-purple-500',
            status: 'novo'
        },
        {
            id: 'avancados',
            title: 'Relatórios Avançados',
            description: 'Relatórios técnicos e análises detalhadas',
            icon: 'ion-ios-flash',
            href: '/relatorios/avancados',
            color: 'bg-yellow-500',
            status: 'novo'
        },
        {
            id: 'notificacoes',
            title: 'Central de Notificações',
            description: 'Sistema inteligente de alertas e notificações',
            icon: 'ion-ios-notifications',
            href: '/relatorios/notificacoes',
            color: 'bg-orange-500',
            status: 'novo'
        }
    ];

    return (
        <div className="min-h-screen bg-black relative">
            <ParticleBackground />
            <div className="relative z-10 p-6">
                <div className="max-w-6xl mx-auto">
        {/* Header */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center mb-6 md:mb-0">
                                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-6">
                                    <i className="ion-ios-analytics text-white text-3xl"></i>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Relatórios
                                    </h1>
                                    <p className="text-gray-300 text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Acesse os relatórios do sistema Mottu
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Relatórios Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                        {relatorios.map((relatorio) => (
                            <Link key={relatorio.id} href={relatorio.href}>
                                <div className="neumorphic-container hover:scale-105 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`${relatorio.color} p-2 lg:p-3 rounded-lg`}>
                                            <i className={`${relatorio.icon} text-white text-xl lg:text-2xl`}></i>
                                        </div>
                                        {relatorio.status === 'novo' && (
                                            <span className="bg-emerald-500 text-white text-xs font-bold px-2 lg:px-3 py-1 rounded-full animate-pulse shadow-lg">
                                                NOVO
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                                        {relatorio.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs lg:text-sm mb-4 flex-grow">
                                        {relatorio.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-emerald-600 text-xs lg:text-sm font-medium group-hover:text-emerald-500 transition-colors">
                                            Acessar Relatório
                                        </span>
                                        <i className="ion-ios-arrow-forward text-emerald-600 group-hover:translate-x-1 transition-transform"></i>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
          
                    {/* Sobre os Relatórios */}
                    <div className="neumorphic-container mt-6 lg:mt-8">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-information-circle text-blue-600 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                            Sobre os Relatórios
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                            <div className="flex items-start">
                                <i className="ion-ios-checkmark-circle text-green-600 mr-2 lg:mr-3 mt-1 text-sm lg:text-base"></i>
                                <div>
                                    <strong className="text-sm lg:text-base">Dados em Tempo Real:</strong> 
                                    <span className="text-xs lg:text-sm text-gray-600 block mt-1">
                                        Todos os relatórios são atualizados automaticamente com dados do banco de dados.
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <i className="ion-ios-flash text-orange-600 mr-2 lg:mr-3 mt-1 text-sm lg:text-base"></i>
                                <div>
                                    <strong className="text-sm lg:text-base">Performance Otimizada:</strong> 
                                    <span className="text-xs lg:text-sm text-gray-600 block mt-1">
                                        Navegação rápida entre páginas para melhor experiência do usuário.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
          </div>
            </div>
    </div>
  );
}