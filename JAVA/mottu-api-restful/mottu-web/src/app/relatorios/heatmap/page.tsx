"use client";

import { useState, useEffect } from 'react';
import { buildApiUrl } from '@/config/api';
import { fetchWithCache } from '@/cache/cache';
import ParticleBackground from '@/components/particula/ParticleBackground';
import HeatmapVisual from '@/components/heatmap/HeatmapVisual';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PatioData {
    id: number;
    nome: string;
    ocupacaoAtual: number;
    media: number;
    maxima: number;
    trend: 'crescendo' | 'diminuindo' | 'estavel';
    boxes: Array<{
        id: string;
        status: 'ocupado' | 'livre';
        veiculo?: string;
    }>;
}

export default function HeatmapPage() {
    const [patios, setPatios] = useState<PatioData[]>([]);
    const [filtroPatio, setFiltroPatio] = useState<string>('todos');
    const [visualizacao, setVisualizacao] = useState<'heatmap' | 'grafico' | 'tabela'>('heatmap');
    const [loading, setLoading] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const cardsPorPagina = 12;

    useEffect(() => {
        carregarDadosHeatmap();
        // Atualização em tempo real (polling)
        const id = setInterval(() => {
            carregarDadosHeatmap();
        }, 10000); // 10s
        // WebSocket/SSE via EventSource (preferencial quando disponível)
        let es: EventSource | null = null;
        try {
            const streamUrl = buildApiUrl('/api/relatorios/ocupacao/stream');
            es = new EventSource(streamUrl);
            es.onmessage = (ev) => {
                try {
                    const payload = JSON.parse(ev.data);
                    if (Array.isArray(payload)) {
                        // Atualiza somente métricas de ocupação mantendo boxes existentes
                        setPatios(prev => {
                            const mapPrev = new Map(prev.map(p => [p.id, p]));
                            payload.forEach((dto: any) => {
                                const id = dto.patioId;
                                const exist = mapPrev.get(id);
                                const nome = dto.nomePatio || exist?.nome || `Pátio ${id}`;
                                const taxa = Math.round(dto.taxaOcupacao ?? exist?.ocupacaoAtual ?? 0);
                                const media = Math.round(dto.taxaOcupacao ?? exist?.media ?? taxa);
                                const maxima = Math.max(media, exist?.maxima ?? taxa);
                                const trend = taxa > (exist?.media ?? media) * 1.1 ? 'crescendo' : (taxa < (exist?.media ?? media) * 0.9 ? 'diminuindo' : 'estavel');
                                mapPrev.set(id, {
                                    id,
                                    nome,
                                    ocupacaoAtual: taxa,
                                    media,
                                    maxima,
                                    trend,
                                    boxes: exist?.boxes ?? []
                                });
                            });
                            return Array.from(mapPrev.values());
                        });
                    }
                } catch {}
            };
        } catch {}
        return () => {
            clearInterval(id);
            if (es) es.close();
        };
    }, []);

    const normalizarStatus = (status: any, veiculo: any) => {
        try {
            if (status == null || status == undefined || status === '') {
                return veiculo ? 'ocupado' : 'livre';
            }
            const s = String(status).toLowerCase();
            if (s === 'o' || s.includes('ocupado')) return 'ocupado';
            if (s === 'l' || s.includes('livre')) return 'livre';
            if (s === 'm' || s.includes('manut')) return 'manutencao';
            // fallback: se tem veículo, considera ocupado
            return veiculo ? 'ocupado' : 'livre';
        } catch {
            return veiculo ? 'ocupado' : 'livre';
        }
    };

    const carregarBoxesReais = async (patioId: number) => {
        // Validar se o ID é válido
        if (!patioId || patioId === undefined || patioId === null) {
            console.warn('ID do pátio inválido:', patioId);
            return gerarBoxesMock(patioId);
        }
        
        try {
            console.log(`🔍 Buscando boxes para pátio ID: ${patioId} usando nova API de estacionamentos`);
            
            const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8080';
            
            // Buscar boxes e estacionamentos ativos em paralelo usando a nova API
            const [boxesResponse, estacionamentosResponse] = await Promise.all([
                fetch(`${backendOrigin}/api/patios/${patioId}/status/A/boxes?page=0&size=1000&sort=nome,asc`, {
                    cache: 'no-store'
                }),
                fetch(`${backendOrigin}/api/estacionamentos/patio/${patioId}/ativos`, {
                    cache: 'no-store'
                })
            ]);
            
            if (!boxesResponse.ok) {
                const errorText = await boxesResponse.text();
                console.error(`❌ Erro ao buscar boxes do pátio ${patioId}:`, boxesResponse.status, errorText);
                return gerarBoxesMock(patioId);
            }
            
            const boxesPage = await boxesResponse.json();
            const boxes = boxesPage.content || boxesPage || [];
            
            const estacionamentosAtivos = estacionamentosResponse.ok 
                ? await estacionamentosResponse.json() 
                : [];
            
            console.log(`📊 Boxes encontrados: ${boxes.length}, Estacionamentos ativos: ${estacionamentosAtivos.length}`);
            
            // Criar mapa de estacionamentos por boxId
            const estacionamentosPorBoxId = new Map(
                estacionamentosAtivos.map((e: any) => {
                    const boxId = e.box?.idBox || e.boxId;
                    return boxId ? [boxId, e] : null;
                }).filter((item): item is [number, any] => item !== null)
            );
            
            // Processar boxes reais combinando com estacionamentos
            if (Array.isArray(boxes) && boxes.length > 0) {
                const boxesProcessados = boxes.map((box: any, index: number) => {
                    const boxId = box.idBox || box.id;
                    const estacionamento = estacionamentosPorBoxId.get(boxId);
                    
                    // Determinar status baseado em estacionamento ativo
                    let statusNorm: 'ocupado' | 'livre' | 'manutencao';
                    if (estacionamento) {
                        // Verificar se o veículo está em manutenção
                        const statusVeiculo = estacionamento.veiculo?.status;
                        if (statusVeiculo === 'EM_MANUTENCAO') {
                            statusNorm = 'manutencao';
                        } else {
                            statusNorm = 'ocupado';
                        }
                    } else {
                        // Se não há estacionamento ativo, verificar status do box
                        const statusBox = box.status || box.situacao || box.estado;
                        statusNorm = normalizarStatus(statusBox, null);
                    }
                    
                    const veiculoInfo = estacionamento?.veiculo;
                    const placa = veiculoInfo?.placa || undefined;
                    
                    return {
                        id: String(boxId || `box-${patioId}-${index + 1}`),
                        numero: box.nome || box.numeroBox || box.numero || index + 1,
                        status: statusNorm,
                        veiculo: placa,
                        placa: placa
                    };
                });
                
                console.log(`✅ Boxes processados para pátio ${patioId}:`, boxesProcessados.length);
                return boxesProcessados;
            } else {
                console.warn(`⚠️ Nenhum box encontrado para pátio ${patioId}`);
                return gerarBoxesMock(patioId);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar boxes do pátio ${patioId}:`, error);
            return gerarBoxesMock(patioId);
        }
    };

    const gerarBoxesMock = (patioId: number) => {
        const totalBoxes = 20;
        const boxes = [];
        
        for (let i = 1; i <= totalBoxes; i++) {
            // Gerar status aleatório com mais boxes livres
            const random = Math.random();
            let status: 'ocupado' | 'livre' | 'manutencao';
            
            if (random < 0.3) {
                status = 'ocupado';
            } else if (random < 0.9) {
                status = 'livre';
            } else {
                status = 'manutencao';
            }
            
            const box = {
                id: `box-${patioId}-${i}`,
                numero: i,
                status: status,
                veiculo: status === 'ocupado' ? `ABC${String(i).padStart(4, '0')}` : undefined,
                placa: status === 'ocupado' ? `ABC${String(i).padStart(4, '0')}` : undefined
            };
            
            console.log(`Box ${i} gerado:`, {
                id: box.id,
                numero: box.numero,
                status: box.status,
                tipoStatus: typeof box.status,
                veiculo: box.veiculo
            });
            boxes.push(box);
        }
        
        console.log(`Gerando ${totalBoxes} boxes mock para pátio ${patioId}:`, boxes);
        return boxes;
    };

    const carregarDadosHeatmap = async () => {
        setLoading(true);
        try {
            // Usar cache otimizado para relatórios
            const { RelatoriosApi } = await import('@/utils/api/relatorios');
            const dadosOcupacao = await RelatoriosApi.getOcupacaoAtual();
            console.log('Dados de ocupação recebidos:', dadosOcupacao);
                
            // Buscar dados dos pátios
            const patiosData = await fetchWithCache<any>('/api/patios?size=100', 'entidades');
            if (patiosData) {
                console.log('Dados de pátios recebidos:', patiosData);
                
                // Verificar se patiosData tem content (Page object)
                const patiosArray = patiosData.content || patiosData;
                if (Array.isArray(patiosArray)) {
                    // Processar dados reais e carregar boxes
                    const patiosProcessados: PatioData[] = await Promise.all(
                        patiosArray.map(async (patio: any) => {
                            console.log('Processando pátio:', patio);
                            
                            // Verificar se o pátio tem ID válido
                            if (!patio.idPatio) {
                                console.warn('Pátio sem ID válido:', patio);
                                return null;
                            }
                            
                            const ocupacaoPatio = dadosOcupacao.find((o: any) => o.patioId === patio.idPatio);
                            
                            // Carregar boxes reais do banco de dados apenas se o ID for válido
                            const boxesReais = await carregarBoxesReais(patio.idPatio);
                            
                            console.log(`=== PROCESSANDO PÁTIO ${patio.idPatio} ===`);
                            console.log('Boxes carregados:', boxesReais);
                            console.log('Quantidade de boxes:', boxesReais.length);
                            
                            const patioProcessado = {
                                id: patio.idPatio,
                                nome: patio.nomePatio || patio.nome || 'Pátio sem nome',
                                ocupacaoAtual: ocupacaoPatio ? ocupacaoPatio.taxaOcupacao : 0,
                                media: ocupacaoPatio ? ocupacaoPatio.taxaOcupacao : 0,
                                maxima: ocupacaoPatio ? ocupacaoPatio.taxaOcupacao : 0,
                                trend: calcularTrend(ocupacaoPatio),
                                boxes: boxesReais
                            };
                            
                            console.log('Pátio processado:', patioProcessado);
                            return patioProcessado;
                        })
                    );
                    
                    // Filtrar pátios válidos (remover nulls)
                    const patiosValidos = patiosProcessados.filter(patio => patio !== null);
                    
                    console.log('Pátios processados com boxes reais:', patiosValidos);
                    setPatios(patiosValidos);
                } else {
                    console.warn('Dados de pátios não são um array:', patiosData);
                    setPatios([]);
                }
            } else {
                console.error('Erro ao buscar pátios: dados não disponíveis');
                setPatios([]);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do heatmap:', error);
            setPatios([]);
        } finally {
            setLoading(false);
        }
    };


    const calcularTrend = (dados: any) => {
        if (!dados) return 'estavel';
        
        const atual = dados.taxaOcupacao || 0;
        const media = dados.mediaOcupacao || 0;
        
        if (atual > media * 1.1) return 'crescendo';
        if (atual < media * 0.9) return 'diminuindo';
        return 'estavel';
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'crescendo': return 'ion-ios-trending-up';
            case 'diminuindo': return 'ion-ios-trending-down';
            case 'estavel': return 'ion-ios-refresh';
            default: return 'ion-ios-help';
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'crescendo': return 'text-red-500';
            case 'diminuindo': return 'text-green-500';
            case 'estavel': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const getOcupacaoColor = (ocupacao: number) => {
        if (ocupacao >= 90) return '#ef4444'; // vermelho
        if (ocupacao >= 70) return '#f59e0b'; // amarelo
        if (ocupacao >= 50) return '#f97316'; // laranja
        return '#10b981'; // verde
    };

    const patiosFiltrados = filtroPatio === 'todos' 
        ? patios 
        : patios.filter(p => p.id.toString() === filtroPatio);

    // Paginação: mostrar máximo 12 cards por página
    const totalPaginas = Math.ceil(patiosFiltrados.length / cardsPorPagina);
    const indiceInicio = (paginaAtual - 1) * cardsPorPagina;
    const indiceFim = indiceInicio + cardsPorPagina;
    const patiosPaginados = patiosFiltrados.slice(indiceInicio, indiceFim);

    // Resetar página quando mudar filtro
    useEffect(() => {
        setPaginaAtual(1);
    }, [filtroPatio]);

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
                                className="mr-2 lg:mr-4 p-2 text-gray-600 hover:text-red-500 rounded-lg transition-colors"
                                title="Voltar para Início"
                            >
                                <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                            </a>
                            <div>
                                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-map text-red-500 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                                    Heatmap de Ocupação
                                </h1>
                                <p className="text-gray-600 text-sm lg:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Análise visual da ocupação dos pátios
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <i className="ion-ios-funnel text-red-500"></i>
                                    Filtro
                                </label>
                                <select
                                    value={filtroPatio}
                                    onChange={(e) => setFiltroPatio(e.target.value)}
                                    className="neumorphic-select"
                                >
                                    <option value="todos">Todos</option>
                                    {patios.map(p => (
                                        <option key={p.id} value={p.id.toString()}>{p.nome}</option>
                                    ))}
                                </select>
                            </div>
                            {/* legenda removida conforme solicitado */}
                        </div>
                    </div>
                </div>

                {/* Navegação por Abas */}
                <div className="neumorphic-container mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setVisualizacao('heatmap')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                visualizacao === 'heatmap'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <i className="ion-ios-map mr-2"></i>
                            Heatmap
                        </button>
                        <button
                            onClick={() => setVisualizacao('grafico')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                visualizacao === 'grafico'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <i className="ion-ios-analytics mr-2"></i>
                            Gráfico
                        </button>
                        <button
                            onClick={() => setVisualizacao('tabela')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                visualizacao === 'tabela'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <i className="ion-ios-list mr-2"></i>
                            Tabela
                        </button>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                {loading ? (
                    <div className="neumorphic-container p-8 text-center">
                        <i className="ion-ios-refresh animate-spin text-2xl text-gray-500 mb-2"></i>
                        <p className="text-gray-500">Carregando dados do heatmap...</p>
                    </div>
                ) : patiosFiltrados.length === 0 ? (
                    <div className="neumorphic-container p-8 text-center">
                        <i className="ion-ios-map text-6xl text-gray-400 mb-4"></i>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum Dado Disponível</h3>
                        <p className="text-gray-500 mb-4">Não há dados de ocupação para exibir no heatmap.</p>
                        <button
                            onClick={carregarDadosHeatmap}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <i className="ion-ios-refresh mr-2"></i>
                            Tentar Novamente
                        </button>
                    </div>
                ) : (
                    <>
                        {visualizacao === 'heatmap' && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {patiosPaginados.map((patio, index) => (
                                        <HeatmapVisual 
                                            key={`patio-${patio.id}-${index}`}
                                            patio={patio}
                                            showNumbers={true}
                                            showPlacas={false}
                                        />
                                    ))}
                                </div>
                                
                                {/* Controles de Paginação */}
                                {totalPaginas > 1 && (
                                    <div className="flex items-center justify-center mt-8 gap-4">
                                        <button
                                            onClick={() => setPaginaAtual(pag => Math.max(1, pag - 1))}
                                            disabled={paginaAtual === 1}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                paginaAtual === 1 
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                            }`}
                                        >
                                            <i className="ion-ios-arrow-back mr-2"></i>
                                            Anterior
                                        </button>
                                        
                                        <span className="text-gray-700 font-medium">
                                            Página {paginaAtual} de {totalPaginas}
                                        </span>
                                        
                                        <button
                                            onClick={() => setPaginaAtual(pag => Math.min(totalPaginas, pag + 1))}
                                            disabled={paginaAtual === totalPaginas}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                paginaAtual === totalPaginas 
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                            }`}
                                        >
                                            Próxima
                                            <i className="ion-ios-arrow-forward ml-2"></i>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {visualizacao === 'grafico' && (
                            <div className="space-y-6">
                                {(() => {
                                    // Dados ajustados para escala log (evitar 0)
                                    const palette = [
                                        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#22c55e',
                                        '#eab308', '#0ea5e9', '#a855f7', '#14b8a6', '#f43f5e', '#64748b'
                                    ];
                                    const colorByPatio = new Map<number, string>();
                                    const getPatioColor = (id:number, idx:number) => {
                                        if (!colorByPatio.has(id)) colorByPatio.set(id, palette[idx % palette.length]);
                                        return colorByPatio.get(id)!;
                                    };

                                    const chartData = patiosFiltrados.map((p, idx) => ({
                                        ...p,
                                        index: idx,
                                        ocupacaoAtualLog: Math.max(1, p.ocupacaoAtual),
                                        mediaLog: Math.max(1, p.media),
                                        maximaLog: Math.max(1, p.maxima),
                                        color: getPatioColor(p.id, idx)
                                    }));
                                    return (
                                        <>
                                {/* Gráfico de Barras - Ocupação por Pátio */}
                                <div className="neumorphic-container">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Ocupação por Pátio
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="nome" interval={0} angle={-30} textAnchor="end" height={60} />
                                                        <YAxis scale="log" domain={[1, 100]} allowDataOverflow tickCount={6} />
                                                        <Tooltip formatter={(v: unknown, n: unknown, props: unknown) => {
                                                            const payload = (props as any)?.payload ?? {};
                                                            return [`${payload.ocupacaoAtual ?? 0}%`, 'Ocupação Atual'];
                                                        }} />
                                                        <Bar dataKey="ocupacaoAtualLog" name="Ocupação Atual (%)" barSize={10} radius={[4,4,0,0]}>
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-bar-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfico de Pizza - Distribuição de Ocupação */}
                                <div className="neumorphic-container">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Distribuição de Ocupação
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData.map(patio => ({
                                                        name: patio.nome,
                                                        value: patio.ocupacaoAtual,
                                                        color: patio.color
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    height={36}
                                                    wrapperStyle={{ fontSize: '12px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfico de Linha - Tendências */}
                                <div className="neumorphic-container">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Comparação de Métricas
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="nome" interval={0} angle={-30} textAnchor="end" height={60} />
                                                <YAxis scale="log" domain={[1, 100]} allowDataOverflow tickCount={6} />
                                                <Tooltip formatter={(v: unknown, n: unknown, props: unknown) => {
                                                    const name = String(n ?? '');
                                                    const payload = (props as any)?.payload ?? {};
                                                    if (name.includes('Ocupação')) return [`${payload.ocupacaoAtual ?? 0}%`, 'Ocupação Atual'];
                                                    if (name.includes('Média')) return [`${payload.media ?? 0}%`, 'Média'];
                                                    if (name.includes('Máxima')) return [`${payload.maxima ?? 0}%`, 'Máxima'];
                                                    return [v as any, name];
                                                }} />
                                                <Legend />
                                                <Line type="monotone" dataKey="ocupacaoAtualLog" stroke="#ef4444" strokeWidth={2} name="Ocupação Atual (%)" dot={false} />
                                                <Line type="monotone" dataKey="mediaLog" stroke="#3b82f6" strokeWidth={2} name="Média (%)" dot={false} />
                                                <Line type="monotone" dataKey="maximaLog" stroke="#f59e0b" strokeWidth={2} name="Máxima (%)" dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {visualizacao === 'tabela' && (
                            <div className="neumorphic-container overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        Dados Detalhados dos Pátios
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-home text-gray-600"></i>
                                                        Pátio
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-pulse text-blue-500"></i>
                                                        Ocupação Atual
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-analytics text-indigo-500"></i>
                                                        Média
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-trending-up text-orange-500"></i>
                                                        Máxima
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-arrow-round-forward text-purple-500"></i>
                                                        Tendência
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-close-circle text-red-500"></i>
                                                        Boxes Ocupados
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <i className="ion-ios-checkmark-circle text-green-500"></i>
                                                        Boxes Livres
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {patiosFiltrados.map((patio, index) => {
                                                const boxesOcupados = patio.boxes.filter(box => box.status === 'ocupado').length;
                                                const boxesLivres = patio.boxes.filter(box => box.status === 'livre').length;
                                                
                                                return (
                                                    <tr key={`patio-row-${patio.id}-${index}`} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <i className="ion-ios-home text-gray-500"></i>
                                                                <span>{patio.nome}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <i className="ion-ios-pulse text-blue-500"></i>
                                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                                    <div 
                                                                        className="h-2 rounded-full"
                                                                        style={{ 
                                                                            width: `${patio.ocupacaoAtual}%`,
                                                                            backgroundColor: getOcupacaoColor(patio.ocupacaoAtual)
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-900">{patio.ocupacaoAtual}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center gap-2">
                                                                <i className="ion-ios-analytics text-indigo-500"></i>
                                                                <span>{patio.media}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center gap-2">
                                                                <i className="ion-ios-trending-up text-orange-500"></i>
                                                                <span>{patio.maxima}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                patio.trend === 'crescendo' ? 'bg-red-100 text-red-800' :
                                                                patio.trend === 'diminuindo' ? 'bg-green-100 text-green-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                <i className={`${getTrendIcon(patio.trend)} mr-1`}></i>
                                                                <span className="capitalize">{patio.trend}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <i className="ion-ios-close-circle text-red-500"></i>
                                                                <span>{boxesOcupados}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <i className="ion-ios-checkmark-circle text-green-500"></i>
                                                                <span>{boxesLivres}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
                </div>
            </div>
        </div>
    );
}
