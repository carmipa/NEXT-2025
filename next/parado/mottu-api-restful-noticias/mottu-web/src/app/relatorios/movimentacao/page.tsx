"use client";

import { useState, useEffect } from 'react';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface MovimentacaoItem {
    id: number;
    placa: string;
    tipo: string;
    dataHora: string;
    patio: string;
    box: string;
    status: string;
}

interface MovimentacaoStats {
    entradasHoje: number;
    saidasHoje: number;
    saldoLiquido: number;
}

export default function MovimentacaoPage() {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [tipoMovimentacao, setTipoMovimentacao] = useState('');
    const [dadosMovimentacao, setDadosMovimentacao] = useState<MovimentacaoItem[]>([]);
    const [stats, setStats] = useState<MovimentacaoStats>({ entradasHoje: 0, saidasHoje: 0, saldoLiquido: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

    // Carregar estatísticas ao montar o componente e atualizar automaticamente
    useEffect(() => {
        carregarEstatisticas();
        
        // Atualizar a cada 30 segundos para dados dinâmicos
        const interval = setInterval(() => {
            console.log('🔄 Atualizando dados de movimentação automaticamente...');
            carregarEstatisticas();
        }, 30000); // 30 segundos
        
        return () => clearInterval(interval);
    }, []);

    const carregarEstatisticas = async () => {
        try {
            setLoading(true);
            const hoje = new Date().toISOString().split('T')[0];
            
            // Buscar dados agregados
            const responseAgregados = await fetch(`/api/relatorios/movimentacao/diaria?dataInicio=${hoje}&dataFim=${hoje}`);
            
            // Buscar detalhes REAIS para a tabela
            const responseDetalhes = await fetch(`/api/relatorios/movimentacao/detalhes?dataInicio=${hoje}&dataFim=${hoje}`);
            
            if (responseAgregados.ok && responseDetalhes.ok) {
                const data = await responseAgregados.json();
                const detalhes = await responseDetalhes.json();
                console.log('Dados REAIS recebidos:', detalhes);
                
                // Processar dados agregados do backend
                if (data && data.length > 0) {
                    const dadosHoje = data[0];
                    setStats({
                        entradasHoje: dadosHoje.entradas || 0,
                        saidasHoje: dadosHoje.saidas || 0,
                        saldoLiquido: (dadosHoje.entradas || 0) - (dadosHoje.saidas || 0)
                    });
                }
                
                // Usar dados REAIS do banco
                const dadosReais = detalhes.map((item: any) => ({
                    id: item.id,
                    placa: item.placa || 'N/A',
                    tipo: item.tipo,
                    dataHora: item.dataHora,
                    patio: item.patio || 'N/A',
                    box: item.box || 'N/A',
                    status: item.status || 'Concluído'
                }));
                
                setDadosMovimentacao(dadosReais);
            } else {
                console.error('Erro ao carregar estatísticas:', responseAgregados.status);
                setDadosMovimentacao([]);
                setStats({
                    entradasHoje: 0,
                    saidasHoje: 0,
                    saldoLiquido: 0
                });
                setError('Erro ao carregar dados da API');
            }
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
            setDadosMovimentacao([]);
            setStats({
                entradasHoje: 0,
                saidasHoje: 0,
                saldoLiquido: 0
            });
            setError('Erro de conexão com o servidor');
        } finally {
            setLoading(false);
        }
    };


    const filtrarMovimentacao = async () => {
        if (!dataInicio || !dataFim) {
            alert('Por favor, selecione as datas de início e fim');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            // Buscar dados agregados para estatísticas
            const responseAgregados = await fetch(`/api/relatorios/movimentacao/diaria?dataInicio=${dataInicio}&dataFim=${dataFim}`);
            
            // Buscar detalhes completos REAIS para a tabela
            const responseDetalhes = await fetch(`/api/relatorios/movimentacao/detalhes?dataInicio=${dataInicio}&dataFim=${dataFim}`);
            
            if (responseDetalhes.ok) {
                const detalhes = await responseDetalhes.json();
                console.log('Dados REAIS recebidos:', detalhes);
                
                if (responseAgregados.ok) {
                    const data = await responseAgregados.json();
                    if (data && data.length > 0) {
                        const dadosHoje = data[0];
                        setStats({
                            entradasHoje: dadosHoje.entradas || 0,
                            saidasHoje: dadosHoje.saidas || 0,
                            saldoLiquido: (dadosHoje.entradas || 0) - (dadosHoje.saidas || 0)
                        });
                    }
                }
                
                // Usar dados REAIS do banco em vez de gerar fake
                const dadosReais = detalhes.map((item: any) => ({
                    id: item.id,
                    placa: item.placa || 'N/A',
                    tipo: item.tipo,
                    dataHora: item.dataHora,
                    patio: item.patio || 'N/A',
                    box: item.box || 'N/A',
                    status: item.status || 'Concluído'
                }));
                
                setDadosMovimentacao(dadosReais);
            } else {
                setError('Erro ao carregar detalhes de movimentação');
            }
        } catch (err) {
            console.error('Erro ao filtrar movimentação:', err);
            setError('Erro ao carregar movimentação');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (tipo: string) => {
        return tipo === 'Entrada' ? 'ion-ios-arrow-down text-green-500' : 'ion-ios-arrow-up text-red-500';
    };

    const getStatusColor = (tipo: string) => {
        return tipo === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    // Função para processar dados por hora
    const processarDadosPorHora = (dados: MovimentacaoItem[]) => {
        console.log('Processando dados por hora:', dados);
        
        if (!dados || dados.length === 0) {
            console.log('Nenhum dado disponível para processar por hora');
            return [];
        }
        
        const horasMap = new Map();
        
        // Inicializar todas as horas do dia (0-23)
        for (let i = 0; i < 24; i++) {
            horasMap.set(i, { hora: `${i.toString().padStart(2, '0')}:00`, entradas: 0, saidas: 0 });
        }
        
        // Processar dados
        dados.forEach(item => {
            try {
                const dataHora = new Date(item.dataHora);
                if (isNaN(dataHora.getTime())) {
                    console.warn('Data inválida:', item.dataHora);
                    return;
                }
                
                const hora = dataHora.getHours();
                const horaData = horasMap.get(hora);
                
                if (horaData) {
                    if (item.tipo === 'Entrada' || item.tipo === 'ENTRADA') {
                        horaData.entradas++;
                    } else if (item.tipo === 'Saída' || item.tipo === 'SAÍDA' || item.tipo === 'SAIDA') {
                        horaData.saidas++;
                    }
                }
            } catch (error) {
                console.error('Erro ao processar item:', item, error);
            }
        });
        
        const resultado = Array.from(horasMap.values());
        console.log('Resultado processamento por hora:', resultado);
        return resultado;
    };

    // Função para processar dados por tipo
    const processarDadosPorTipo = (dados: MovimentacaoItem[]) => {
        console.log('Processando dados por tipo:', dados);
        
        if (!dados || dados.length === 0) {
            console.log('Nenhum dado disponível');
            return [
                { name: 'Entradas', value: 0, color: '#22c55e' },
                { name: 'Saídas', value: 0, color: '#ef4444' }
            ];
        }
        
        const entradas = dados.filter(item => item.tipo === 'Entrada' || item.tipo === 'ENTRADA').length;
        const saidas = dados.filter(item => item.tipo === 'Saída' || item.tipo === 'SAÍDA' || item.tipo === 'SAIDA').length;
        
        console.log('Entradas encontradas:', entradas);
        console.log('Saídas encontradas:', saidas);
        
        const resultado = [
            { name: 'Entradas', value: entradas, color: '#22c55e' },
            { name: 'Saídas', value: saidas, color: '#ef4444' }
        ];
        
        console.log('Resultado processamento:', resultado);
        return resultado;
    };

    return (
        <div className="min-h-screen bg-black relative">
            <ParticleBackground />
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center">
                            <a 
                                href="/relatorios" 
                                className="mr-2 lg:mr-4 p-2 text-gray-600 hover:text-green-500 rounded-lg transition-colors"
                                title="Voltar para Início"
                            >
                                <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                            </a>
                            <div>
                                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-swap text-green-500 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                                    Movimentação
                                </h1>
                                <p className="text-gray-600 text-sm lg:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Relatório de entrada e saída de veículos
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 mb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                    Tempo Real
                                </span>
                            </div>
                            <div className="text-xl lg:text-2xl font-bold text-green-600">{stats.entradasHoje + stats.saidasHoje}</div>
                            <div className="text-xs lg:text-sm text-gray-600">Movimentações Hoje</div>
                            {ultimaAtualizacao && (
                                <div className="text-xs text-blue-600 mt-1">
                                    🔄 Atualizado: {ultimaAtualizacao.toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                            <select
                                value={tipoMovimentacao}
                                onChange={(e) => setTipoMovimentacao(e.target.value)}
                                className="neumorphic-select"
                            >
                                <option value="">Todos os Tipos</option>
                                <option value="entrada">Entrada</option>
                                <option value="saida">Saída</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={filtrarMovimentacao}
                                disabled={loading}
                                className="neumorphic-button-green w-full"
                            >
                                {loading ? (
                                    <>
                                        <i className="ion-ios-refresh mr-2 animate-spin"></i>
                                        Carregando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ion-ios-search mr-2"></i>
                                        Filtrar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <i className="ion-ios-warning text-red-500 mr-2"></i>
                            <span className="text-red-700">{error}</span>
                        </div>
                    </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
                    <div className="neumorphic-container p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                                <i className="ion-ios-arrow-down text-green-500 text-lg lg:text-xl"></i>
                            </div>
                            <div>
                                <div className="text-xl lg:text-2xl font-bold text-gray-800">
                                    {loading ? '...' : stats.entradasHoje}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-500">Entradas Hoje</div>
                            </div>
                        </div>
                    </div>
                    <div className="neumorphic-container p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                                <i className="ion-ios-arrow-up text-red-500 text-lg lg:text-xl"></i>
                            </div>
                            <div>
                                <div className="text-xl lg:text-2xl font-bold text-gray-800">
                                    {loading ? '...' : stats.saidasHoje}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-500">Saídas Hoje</div>
                            </div>
                        </div>
                    </div>
                    <div className="neumorphic-container p-4 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                                <i className="ion-ios-pulse text-blue-500 text-lg lg:text-xl"></i>
                            </div>
                            <div>
                                <div className={`text-xl lg:text-2xl font-bold ${stats.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {loading ? '...' : stats.saldoLiquido}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-500">Saldo Líquido</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráficos de Movimentação */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Gráfico de Linha - Movimentação por Hora */}
                    <div className="neumorphic-container">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Movimentação por Hora
                        </h3>
                        <div className="h-64">
                            {dadosMovimentacao.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={processarDadosPorHora(dadosMovimentacao)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hora" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="entradas" stroke="#22c55e" strokeWidth={2} name="Entradas" />
                                        <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} name="Saídas" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <i className="ion-ios-analytics text-4xl mb-2"></i>
                                        <p>Nenhum dado disponível</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gráfico de Pizza - Distribuição de Tipos */}
                    <div className="neumorphic-container">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Distribuição de Movimentações
                        </h3>
                        <div className="h-64">
                            {dadosMovimentacao.length > 0 ? (() => {
                                const dadosProcessados = processarDadosPorTipo(dadosMovimentacao);
                                console.log('Dados processados para gráfico:', dadosProcessados);
                                
                                // Verificar se há dados válidos
                                const temDados = dadosProcessados.some(item => item.value > 0);
                                
                                if (!temDados) {
                                    return (
                                        <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <i className="ion-ios-pie text-4xl mb-2"></i>
                                                <p>Nenhuma movimentação encontrada</p>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dadosProcessados}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {dadosProcessados.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                );
                            })() : (
                                <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <i className="ion-ios-pie text-4xl mb-2"></i>
                                        <p>Nenhum dado disponível</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabela de Movimentações */}
                <div className="neumorphic-container overflow-hidden">
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
                                {dadosMovimentacao.length > 0 ? (
                                    dadosMovimentacao.map((item, index) => (
                                        <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
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
                                    ))
                                ) : (
                                    <tr key="no-data">
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <i className="ion-ios-refresh animate-spin mr-2"></i>
                                                    Carregando dados...
                                                </div>
                                            ) : error ? (
                                                <div>
                                                    <i className="ion-ios-warning text-2xl mb-2 text-red-500"></i>
                                                    <p className="text-red-600">{error}</p>
                                                    <p className="text-sm mt-1">Verifique se a API está rodando</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <i className="ion-ios-information-circle text-2xl mb-2"></i>
                                                    <p>Nenhuma movimentação encontrada para o período selecionado.</p>
                                                    <p className="text-sm">Selecione as datas e clique em "Filtrar"</p>
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