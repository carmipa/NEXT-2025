"use client";

import { useState, useEffect } from 'react';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PrevisaoData {
    previsao1h: number;
    picoMaximo: number;
    confiancaMedia: number;
    tendencia: 'crescendo' | 'diminuindo' | 'estavel';
    dadosGrafico: Array<{
        hora: string;
        ocupacao: number;
        previsao: number;
        confianca?: number;
    }>;
}

export default function DashboardIAPage() {
    const [dados, setDados] = useState<PrevisaoData>({
        previsao1h: 0,
        picoMaximo: 0,
        confiancaMedia: 0,
        tendencia: 'estavel',
        dadosGrafico: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        carregarDadosIA();
    }, []);

    const carregarDadosIA = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Buscar dados reais da API de IA
            const response = await fetch('/api/relatorios/ia/dashboard');
            console.log('Response status:', response.status);
            if (response.ok) {
                const dadosIA = await response.json();
                console.log('Dados IA recebidos:', dadosIA);
                const dadosProcessados: PrevisaoData = processarDadosReais(dadosIA);
                console.log('Dados processados para setDados:', dadosProcessados);
                setDados(dadosProcessados);
            } else {
                setError('Erro ao carregar dados de IA');
                setDados({
                    previsao1h: 0,
                    picoMaximo: 0,
                    confiancaMedia: 0,
                    tendencia: 'estavel',
                    dadosGrafico: []
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dados de IA:', error);
            setError('Erro de conexão com o servidor');
            setDados({
                previsao1h: 0,
                picoMaximo: 0,
                confiancaMedia: 0,
                tendencia: 'estavel',
                dadosGrafico: []
            });
        } finally {
            setLoading(false);
        }
    };

    const processarDadosReais = (dadosIA: any): PrevisaoData => {
        console.log('Dados recebidos da API:', dadosIA);
        
        // Converter os dados da API para o formato esperado
        const dadosProcessados = {
            previsao1h: Math.round((dadosIA.previsao1h || 0) * 100), // Converter para porcentagem
            picoMaximo: Math.round((dadosIA.picoMaximo || 0) * 100), // Converter para porcentagem
            confiancaMedia: Math.round((dadosIA.confiancaMedia || 0) * 100), // Converter para porcentagem
            tendencia: dadosIA.tendencia || 'estavel',
            dadosGrafico: (dadosIA.dadosGrafico || []).map((item: any) => ({
                hora: item.hora,
                ocupacao: Math.round((item.ocupacao || 0) * 100), // Converter para porcentagem
                previsao: Math.round((item.previsao || 0) * 100), // Converter para porcentagem
                confianca: Math.min(Math.round(item.confianca || 0), 100) // Confiança limitada a 100%
            }))
        };
        
        console.log('Dados processados:', dadosProcessados);
        return dadosProcessados;
    };

    const getTendenciaIcon = (tendencia: string) => {
        switch (tendencia) {
            case 'crescendo': return 'ion-ios-trending-up';
            case 'diminuindo': return 'ion-ios-trending-down';
            default: return 'ion-ios-remove';
        }
    };

    const getTendenciaColor = (tendencia: string) => {
        switch (tendencia) {
            case 'crescendo': return 'text-red-500';
            case 'diminuindo': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const getConfiancaColor = (confianca: number) => {
        if (confianca >= 90) return 'text-green-500';
        if (confianca >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <ParticleBackground />
            
            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="neumorphic-container mb-6 lg:mb-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center">
                            <a 
                                href="/relatorios" 
                                className="mr-2 lg:mr-4 p-2 text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Voltar para Relatórios"
                            >
                                <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                            </a>
                            <div>
                                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-analytics text-yellow-500 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                                    Dashboard IA
                                </h1>
                                <p className="text-gray-300 text-sm lg:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Análise preditiva e insights inteligentes do sistema
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-4">
                            <button
                                onClick={carregarDadosIA}
                                disabled={loading}
                                className="px-3 lg:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 text-sm lg:text-base"
                            >
                                <i className={`ion-ios-refresh mr-1 lg:mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                                <span className="hidden sm:inline">Atualizar</span>
                                <span className="sm:hidden">Atualizar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="neumorphic-container p-8 text-center">
                        <div className="flex items-center justify-center">
                            <i className="ion-ios-refresh animate-spin text-2xl text-yellow-500 mr-3"></i>
                            <span className="text-lg text-white">Carregando dados de IA...</span>
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
                {!loading && dados.dadosGrafico.length === 0 && !error && dados.previsao1h === 0 && (
                    <div className="neumorphic-container p-8 text-center">
                        <i className="ion-ios-analytics text-6xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum Dado de IA Disponível</h3>
                        <p className="text-gray-300">Os dados de inteligência artificial serão carregados automaticamente quando disponíveis.</p>
                    </div>
                )}

                {/* Dashboard Content */}
                {!loading && (dados.dadosGrafico.length > 0 || dados.previsao1h > 0) && (
                    <>
                        {/* Cards de Métricas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                            <div className="neumorphic-container p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs lg:text-sm text-gray-300">Previsão 1h</p>
                                        <p className="text-xl lg:text-2xl font-bold text-white">{dados.previsao1h}%</p>
                                    </div>
                                    <i className="ion-ios-time text-lg lg:text-2xl text-blue-500"></i>
                                </div>
                            </div>

                            <div className="neumorphic-container p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs lg:text-sm text-gray-300">Pico Máximo</p>
                                        <p className="text-xl lg:text-2xl font-bold text-white">{dados.picoMaximo}%</p>
                                    </div>
                                    <i className="ion-ios-pulse text-lg lg:text-2xl text-red-500"></i>
                                </div>
                            </div>

                            <div className="neumorphic-container p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs lg:text-sm text-gray-300">Confiança Média</p>
                                        <p className={`text-xl lg:text-2xl font-bold ${getConfiancaColor(dados.confiancaMedia)}`}>
                                            {dados.confiancaMedia}%
                                        </p>
                                    </div>
                                    <i className="ion-ios-checkmark-circle text-lg lg:text-2xl text-green-500"></i>
                                </div>
                            </div>

                            <div className="neumorphic-container p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs lg:text-sm text-gray-300">Tendência</p>
                                        <p className={`text-lg lg:text-xl font-bold flex items-center ${getTendenciaColor(dados.tendencia)}`}>
                                            <i className={`${getTendenciaIcon(dados.tendencia)} mr-1 lg:mr-2 text-sm lg:text-base`}></i>
                                            <span className="text-sm lg:text-base">{dados.tendencia}</span>
                                        </p>
                                    </div>
                                    <i className="ion-ios-trending-up text-lg lg:text-2xl text-purple-500"></i>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de Previsão */}
                        <div className="neumorphic-container p-6 mb-8">
                            <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Previsão de Ocupação (IA)
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dados.dadosGrafico}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hora" stroke="#ccc" />
                                        <YAxis stroke="#ccc" />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="ocupacao" 
                                            stroke="#3B82F6" 
                                            strokeWidth={2}
                                            name="Ocupação Atual"
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="previsao" 
                                            stroke="#EF4444" 
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="Previsão IA"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Insights de IA */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="neumorphic-container p-6">
                                <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Insights Inteligentes
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <i className="ion-ios-bulb text-yellow-500 mr-3 mt-1"></i>
                                        <div>
                                            <p className="font-medium text-white">Padrão Detectado</p>
                                            <p className="text-sm text-gray-300">
                                                Sistema identificou padrão de ocupação baseado em dados históricos.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <i className="ion-ios-warning text-orange-500 mr-3 mt-1"></i>
                                        <div>
                                            <p className="font-medium text-white">Alerta Preventivo</p>
                                            <p className="text-sm text-gray-300">
                                                Previsão indica possível sobrecarga em 2 horas.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <i className="ion-ios-checkmark-circle text-green-500 mr-3 mt-1"></i>
                                        <div>
                                            <p className="font-medium text-white">Otimização Sugerida</p>
                                            <p className="text-sm text-gray-300">
                                                Redistribuição de veículos pode melhorar eficiência em 15%.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="neumorphic-container p-6">
                                <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Métricas de Confiança
                                </h3>
                                <div className="space-y-4">
                                    {dados.dadosGrafico.slice(0, 6).map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-300">{item.hora}</span>
                                            <div className="flex items-center">
                                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${getConfiancaColor(item.confianca || 0).replace('text-', 'bg-')}`}
                                                        style={{ width: `${item.confianca || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-white">
                                                    {item.confianca || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}