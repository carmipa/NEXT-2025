"use client";

import { useState } from 'react';

export default function MovimentacaoPage() {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [tipoMovimentacao, setTipoMovimentacao] = useState('');

    const dadosMovimentacao = [
        {
            id: 1,
            placa: 'ABC1234',
            tipo: 'Entrada',
            dataHora: '2025-01-21 08:30:00',
            patio: 'Guarulhos',
            box: 'Gru001',
            status: 'success'
        },
        {
            id: 2,
            placa: 'XYZ9876',
            tipo: 'Saída',
            dataHora: '2025-01-21 09:15:00',
            patio: 'Guarulhos',
            box: 'Gru002',
            status: 'success'
        },
        {
            id: 3,
            placa: 'DEF5678',
            tipo: 'Entrada',
            dataHora: '2025-01-21 10:45:00',
            patio: 'Limão',
            box: 'BLimao001',
            status: 'success'
        },
        {
            id: 4,
            placa: 'GHI9012',
            tipo: 'Saída',
            dataHora: '2025-01-21 11:20:00',
            patio: 'Limão',
            box: 'BLimao002',
            status: 'success'
        },
        {
            id: 5,
            placa: 'JKL3456',
            tipo: 'Entrada',
            dataHora: '2025-01-21 12:00:00',
            patio: 'Guarulhos',
            box: 'Gru003',
            status: 'success'
        }
    ];

    const getStatusIcon = (tipo: string) => {
        return tipo === 'Entrada' ? 'ion-ios-arrow-down text-green-500' : 'ion-ios-arrow-up text-red-500';
    };

    const getStatusColor = (tipo: string) => {
        return tipo === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-swap text-green-500 mr-3"></i>
                                Movimentação
                            </h1>
                            <p className="text-gray-600" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Relatório de entrada e saída de veículos
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">5</div>
                            <div className="text-sm text-gray-500">Movimentações Hoje</div>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                            <input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                            <select
                                value={tipoMovimentacao}
                                onChange={(e) => setTipoMovimentacao(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Todos os Tipos</option>
                                <option value="entrada">Entrada</option>
                                <option value="saida">Saída</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                <i className="ion-ios-search mr-2"></i>
                                Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <i className="ion-ios-arrow-down text-green-500 text-xl"></i>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">3</div>
                                <div className="text-sm text-gray-500">Entradas Hoje</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                                <i className="ion-ios-arrow-up text-red-500 text-xl"></i>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">2</div>
                                <div className="text-sm text-gray-500">Saídas Hoje</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <i className="ion-ios-pulse text-blue-500 text-xl"></i>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">1</div>
                                <div className="text-sm text-gray-500">Saldo Líquido</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Movimentações */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Movimentações Recentes
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pátio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dadosMovimentacao.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.placa}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.tipo)}`}>
                                                <i className={`${getStatusIcon(item.tipo)} mr-1`}></i>
                                                {item.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.dataHora).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.patio}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.box}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <i className="ion-ios-checkmark-circle mr-1"></i>
                                                Concluído
                                            </span>
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