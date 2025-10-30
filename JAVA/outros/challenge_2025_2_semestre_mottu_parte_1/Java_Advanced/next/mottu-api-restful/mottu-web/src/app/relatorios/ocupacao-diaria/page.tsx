"use client";

import { useState } from 'react';

export default function OcupacaoDiariaPage() {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [patio, setPatio] = useState('');

    const dadosOcupacao = [
        { data: '2025-01-21', totalVagas: 100, ocupadas: 75, livres: 25, percentual: 75 },
        { data: '2025-01-20', totalVagas: 100, ocupadas: 80, livres: 20, percentual: 80 },
        { data: '2025-01-19', totalVagas: 100, ocupadas: 65, livres: 35, percentual: 65 },
        { data: '2025-01-18', totalVagas: 100, ocupadas: 70, livres: 30, percentual: 70 },
        { data: '2025-01-17', totalVagas: 100, ocupadas: 85, livres: 15, percentual: 85 }
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-calendar text-blue-500 mr-3"></i>
                                Ocupação Diária
                            </h1>
                            <p className="text-gray-600" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Relatório de ocupação das vagas por dia
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">75%</div>
                            <div className="text-sm text-gray-500">Ocupação Média</div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Filtros
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                            <input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pátio</label>
                            <select
                                value={patio}
                                onChange={(e) => setPatio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todos os Pátios</option>
                                <option value="guarulhos">Guarulhos</option>
                                <option value="limao">Limão</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                <i className="ion-ios-search mr-2"></i>
                                Gerar Relatório
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Ocupação */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Gráfico de Ocupação
                    </h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <i className="ion-ios-analytics text-4xl mb-2"></i>
                            <p>Gráfico será implementado aqui</p>
                        </div>
                    </div>
                </div>

                {/* Tabela de Dados */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Dados de Ocupação
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vagas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupadas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livres</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Ocupação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dadosOcupacao.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {new Date(item.data).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.totalVagas}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                            {item.ocupadas}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            {item.livres}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{width: `${item.percentual}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{item.percentual}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}