"use client";

import { useState, useEffect } from 'react';
import { buildApiUrl } from '@/config/api';
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
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
    const [page, setPage] = useState(1);
    const pageSize = 6;
    const [sseActive, setSseActive] = useState(false); // Adicionado para indicar status SSE

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

        // SSE para ocupação atual em tempo real
        let es: EventSource | null = null;
        try {
            const url = buildApiUrl('/api/relatorios/ocupacao/stream');
            console.log('🔄 Conectando ao SSE de ocupação:', url);
            es = new EventSource(url);
            
            es.onopen = () => {
                console.log('✅ SSE de ocupação conectado com sucesso');
                setSseActive(true);
            };
            
            es.onmessage = (ev) => {
                try {
                    const payload = JSON.parse(ev.data);
                    console.log('📊 Dados SSE recebidos:', payload);
                    
                    if (Array.isArray(payload)) {
                        setOcupacaoAtual(payload);
                        console.log('✅ Ocupação atual atualizada via SSE:', payload.length, 'pátios');
                        setSseActive(true);
                    }
                } catch (err) {
                    console.error('❌ Erro ao processar dados SSE:', err);
                }
            };
            
            es.onerror = (error) => {
                console.error('❌ Erro no SSE de ocupação:', error);
                setSseActive(false);
                // Tentar reconectar após 5 segundos
                setTimeout(() => {
                    if (es && es.readyState === EventSource.CLOSED) {
                        console.log('🔄 Tentando reconectar SSE...');
                        es.close();
                    }
                }, 5000);
            };
        } catch (err) {
            console.error('❌ Erro ao criar EventSource:', err);
        }

        // Polling periódico para o histórico diário (fallback se SSE falhar)
        const pollId = setInterval(() => {
            gerarRelatorio();
        }, 30000); // 30s

        return () => {
            if (es) {
                console.log('🔌 Fechando conexão SSE');
                es.close();
            }
            clearInterval(pollId);
        };
    }, []);

    const carregarOcupacaoAtual = async () => {
        try {
            setLoading(true);
            // Usar cache otimizado para relatórios
            const { RelatoriosApi } = await import('@/utils/api/relatorios');
            const data = await RelatoriosApi.getOcupacaoAtual();
            setOcupacaoAtual(data);
            setPage(1);
        } catch (err) {
            console.error('Erro ao carregar ocupação atual:', err);
            setError('Erro ao carregar dados de ocupação');
        } finally {
            setLoading(false);
        }
    };

    // paginação dos cartões/lista
    const totalPages = Math.max(1, Math.ceil(ocupacaoAtual.length / pageSize));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginaOcupacao = ocupacaoAtual.slice(start, end);

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
            
            console.log('🔄 Gerando relatório de ocupação diária:', dataInicioFinal, 'até', dataFimFinal);
            
            // Usar cache otimizado para relatórios
            const { RelatoriosApi } = await import('@/utils/api/relatorios');
            const data = await RelatoriosApi.getOcupacaoDiaria(dataInicioFinal, dataFimFinal);
            
            console.log('✅ Dados de ocupação diária recebidos:', data);
            
            // Processar dados para o formato esperado pelo gráfico
            // O backend retorna: { dia: LocalDate (string ISO), ocupados: Long, livres: Long }
            const dadosProcessados = data.map((item: any) => {
                // O backend retorna 'dia' como string ISO (ex: "2024-01-15")
                const dataStr = item.dia || item.data || '';
                const ocupados = Number(item.ocupados || 0);
                const livres = Number(item.livres || 0);
                const totalVagas = ocupados + livres;
                
                // Validar e formatar a data
                let dataFormatada = dataStr;
                if (dataStr) {
                    try {
                        // Se já está no formato ISO, usar diretamente
                        const dataObj = new Date(dataStr);
                        if (!isNaN(dataObj.getTime())) {
                            dataFormatada = dataObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD
                        } else {
                            console.warn('⚠️ Data inválida recebida:', dataStr);
                            dataFormatada = new Date().toISOString().split('T')[0]; // Fallback para hoje
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao processar data:', dataStr, e);
                        dataFormatada = new Date().toISOString().split('T')[0]; // Fallback para hoje
                    }
                } else {
                    dataFormatada = new Date().toISOString().split('T')[0]; // Fallback para hoje
                }
                
                return {
                    data: dataFormatada,
                    totalVagas: totalVagas,
                    ocupadas: ocupados,
                    livres: livres,
                    percentual: totalVagas > 0 ? Math.round((ocupados / totalVagas) * 100) : 0
                };
            });
            
            console.log('📊 Dados processados para gráfico:', dadosProcessados.length, 'registros');
            console.log('📊 Primeiro registro:', dadosProcessados[0]);
            
            setDadosOcupacao(dadosProcessados);
            
        } catch (err) {
            console.error('❌ Erro ao gerar relatório:', err);
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
                                    <div className="flex items-center justify-end gap-2 mb-2">
                                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full border text-xs ${sseActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                            <span className={`w-2 h-2 rounded-full ${sseActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                            <span>{sseActive ? 'Tempo Real' : 'Polling'}</span>
                                        </div>
                                    </div>
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-pulse text-green-600 mr-2"></i>
                                Ocupação Atual por Pátio
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-3 py-1 rounded-md text-sm ${viewMode==='cards' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    title="Ver em card"
                                >
                                    <i className="ion-ios-apps mr-1"></i> Card
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 rounded-md text-sm ${viewMode==='list' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    title="Ver em lista"
                                >
                                    <i className="ion-ios-list mr-1"></i> Lista
                                </button>
                                <div className="ml-4 flex items-center gap-2">
                                    <button
                                        className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                                        onClick={() => setPage(p => Math.max(1, p-1))}
                                        disabled={page===1}
                                        title="Página anterior"
                                    >
                                        <i className="ion-ios-arrow-back"></i>
                                    </button>
                                    <span className="text-sm text-gray-700">{page}/{totalPages}</span>
                                    <button
                                        className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                                        onClick={() => setPage(p => Math.min(totalPages, p+1))}
                                        disabled={page===totalPages}
                                        title="Próxima página"
                                    >
                                        <i className="ion-ios-arrow-forward"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                                {paginaOcupacao.map((patio) => (
                                    <div key={patio.patioId} className="neumorphic-container p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-800 text-sm lg:text-base truncate flex items-center gap-2">
                                                <i className="ion-ios-home text-blue-500"></i>
                                                {patio.nomePatio}
                                            </h4>
                                            <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                                                <i className="ion-ios-pulse text-blue-500"></i>
                                                {patio.taxaOcupacao.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="text-xs lg:text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <i className="ion-ios-grid text-blue-400"></i>
                                                Total: {patio.totalBoxes} boxes
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-red-600 flex items-center gap-1">
                                                    <i className="ion-ios-close-circle text-red-500"></i>
                                                    Ocupados: {patio.boxesOcupados}
                                                </span>
                                                <span className="text-green-600 flex items-center gap-1">
                                                    <i className="ion-ios-checkmark-circle text-green-500"></i>
                                                    Livres: {patio.boxesLivres}
                                                </span>
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
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-home text-gray-600"></i>
                                                    Pátio
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-grid text-blue-500"></i>
                                                    Total
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-close-circle text-red-500"></i>
                                                    Ocupados
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-checkmark-circle text-green-500"></i>
                                                    Livres
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-pulse text-blue-500"></i>
                                                    % Ocupação
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginaOcupacao.map(patio => (
                                            <tr key={patio.patioId} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-home text-gray-500"></i>
                                                        <span className="truncate max-w-xs">{patio.nomePatio}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-grid text-blue-400"></i>
                                                        <span>{patio.totalBoxes}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-red-600 font-medium whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-close-circle text-red-500"></i>
                                                        <span>{patio.boxesOcupados}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-green-600 font-medium whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-checkmark-circle text-green-500"></i>
                                                        <span>{patio.boxesLivres}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm font-semibold text-blue-600 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-pulse text-blue-500"></i>
                                                        <span>{patio.taxaOcupacao.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Paginação inferior */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center mt-4 gap-3">
                                <button className={`px-3 py-1 rounded-md ${page===1?'bg-gray-200 text-gray-500':'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setPage(1)} disabled={page===1}><i className="ion-ios-skipbackward"></i></button>
                                <button className={`px-3 py-1 rounded-md ${page===1?'bg-gray-200 text-gray-500':'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}><i className="ion-ios-arrow-back"></i></button>
                                <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
                                <button className={`px-3 py-1 rounded-md ${page===totalPages?'bg-gray-2 00 text-gray-500':'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}><i className="ion-ios-arrow-forward"></i></button>
                                <button className={`px-3 py-1 rounded-md ${page===totalPages?'bg-gray-200 text-gray-500':'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setPage(totalPages)} disabled={page===totalPages}><i className="ion-ios-skipforward"></i></button>
                            </div>
                        )}
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
                                {ocupacaoAtual.map(p => (
                                    <option key={p.patioId} value={String(p.patioId)}>{p.nomePatio}</option>
                                ))}
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
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-analytics text-blue-500 mr-2"></i>
                            Gráfico de Ocupação
                        </h3>
                        {sseActive && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Atualizando em tempo real</span>
                            </div>
                        )}
                    </div>
                    <div className="h-80 w-full">
                        {dadosOcupacao.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" key={`line-chart-${dadosOcupacao.length}-${Date.now()}`}>
                                <LineChart 
                                    data={dadosOcupacao} 
                                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="data" 
                                        stroke="#6b7280"
                                        tickFormatter={(value) => {
                                            try {
                                                const date = new Date(value);
                                                if (isNaN(date.getTime())) return value;
                                                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                                            } catch {
                                                return value;
                                            }
                                        }}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        domain={[0, 'auto']}
                                        allowDataOverflow={false}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip 
                                        labelFormatter={(value) => {
                                            try {
                                                const date = new Date(value);
                                                if (isNaN(date.getTime())) return value;
                                                return date.toLocaleDateString('pt-BR', { 
                                                    day: '2-digit', 
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                });
                                            } catch {
                                                return value;
                                            }
                                        }}
                                        contentStyle={{ 
                                            backgroundColor: '#ffffff', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px',
                                            padding: '10px'
                                        }}
                                        labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                                    />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="line"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="ocupadas" 
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        name="Ocupadas"
                                        dot={{ r: 5, fill: '#ef4444' }}
                                        activeDot={{ r: 7, fill: '#ef4444' }}
                                        isAnimationActive={true}
                                        animationDuration={500}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="livres" 
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        name="Livres"
                                        dot={{ r: 5, fill: '#22c55e' }}
                                        activeDot={{ r: 7, fill: '#22c55e' }}
                                        isAnimationActive={true}
                                        animationDuration={500}
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

                {/* Gráfico de Barras Colorido (stacked) */}
                <div className="neumorphic-container mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-bar-chart text-green-500 mr-2"></i>
                            Distribuição Diária (Ocupadas x Livres)
                        </h3>
                        {sseActive && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Atualizando em tempo real</span>
                            </div>
                        )}
                    </div>
                    <div className="h-80">
                        {dadosOcupacao.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" key={`bar-chart-${dadosOcupacao.length}-${ocupacaoAtual.length}`}>
                                <BarChart 
                                    data={dadosOcupacao} 
                                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="data" 
                                        stroke="#6b7280"
                                        tickFormatter={(value) => {
                                            try {
                                                const date = new Date(value);
                                                if (isNaN(date.getTime())) return value;
                                                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                                            } catch {
                                                return value;
                                            }
                                        }}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        domain={[0, 'auto']}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip 
                                        labelFormatter={(value) => {
                                            try {
                                                const date = new Date(value);
                                                if (isNaN(date.getTime())) return value;
                                                return date.toLocaleDateString('pt-BR', { 
                                                    day: '2-digit', 
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                });
                                            } catch {
                                                return value;
                                            }
                                        }}
                                        contentStyle={{ 
                                            backgroundColor: '#ffffff', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px',
                                            padding: '10px'
                                        }}
                                        labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                                    />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                    <Bar 
                                        dataKey="ocupadas" 
                                        name="Ocupadas" 
                                        stackId="a" 
                                        fill="#ef4444" 
                                        isAnimationActive={true} 
                                        animationDuration={500}
                                        radius={[0, 0, 0, 0]}
                                    />
                                    <Bar 
                                        dataKey="livres" 
                                        name="Livres" 
                                        stackId="a" 
                                        fill="#22c55e" 
                                        isAnimationActive={true} 
                                        animationDuration={500}
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <i className="ion-ios-analytics text-4xl mb-2"></i>
                                    <p>Nenhum dado disponível para exibir o gráfico</p>
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
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="ion-ios-calendar text-blue-500"></i>
                                            Data
                                        </div>
                                    </th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="ion-ios-grid text-gray-600"></i>
                                            Total Vagas
                                        </div>
                                    </th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="ion-ios-close-circle text-red-500"></i>
                                            Ocupadas
                                        </div>
                                    </th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="ion-ios-checkmark-circle text-green-500"></i>
                                            Livres
                                        </div>
                                    </th>
                                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="ion-ios-pulse text-blue-500"></i>
                                            % Ocupação
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dadosOcupacao.length > 0 ? (
                                    dadosOcupacao.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-calendar text-blue-400"></i>
                                                    <span>{(() => {
                                                        try {
                                                            const date = new Date(item.data);
                                                            if (isNaN(date.getTime())) {
                                                                return item.data || 'Data inválida';
                                                            }
                                                            return date.toLocaleDateString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            });
                                                        } catch {
                                                            return item.data || 'Data inválida';
                                                        }
                                                    })()}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-grid text-gray-400"></i>
                                                    <span>{item.totalVagas}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-close-circle text-red-500"></i>
                                                    <span>{item.ocupadas}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-checkmark-circle text-green-500"></i>
                                                    <span>{item.livres}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-pulse text-blue-400"></i>
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