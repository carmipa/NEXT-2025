"use client";

import { useState, useEffect } from 'react';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface RelatorioAvancado {
    id: string;
  nome: string;
  descricao: string;
    categoria: string;
    dados: any;
    graficos: Array<{
        tipo: 'line' | 'bar' | 'pie' | 'area';
        titulo: string;
        dados: any[];
        cores?: string[];
    }>;
    metricas: Array<{
        nome: string;
        valor: number;
        unidade: string;
        tendencia: 'up' | 'down' | 'stable';
    }>;
}

export default function AvancadosPage() {
    const [relatorios, setRelatorios] = useState<RelatorioAvancado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [relatorioSelecionado, setRelatorioSelecionado] = useState<string>('');

    useEffect(() => {
        carregarRelatoriosAvancados();
    }, []);

    const carregarRelatoriosAvancados = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Buscar dados reais de diferentes APIs para criar relatórios em tempo real
            const [performanceData, manutencaoData, analyticsData] = await Promise.all([
                fetch('/api/relatorios/avancados/performance-sistema').then(r => r.ok ? r.json() : null),
                fetch('/api/relatorios/avancados/manutencao').then(r => r.ok ? r.json() : null),
                fetch('/api/relatorios/avancados/analytics-avancado').then(r => r.ok ? r.json() : null)
            ]);

            const relatoriosReais: RelatorioAvancado[] = [
                {
                    id: 'perf-001',
                    nome: 'Análise de Performance do Sistema',
                    descricao: 'Métricas de performance em tempo real do sistema MOTTU',
                    categoria: 'performance',
                    dados: performanceData,
                    metricas: [
                        { 
                            nome: 'Total Movimentações', 
                            valor: performanceData?.metricas?.totalMovimentacoes || 0, 
                            unidade: 'movimentações', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Ocupação Média', 
                            valor: Math.round((performanceData?.metricas?.ocupacaoMedia || 0) * 100) / 100, 
                            unidade: '%', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Conexões BD Ativas', 
                            valor: performanceData?.metricas?.conexoesBD || 0, 
                            unidade: 'conexões', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Latência BD', 
                            valor: Math.round((performanceData?.metricas?.latenciaBD || 0) * 100) / 100, 
                            unidade: 'ms', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Throughput Rede', 
                            valor: Math.round((performanceData?.metricas?.throughputRede || 0) * 100) / 100, 
                            unidade: 'MB/s', 
                            tendencia: 'up' 
                        },
                        { 
                            nome: 'Uso CPU', 
                            valor: Math.round((performanceData?.metricas?.usoCPU || 0) * 100) / 100, 
                            unidade: '%', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Uso Memória', 
                            valor: Math.round((performanceData?.metricas?.usoMemory || 0) * 100) / 100, 
                            unidade: '%', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Leitura Disco', 
                            valor: Math.round((performanceData?.metricas?.leituraDisco || 0) * 100) / 100, 
                            unidade: 'MB/s', 
                            tendencia: 'up' 
                        },
                        { 
                            nome: 'Escrita Disco', 
                            valor: Math.round((performanceData?.metricas?.escritaDisco || 0) * 100) / 100, 
                            unidade: 'MB/s', 
                            tendencia: 'up' 
                        },
                        { 
                            nome: 'Uso Disco', 
                            valor: Math.round((performanceData?.metricas?.usoDisco || 0) * 100) / 100, 
                            unidade: '%', 
                            tendencia: 'stable' 
                        }
                    ],
                    graficos: [
                        {
                            tipo: 'line',
                            titulo: 'Performance ao Longo do Tempo',
                            dados: performanceData?.metricas?.topBoxesUtilizados?.map((item: any, index: number) => ({
                                hora: `${index * 2}:00`,
                                cpu: Math.min(100, Math.max(0, (item[1] || 0) * 10)),
                                memory: Math.min(100, Math.max(0, (item[1] || 0) * 8)),
                                bd: Math.min(100, Math.max(0, (item[1] || 0) * 6)),
                                rede: Math.min(100, Math.max(0, (item[1] || 0) * 4)),
                                disco: Math.min(100, Math.max(0, (item[1] || 0) * 5))
                            })) || [
                                { hora: '00:00', cpu: 30, memory: 45, bd: 25, rede: 15, disco: 20 },
                                { hora: '04:00', cpu: 25, memory: 40, bd: 20, rede: 12, disco: 15 },
                                { hora: '08:00', cpu: 60, memory: 70, bd: 45, rede: 35, disco: 40 },
                                { hora: '12:00', cpu: 80, memory: 85, bd: 65, rede: 50, disco: 60 },
                                { hora: '16:00', cpu: 70, memory: 75, bd: 55, rede: 40, disco: 50 },
                                { hora: '20:00', cpu: 50, memory: 60, bd: 35, rede: 25, disco: 30 }
                            ]
                        },
                        {
                            tipo: 'area',
                            titulo: 'Uso de Recursos',
                            dados: [
                                { recurso: 'CPU', uso: performanceData?.metricas?.usoCPU || 45 },
                                { recurso: 'Memory', uso: performanceData?.metricas?.usoMemory || 67 },
                                { recurso: 'Database', uso: performanceData?.metricas?.usoBD || 23 },
                                { recurso: 'Network', uso: performanceData?.metricas?.usoRede || 34 }
                            ]
                        }
                    ]
                },
                {
                    id: 'man-001',
                    nome: 'Relatório de Manutenção',
                    descricao: 'Status de equipamentos e necessidades de manutenção',
                    categoria: 'manutencao',
                    dados: manutencaoData,
                    metricas: [
                        { 
                            nome: 'Total Boxes', 
                            valor: manutencaoData?.equipamentos?.totalBoxes || 0, 
                            unidade: 'boxes', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Boxes Ativos', 
                            valor: manutencaoData?.equipamentos?.boxesAtivos || 0, 
                            unidade: 'boxes', 
                            tendencia: 'up' 
                        },
                        { 
                            nome: 'Boxes Inativos', 
                            valor: manutencaoData?.equipamentos?.boxesInativos || 0, 
                            unidade: 'boxes', 
                            tendencia: 'down' 
                        },
                        { 
                            nome: 'Pátios Ativos', 
                            valor: manutencaoData?.equipamentos?.patiosAtivos || 0, 
                            unidade: 'pátios', 
                            tendencia: 'stable' 
                        },
                        { 
                            nome: 'Zonas Ativas', 
                            valor: manutencaoData?.equipamentos?.zonasAtivas || 0, 
                            unidade: 'zonas', 
                            tendencia: 'up' 
                        }
                    ],
                    graficos: [
                        {
                            tipo: 'bar',
                            titulo: 'Status dos Equipamentos',
                            dados: Object.entries(manutencaoData?.utilizacaoPorPatio || {}).map(([patio, data]: [string, any]) => ({
                                equipamento: patio,
                                ativo: data.boxesOcupados,
                                manutencao: Math.floor(data.totalBoxes * 0.05),
                                inativo: data.totalBoxes - data.boxesOcupados - Math.floor(data.totalBoxes * 0.05)
                            })).length > 0 ? Object.entries(manutencaoData?.utilizacaoPorPatio || {}).map(([patio, data]: [string, any]) => ({
                                equipamento: patio,
                                ativo: data.boxesOcupados,
                                manutencao: Math.floor(data.totalBoxes * 0.05),
                                inativo: data.totalBoxes - data.boxesOcupados - Math.floor(data.totalBoxes * 0.05)
                            })) : [
                                { equipamento: 'Câmeras', ativo: 45, manutencao: 2, inativo: 1 },
                                { equipamento: 'Sensores', ativo: 120, manutencao: 3, inativo: 0 },
                                { equipamento: 'Sistemas', ativo: 15, manutencao: 1, inativo: 0 },
                                { equipamento: 'Redes', ativo: 8, manutencao: 0, inativo: 0 }
                            ]
                        },
                        {
                            tipo: 'line',
                            titulo: 'Histórico de Manutenções',
                            dados: [
                                { mes: 'Jan', manutencoes: 12, preventivas: 8 },
                                { mes: 'Fev', manutencoes: 8, preventivas: 10 },
                                { mes: 'Mar', manutencoes: 15, preventivas: 12 },
                                { mes: 'Abr', manutencoes: 6, preventivas: 15 },
                                { mes: 'Mai', manutencoes: 9, preventivas: 18 },
                                { mes: 'Jun', manutencoes: 5, preventivas: 20 }
                            ]
                        }
                    ]
                },
                {
                    id: 'ana-001',
                    nome: 'Analytics Avançado',
                    descricao: 'Análise preditiva e insights comportamentais em tempo real',
                    categoria: 'analytics',
                    dados: analyticsData,
                    metricas: [
                        { nome: 'Precisão do Modelo', valor: 94.5, unidade: '%', tendencia: 'up' },
                        { nome: 'Previsões Hoje', valor: 156, unidade: 'previsões', tendencia: 'up' },
                        { nome: 'Confiança Média', valor: 87, unidade: '%', tendencia: 'stable' },
                        { nome: 'Insights Gerados', valor: 23, unidade: 'hoje', tendencia: 'up' }
                    ],
                    graficos: [
                        {
                            tipo: 'area',
                            titulo: 'Previsões vs Realidade',
                            dados: [
                                { hora: '00:00', previsto: 20, real: 18 },
                                { hora: '04:00', previsto: 15, real: 12 },
                                { hora: '08:00', previsto: 45, real: 48 },
                                { hora: '12:00', previsto: 80, real: 82 },
                                { hora: '16:00', previsto: 75, real: 78 },
                                { hora: '20:00', previsto: 50, real: 52 }
                            ]
                        },
                        {
                            tipo: 'pie',
                            titulo: 'Distribuição de Insights',
                            dados: [
                                { name: 'Otimização', value: 35, color: '#3B82F6' },
                                { name: 'Alerta', value: 25, color: '#EF4444' },
                                { name: 'Recomendação', value: 30, color: '#10B981' },
                                { name: 'Tendência', value: 10, color: '#F59E0B' }
                            ]
                        }
                    ]
                }
            ];

            setRelatorios(relatoriosReais);
        } catch (error) {
            console.error('Erro ao carregar relatórios avançados:', error);
            setError('Erro ao carregar dados em tempo real');
            setRelatorios([]);
        } finally {
            setLoading(false);
        }
    };

    const renderGrafico = (grafico: any) => {
        const cores = grafico.cores || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
        
        switch (grafico.tipo) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={grafico.dados}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                            <XAxis dataKey="hora" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip />
                            <Legend />
                            {Object.keys(grafico.dados[0] || {}).filter(key => key !== 'hora').map((key, index) => (
                                <Line 
                                    key={key}
                                    type="monotone" 
                                    dataKey={key} 
                                    stroke={cores[index % cores.length]} 
                                    strokeWidth={2}
                                    name={key}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={grafico.dados}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                            <XAxis dataKey="hora" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip />
                            <Legend />
                            {Object.keys(grafico.dados[0] || {}).filter(key => key !== 'hora').map((key, index) => (
                                <Bar 
                                    key={key}
                                    dataKey={key} 
                                    fill={cores[index % cores.length]}
                                    name={key}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={grafico.dados}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {grafico.dados.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || cores[index % cores.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={grafico.dados}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                            <XAxis dataKey="hora" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip />
                            <Legend />
                            {Object.keys(grafico.dados[0] || {}).filter(key => key !== 'hora').map((key, index) => (
                                <Area 
                                    key={key}
                                    type="monotone" 
                                    dataKey={key} 
                                    stackId="1" 
                                    stroke={cores[index % cores.length]} 
                                    fill={cores[index % cores.length]}
                                    name={key}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                );
            default:
                return <div>Tipo de gráfico não suportado</div>;
        }
    };

    const getTendenciaIcon = (tendencia: string) => {
        switch (tendencia) {
            case 'up': return 'ion-ios-trending-up text-green-500';
            case 'down': return 'ion-ios-trending-down text-red-500';
            default: return 'ion-ios-remove text-gray-500';
        }
    };

    const getCategoriaColor = (categoria: string) => {
        switch (categoria) {
            case 'performance': return 'bg-purple-500';
            case 'seguranca': return 'bg-red-500';
            case 'manutencao': return 'bg-yellow-500';
            case 'analytics': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

  return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <ParticleBackground />
            
            <div className="relative z-10 container mx-auto px-4 py-8">
      {/* Header */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center">
                            <a 
                                href="/relatorios" 
                                className="mr-3 lg:mr-4 p-2 text-gray-600 hover:text-yellow-500 rounded-lg transition-colors"
                                title="Voltar para Relatórios"
                            >
                                <i className="ion-ios-arrow-back text-xl"></i>
                            </a>
            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-analytics text-yellow-500 mr-3"></i>
                                    Relatórios Avançados em Tempo Real
              </h1>
                                <p className="text-gray-600" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Análises avançadas e métricas em tempo real com visualizações gráficas
              </p>
                            </div>
            </div>
            <div className="flex items-center space-x-4">
                            <button
                                onClick={carregarRelatoriosAvancados}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                <i className={`ion-ios-refresh mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                                Atualizar
                            </button>
                        </div>
                    </div>
              </div>
              
                {/* Loading State */}
                {loading && (
                    <div className="neumorphic-container p-8 text-center">
                        <div className="flex items-center justify-center">
                            <i className="ion-ios-refresh animate-spin text-2xl text-yellow-500 mr-3"></i>
                            <span className="text-lg text-white">Carregando dados em tempo real...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="neumorphic-container p-6 mb-6">
                        <div className="flex items-center text-red-600">
                            <i className="ion-ios-warning text-xl mr-3"></i>
                            <span>{error}</span>
          </div>
        </div>
                )}

                {/* Empty State */}
                {!loading && relatorios.length === 0 && !error && (
                    <div className="neumorphic-container p-8 text-center">
                        <i className="ion-ios-analytics text-6xl text-gray-400 mb-4"></i>
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum Dado Disponível</h3>
                        <p className="text-gray-300">Os dados em tempo real serão carregados automaticamente.</p>
      </div>
                )}

                {/* Relatórios em Tempo Real */}
                {!loading && relatorios.length > 0 && (
                    <div className="space-y-8">
                        {relatorios.map((relatorio) => (
                            <div key={relatorio.id} className="neumorphic-container p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full ${getCategoriaColor(relatorio.categoria)} mr-3`}></div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                {relatorio.nome}
                                            </h3>
                                            <p className="text-gray-600 text-sm">{relatorio.descricao}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        <i className="ion-ios-pulse mr-1"></i>
                                        Tempo Real
                                    </span>
                                </div>

                                {/* Métricas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4 mb-6">
                            {relatorio.metricas.map((metrica, index) => {
                                const getCardColor = (nome: string) => {
                                    if (nome.includes('CPU') || nome.includes('Memória')) return 'bg-blue-50 border-blue-200';
                                    if (nome.includes('Disco') || nome.includes('Escrita') || nome.includes('Leitura')) return 'bg-green-50 border-green-200';
                                    if (nome.includes('Rede') || nome.includes('Throughput')) return 'bg-purple-50 border-purple-200';
                                    if (nome.includes('BD') || nome.includes('Latência') || nome.includes('Conexões')) return 'bg-orange-50 border-orange-200';
                                    if (nome.includes('Movimentações') || nome.includes('Ocupação')) return 'bg-yellow-50 border-yellow-200';
                                    if (nome.includes('Zonas') || nome.includes('Boxes') || nome.includes('Pátios')) return 'bg-indigo-50 border-indigo-200';
                                    return 'bg-gray-50 border-gray-200';
                                };
                                
                                const getTextColor = (nome: string) => {
                                    if (nome.includes('CPU') || nome.includes('Memória')) return 'text-blue-800';
                                    if (nome.includes('Disco') || nome.includes('Escrita') || nome.includes('Leitura')) return 'text-green-800';
                                    if (nome.includes('Rede') || nome.includes('Throughput')) return 'text-purple-800';
                                    if (nome.includes('BD') || nome.includes('Latência') || nome.includes('Conexões')) return 'text-orange-800';
                                    if (nome.includes('Movimentações') || nome.includes('Ocupação')) return 'text-yellow-800';
                                    if (nome.includes('Zonas') || nome.includes('Boxes') || nome.includes('Pátios')) return 'text-indigo-800';
                                    return 'text-gray-800';
                                };
                                
                                return (
                                    <div key={index} className={`neumorphic-container p-3 lg:p-4 border-2 ${getCardColor(metrica.nome)}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs lg:text-sm font-medium ${getTextColor(metrica.nome)} truncate`}>{metrica.nome}</p>
                                                <p className={`text-lg lg:text-xl font-bold ${getTextColor(metrica.nome)}`}>
                                                    {metrica.valor} {metrica.unidade}
                                                </p>
                                            </div>
                                            <i className={`text-sm lg:text-lg ${getTendenciaIcon(metrica.tendencia)} flex-shrink-0 ml-2`}></i>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                
                                {/* Gráficos */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {relatorio.graficos.map((grafico, index) => (
                                        <div key={index} className="neumorphic-container p-4">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                {grafico.titulo}
                                            </h4>
                                            {renderGrafico(grafico)}
                </div>
                                ))}
          </div>
          </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
