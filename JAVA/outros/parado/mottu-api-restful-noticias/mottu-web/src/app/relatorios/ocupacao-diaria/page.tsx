"use client";

import { useState, useEffect } from 'react';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface OcupacaoDia {
    data: string;
    totalVagas: number;
    ocupadas: number;
    livres: number;
    percentual: number;
}

interface OcupacaoAtual {
    patioId: number;
    nomePatio: string;
    totalBoxes: number;
    boxesOcupados: number;
    boxesLivres: number;
    taxaOcupacao: number;
}

export default function OcupacaoDiariaPage() {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [patio, setPatio] = useState('');
    const [dadosOcupacao, setDadosOcupacao] = useState<OcupacaoDia[]>([]);
    const [ocupacaoAtual, setOcupacaoAtual] = useState<OcupacaoAtual[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Carregar ocupação atual ao montar o componente
    useEffect(() => {
        carregarOcupacaoAtual();
        
        // Definir data atual automaticamente
        const hoje = new Date();
        const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        
        setDataInicio(dataInicio.toISOString().split('T')[0]);
        setDataFim(dataFim.toISOString().split('T')[0]);
        
        // Carregar dados automaticamente
        setTimeout(() => {
            gerarRelatorio();
        }, 500);
    }, []);

    const carregarOcupacaoAtual = async () => {
        try {
            setLoading(true);
            // Usar cache otimizado para relatórios
            const { RelatoriosApi } = await import('@/utils/api/relatorios');
            const data = await RelatoriosApi.getOcupacaoAtual();
            setOcupacaoAtual(data);
        } catch (err) {
            console.error('Erro ao carregar ocupação atual:', err);
            setError('Erro ao carregar dados de ocupação');
        } finally {
            setLoading(false);
        }
    };

    const gerarRelatorio = async () => {
        // Se não há datas definidas, usar data atual
        let dataInicioFinal = dataInicio;
        let dataFimFinal = dataFim;
        
        if (!dataInicio || !dataFim) {
            const hoje = new Date();
            dataInicioFinal = hoje.toISOString().split('T')[0];
            dataFimFinal = hoje.toISOString().split('T')[0];
            setDataInicio(dataInicioFinal);
            setDataFim(dataFimFinal);
        }

        try {
            setLoading(true);
            setError('');
            
            // Usar cache otimizado para relatórios
            const { RelatoriosApi } = await import('@/utils/api/relatorios');
            const data = await RelatoriosApi.getOcupacaoDiaria(dataInicioFinal, dataFimFinal);
            
            // Processar dados para o formato esperado pelo gráfico
            const dadosProcessados = data.map((item: any) => ({
                data: item.data,
                totalVagas: item.ocupados + item.livres,
                ocupadas: item.ocupados,
                livres: item.livres,
                percentual: item.ocupados > 0 ? Math.round((item.ocupados / (item.ocupados + item.livres)) * 100) : 0
            }));
            setDadosOcupacao(dadosProcessados);
            
        } catch (err) {
            console.error('Erro ao gerar relatório:', err);
            setError('Erro de conexão com o servidor. Verifique se a API está rodando.');
            setDadosOcupacao([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black relative">
            <ParticleBackground />
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <a 
                                href="/relatorios" 
                                className="mr-3 lg:mr-4 p-2 text-gray-600 hover:text-blue-500 rounded-lg transition-colors"
                                title="Voltar para Início"
                            >
                                <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                            </a>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-calendar text-blue-500 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                                    Ocupação Diária
                                </h1>
                                <p className="text-gray-600 text-sm lg:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Relatório de ocupação das vagas por dia
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            {loading ? (
                                <div className="flex items-center text-gray-600 text-sm lg:text-base">
                                    <i className="ion-ios-refresh animate-spin mr-2"></i>
                                    <span className="hidden sm:inline">Carregando dados...</span>
                                    <span className="sm:hidden">Carregando...</span>
                                </div>
                            ) : ocupacaoAtual.length > 0 ? (
                                <div>
                                    <div className="text-xl lg:text-2xl font-bold text-blue-600">
                                        {Math.round(ocupacaoAtual.reduce((acc, patio) => acc + patio.taxaOcupacao, 0) / ocupacaoAtual.length)}%
                                    </div>
                                    <div className="text-xs lg:text-sm text-gray-600">Ocupação Média</div>
                                    <div className="text-xs text-green-600 mt-1 hidden sm:block">
                                        <i className="ion-ios-checkmark mr-1"></i>
                                        Dados atualizados automaticamente
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-600 text-sm lg:text-base">N/A</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ocupação Atual por Pátio */}
                {ocupacaoAtual.length > 0 && (
                    <div className="neumorphic-container mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-pulse text-green-600 mr-2"></i>
                            Ocupação Atual por Pátio
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {ocupacaoAtual.map((patio) => (
                                <div key={patio.patioId} className="neumorphic-container p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-800 text-sm lg:text-base truncate">{patio.nomePatio}</h4>
                                        <span className="text-sm font-bold text-blue-600">{patio.taxaOcupacao.toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs lg:text-sm text-gray-600 space-y-1">
                                        <div>Total: {patio.totalBoxes} boxes</div>
                                        <div className="flex justify-between">
                                            <span className="text-red-600">Ocupados: {patio.boxesOcupados}</span>
                                            <span className="text-green-600">Livres: {patio.boxesLivres}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                            style={{width: `${patio.taxaOcupacao}%`}}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mensagem de Erro */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <i className="ion-ios-warning text-red-500 mr-2"></i>
                            <span className="text-red-700">{error}</span>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="neumorphic-container mb-6 lg:mb-8">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Filtros
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="neumorphic-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                            <input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="neumorphic-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pátio</label>
                            <select
                                value={patio}
                                onChange={(e) => setPatio(e.target.value)}
                                className="neumorphic-select"
                            >
                                <option value="">Todos os Pátios</option>
                                <option value="guarulhos">Guarulhos</option>
                                <option value="limao">Limão</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={gerarRelatorio}
                                disabled={loading}
                                className="neumorphic-button-green w-full"
                            >
                                {loading ? (
                                    <>
                                        <i className="ion-ios-refresh mr-2 animate-spin"></i>
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ion-ios-search mr-2"></i>
                                        Gerar Relatório
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Ocupação */}
                <div className="neumorphic-container mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Gráfico de Ocupação
                    </h3>
                    <div className="h-80">
                        {dadosOcupacao.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dadosOcupacao}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="data" 
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                                        formatter={(value, name) => [value, name === 'ocupadas' ? 'Ocupadas' : name === 'livres' ? 'Livres' : 'Total']}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="ocupadas" 
                                        stroke="#ef4444" 
                                        strokeWidth={2}
                                        name="Ocupadas"
                                        dot={{ r: 4 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="livres" 
                                        stroke="#22c55e" 
                                        strokeWidth={2}
                                        name="Livres"
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <i className="ion-ios-analytics text-4xl mb-2"></i>
                                    <p>Nenhum dado disponível para exibir o gráfico</p>
                                    <p className="text-sm mt-1">Selecione um período e clique em "Gerar Relatório"</p>
                                    {error && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-600 text-sm">{error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabela de Dados */}
                <div className="neumorphic-container overflow-hidden">
                    <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Dados de Ocupação
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vagas</th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupadas</th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livres</th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Ocupação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dadosOcupacao.length > 0 ? (
                                    dadosOcupacao.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(item.data).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.totalVagas}
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                {item.ocupadas}
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {item.livres}
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <i className="ion-ios-refresh animate-spin mr-2"></i>
                                                    Carregando dados...
                                                </div>
                                            ) : (
                                                <div>
                                                    <i className="ion-ios-information-circle text-2xl mb-2"></i>
                                                    <p>Nenhum dado encontrado para o período selecionado.</p>
                                                    <p className="text-sm">Selecione as datas e clique em "Gerar Relatório"</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}