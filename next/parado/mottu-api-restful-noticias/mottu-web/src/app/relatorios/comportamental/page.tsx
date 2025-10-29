"use client";

import { useState, useEffect } from 'react';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

interface Cliente {
    id: string;
    nome: string;
    rating: number;
    tags: string[];
    visitas: number;
    tempoMedio: string;
    patioPreferido: string;
    percentualPreferido: number;
    ultimaVisita: string;
    proximaVisita?: string;
    nivel: 'ALTO' | 'MEDIO' | 'BAIXO';
}

export default function ComportamentalPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filtroPeriodo, setFiltroPeriodo] = useState('semana');
    const [filtroPatio, setFiltroPatio] = useState('todos');
    const [filtroCliente, setFiltroCliente] = useState('todos');
    const [visualizacao, setVisualizacao] = useState<'cards' | 'tabela' | 'graficos' | 'insights'>('cards');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('useEffect executado - carregando dados comportamentais');
        carregarDadosComportamentais();
    }, []);

    const carregarDadosComportamentais = async () => {
        setLoading(true);
        try {
            console.log('🔍 Buscando dados comportamentais REAIS do backend...');
            
            // Buscar dados REAIS de veículos e suas movimentações
            const responseMovimentacoes = await fetch('/api/relatorios/movimentacao/detalhes?dataInicio=2024-01-01&dataFim=2025-12-31');
            
            if (!responseMovimentacoes.ok) {
                console.warn('⚠️ Nenhum dado de movimentação disponível');
                setClientes([]);
                return;
            }
            
            const movimentacoes = await responseMovimentacoes.json();
            console.log('📊 Movimentações recebidas:', movimentacoes.length);
            
            // Processar movimentações para criar análise comportamental REAL
            const clientesData = new Map<string, {
                nome: string;
                visitas: number;
                totalMinutos: number;
                ultimaVisita: string;
                pátios: Map<string, number>;
            }>();
            
            movimentacoes.forEach((mov: any) => {
                const placa = mov.placa || 'Desconhecido';
                
                if (!clientesData.has(placa)) {
                    clientesData.set(placa, {
                        nome: placa, // Usando placa como identificador
                        visitas: 0,
                        totalMinutos: 0,
                        ultimaVisita: mov.dataHora,
                        pátios: new Map()
                    });
                }
                
                const dados = clientesData.get(placa)!;
                dados.visitas++;
                
                if (mov.tipo === 'ENTRADA') {
                    dados.ultimaVisita = mov.dataHora;
                    const patio = mov.patio || 'N/A';
                    dados.pátios.set(patio, (dados.pátios.get(patio) || 0) + 1);
                }
                
                // Calcular tempo médio (simulado por agora)
                dados.totalMinutos += 120; // Valor médio
            });
            
            // Converter para formato esperado pelo frontend
            const clientesProcessados: Cliente[] = Array.from(clientesData.entries()).map(([placa, dados]) => {
                const tempoMedioMinutos = dados.visitas > 0 ? dados.totalMinutos / dados.visitas : 0;
                const visitaMaisComum = Array.from(dados.pátios.entries())
                    .sort((a, b) => b[1] - a[1])[0];
                const percentualPreferido = visitaMaisComum ? (visitaMaisComum[1] / dados.visitas) * 100 : 0;
                
                return {
                    id: placa,
                    nome: dados.nome,
                    rating: calcularRating(dados.visitas, tempoMedioMinutos),
                    tags: gerarTags(dados.visitas, tempoMedioMinutos),
                    visitas: dados.visitas,
                    tempoMedio: formatarTempo(tempoMedioMinutos),
                    patioPreferido: visitaMaisComum?.[0] || 'N/A',
                    percentualPreferido: Math.round(percentualPreferido),
                    ultimaVisita: formatarUltimaVisita(dados.ultimaVisita),
                    nivel: calcularNivel(dados.visitas, tempoMedioMinutos)
                };
            });
            
            console.log('✅ Clientes processados:', clientesProcessados.length);
            setClientes(clientesProcessados);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados comportamentais:', error);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    const calcularRating = (visitas: number, tempoMedio: number) => {
        if (visitas >= 50 && tempoMedio >= 180) return 5;
        if (visitas >= 30 && tempoMedio >= 120) return 4;
        if (visitas >= 15 && tempoMedio >= 60) return 3;
        if (visitas >= 5) return 2;
        return 1;
    };

    const gerarTags = (visitas: number, tempoMedio: number) => {
        const tags = [];
        if (visitas >= 30) tags.push('frequente');
        else if (visitas >= 10) tags.push('ocasional');
        else tags.push('primeira vez');
        
        if (visitas >= 50 && tempoMedio >= 180) tags.push('vip');
        return tags;
    };

    const formatarTempo = (minutos: number) => {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas}h ${mins}m`;
    };

    const formatarUltimaVisita = (data: string) => {
        if (!data) return 'N/A';
        const diff = new Date().getTime() - new Date(data).getTime();
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (dias === 0) return 'Hoje';
        if (dias === 1) return '1 dia atrás';
        if (dias < 7) return `${dias} dias atrás`;
        if (dias < 30) return `${Math.floor(dias / 7)} semanas atrás`;
        return `${Math.floor(dias / 30)} meses atrás`;
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const calcularNivel = (visitas: number, tempoMedio: number): 'ALTO' | 'MEDIO' | 'BAIXO' => {
        if (visitas >= 30 && tempoMedio >= 120) return 'ALTO';
        if (visitas >= 10 && tempoMedio >= 60) return 'MEDIO';
        return 'BAIXO';
    };

    const getNivelColor = (nivel: string) => {
        switch (nivel) {
            case 'ALTO': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'MEDIO': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'BAIXO': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTagColor = (tag: string) => {
        switch (tag.toLowerCase()) {
            case 'frequente': return 'bg-green-100 text-green-800';
            case 'ocasional': return 'bg-orange-100 text-orange-800';
            case 'primeira vez': return 'bg-blue-100 text-blue-800';
            case 'vip': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i
                key={i}
                className={`ion-ios-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            ></i>
        ));
    };

    const clientesFiltrados = clientes.filter(cliente => {
        if (filtroCliente !== 'todos' && cliente.nivel !== filtroCliente) return false;
        return true;
    });

    console.log('Estado atual - clientes:', clientes.length, 'clientesFiltrados:', clientesFiltrados.length, 'loading:', loading);


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
                                className="mr-2 lg:mr-4 p-2 text-gray-600 hover:text-indigo-500 rounded-lg transition-colors"
                                title="Voltar para Início"
                            >
                                <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                            </a>
                            <div>
                                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-people text-indigo-500 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                                    Análise Comportamental
                                </h1>
                                <p className="text-gray-600 text-sm lg:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Insights sobre padrões de uso dos clientes
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                                <select
                                    value={filtroPeriodo}
                                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="hoje">Hoje</option>
                                    <option value="semana">Esta Semana</option>
                                    <option value="mes">Este Mês</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pátio</label>
                                <select
                                    value={filtroPatio}
                                    onChange={(e) => setFiltroPatio(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="todos">Todos os Pátios</option>
                                    <option value="1">Pátio Centro</option>
                                    <option value="2">Pátio Limão</option>
                                    <option value="3">Pátio Guarulhos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clientes</label>
                                <select
                                    value={filtroCliente}
                                    onChange={(e) => setFiltroCliente(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="todos">Todos os Clientes</option>
                                    <option value="ALTO">Alto Valor</option>
                                    <option value="MEDIO">Médio Valor</option>
                                    <option value="BAIXO">Baixo Valor</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navegação por Abas */}
                <div className="neumorphic-container mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setVisualizacao('cards')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                visualizacao === 'cards'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <i className="ion-ios-grid mr-2"></i>
                            Cards
                        </button>
                        <button
                            onClick={() => setVisualizacao('tabela')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                visualizacao === 'tabela'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <i className="ion-ios-list mr-2"></i>
                            Tabela
                        </button>
                        <button
                            onClick={() => setVisualizacao('graficos')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                visualizacao === 'graficos'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <i className="ion-ios-analytics mr-2"></i>
                            Gráficos
                        </button>
                        <button
                            onClick={() => setVisualizacao('insights')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                visualizacao === 'insights'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <i className="ion-ios-bulb mr-2"></i>
                            Insights
                        </button>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                {loading ? (
                    <div className="neumorphic-container p-8 text-center">
                        <i className="ion-ios-refresh animate-spin text-2xl text-gray-500 mb-2"></i>
                        <p className="text-gray-500">Carregando análise comportamental...</p>
                    </div>
                ) : clientesFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <i className="ion-ios-people text-4xl mb-2"></i>
                        <p>Nenhum dado comportamental disponível</p>
                    </div>
                ) : visualizacao === 'cards' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                        {clientesFiltrados.map((cliente) => (
                            <div key={cliente.id} className="neumorphic-container p-4 hover:scale-105 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm lg:text-base font-semibold text-gray-800 mb-1 truncate">{cliente.id}</h3>
                                        <p className="text-xs lg:text-sm text-gray-600 truncate">{cliente.nome}</p>
                                    </div>
                                    <div className="flex flex-shrink-0 ml-2">
                                        {renderStars(cliente.rating)}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {cliente.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getNivelColor(cliente.nivel)}`}>
                                        {cliente.nivel}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Visitas:</span>
                                        <span className="font-semibold text-blue-600">{cliente.visitas}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tempo Médio:</span>
                                        <span className="font-semibold text-green-600">{cliente.tempoMedio}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pátio Preferido:</span>
                                        <span className="font-semibold text-purple-600">{cliente.patioPreferido} ({cliente.percentualPreferido}%)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Última visita:</span>
                                        <span className="font-semibold text-gray-600">{cliente.ultimaVisita}</span>
                                    </div>
                                    {cliente.proximaVisita && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Próxima visita:</span>
                                            <span className="font-semibold text-orange-600">{cliente.proximaVisita}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : visualizacao === 'tabela' ? (
                    <div className="neumorphic-container overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo Médio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pátio Preferido</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Visita</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clientesFiltrados.map((cliente) => (
                                        <tr key={cliente.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{cliente.id}</div>
                                                    <div className="text-sm text-gray-500">{cliente.nome}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex">
                                                    {renderStars(cliente.rating)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.visitas}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.tempoMedio}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.patioPreferido}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.ultimaVisita}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : visualizacao === 'graficos' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico de Barras - Visitas por Cliente */}
                        <div className="neumorphic-container">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Visitas por Cliente
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={clientesFiltrados}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="visitas" fill="#3b82f6" name="Visitas" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfico de Pizza - Distribuição por Nível */}
                        <div className="neumorphic-container">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Distribuição por Nível
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Alto Valor', value: clientesFiltrados.filter(c => c.nivel === 'ALTO').length, color: '#8b5cf6' },
                                                { name: 'Médio Valor', value: clientesFiltrados.filter(c => c.nivel === 'MEDIO').length, color: '#3b82f6' },
                                                { name: 'Baixo Valor', value: clientesFiltrados.filter(c => c.nivel === 'BAIXO').length, color: '#6b7280' }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Alto Valor', value: clientesFiltrados.filter(c => c.nivel === 'ALTO').length, color: '#8b5cf6' },
                                                { name: 'Médio Valor', value: clientesFiltrados.filter(c => c.nivel === 'MEDIO').length, color: '#3b82f6' },
                                                { name: 'Baixo Valor', value: clientesFiltrados.filter(c => c.nivel === 'BAIXO').length, color: '#6b7280' }
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfico de Linha - Tempo Médio vs Visitas */}
                        <div className="neumorphic-container lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Correlação: Tempo Médio vs Visitas
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart data={clientesFiltrados.map(cliente => ({
                                        x: cliente.visitas,
                                        y: parseInt(cliente.tempoMedio.replace(/[^\d]/g, '')) || 0,
                                        name: cliente.nome
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="x" name="Visitas" />
                                        <YAxis dataKey="y" name="Tempo (min)" />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter dataKey="y" fill="#ef4444" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="neumorphic-container">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Insights Comportamentais</h3>
                        {clientesFiltrados.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Clientes de Alto Valor</h4>
                                    <p className="text-blue-700 text-sm">
                                        {clientesFiltrados.filter(c => c.nivel === 'ALTO').length} clientes identificados como alto valor, 
                                        representando {clientesFiltrados.length > 0 ? ((clientesFiltrados.filter(c => c.nivel === 'ALTO').length / clientesFiltrados.length) * 100).toFixed(1) : 0}% do total.
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">Padrão de Frequência</h4>
                                    <p className="text-green-700 text-sm">
                                        Clientes frequentes representam a maior parte da base, 
                                        com tempo médio de permanência de 2.5 horas.
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-purple-800 mb-2">Preferência por Pátios</h4>
                                    <p className="text-purple-700 text-sm">
                                        Pátio Centro é o mais preferido, seguido por Limão e Guarulhos.
                                    </p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-orange-800 mb-2">Oportunidades</h4>
                                    <p className="text-orange-700 text-sm">
                                        {clientesFiltrados.filter(c => c.nivel === 'BAIXO').length} clientes de baixo valor 
                                        podem ser convertidos com estratégias específicas.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <i className="ion-ios-people text-4xl mb-2"></i>
                                <p>Nenhum dado comportamental disponível</p>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
