"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function RelatoriosPage() {
    const [activeTab, setActiveTab] = useState('geral');

    const relatorios = [
        {
            id: 'ocupacao-diaria',
            title: 'Ocupação Diária',
            description: 'Relatório de ocupação das vagas por dia',
            icon: 'ion-ios-calendar',
            href: '/relatorios/ocupacao-diaria',
            color: 'bg-blue-500'
        },
        {
            id: 'movimentacao',
            title: 'Movimentação',
            description: 'Relatório de entrada e saída de veículos',
            icon: 'ion-ios-swap',
            href: '/relatorios/movimentacao',
            color: 'bg-green-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-analytics text-blue-500 mr-3"></i>
                        Relatórios
                    </h1>
                    <p className="text-gray-600" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Acesse os relatórios do sistema Mottu
                    </p>
                </div>

                {/* Relatórios Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatorios.map((relatorio) => (
                        <Link
                            key={relatorio.id}
                            href={relatorio.href}
                            className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <div className="flex items-center mb-4">
                                <div className={`w-12 h-12 ${relatorio.color} rounded-lg flex items-center justify-center mr-4`}>
                                    <i className={`${relatorio.icon} text-white text-xl`}></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        {relatorio.title}
                                    </h3>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                {relatorio.description}
                            </p>
                            <div className="flex items-center text-blue-500 font-medium group-hover:text-blue-700 transition-colors">
                                <span>Acessar Relatório</span>
                                <i className="ion-ios-arrow-forward ml-2"></i>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Informações Adicionais */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-information-circle mr-2"></i>
                        Sobre os Relatórios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                            <strong>Ocupação Diária:</strong> Visualize a ocupação das vagas por dia, com gráficos e estatísticas detalhadas.
                        </div>
                        <div>
                            <strong>Movimentação:</strong> Acompanhe todas as entradas e saídas de veículos no sistema.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}