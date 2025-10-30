"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { VeiculoService, PatioService, API_BASE_URL } from "@/utils/api";
import { DashboardApi } from "@/utils/api/dashboard";
import { VeiculoLocalizacaoResponseDto, VeiculoResponseDto } from "@/types/veiculo";
import { Loader2 } from "lucide-react";
import '@/styles/neumorphic.css';
import {
    ResponsiveContainer,
    PieChart, Pie, Cell, Legend, Tooltip,
    LineChart, Line, CartesianGrid, XAxis, YAxis, Brush,
} from "recharts";
import { StatCard } from "@/components/relogios/StatCard";

type Stats = { totalPatios: number; totalBoxes: number; boxesOcupados: number; totalVeiculos: number; totalClientes: number };

const COLORS = {
    red: "#ef4444",
    blue: "#3b82f6",
    yellow: "#f59e0b",
    purple: "#a855f7",
    pink: "#ec4899",
    cyan: "#06b6d4",
    gray: "#9ca3af",
};

function formatISODate(d: string) {
    if (!d) return '';
    const dt = new Date(d);
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`;
}

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({ totalPatios: 0, totalBoxes: 0, boxesOcupados: 0, totalVeiculos: 0, totalClientes: 0 });
    const [veiculosEstacionados, setVeiculosEstacionados] = useState<VeiculoLocalizacaoResponseDto[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalVehicleData, setModalVehicleData] = useState<VeiculoResponseDto | null>(null);
    const [resumo, setResumo] = useState<{ totalBoxes: number; ocupados: number; livres: number } | null>(null);
    const [serie, setSerie] = useState<Array<{ dia: string; ocupados: number; livres: number }>>([]);
    const [rangeDias, setRangeDias] = useState<7 | 14 | 30>(14);
    const [viewType, setViewType] = useState<'cards' | 'list'>('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [enableRealtime, setEnableRealtime] = useState<boolean>(true);
    const [pollingMs, setPollingMs] = useState<number>(5000);
    const [isLogScale, setIsLogScale] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
            console.log("🔄 Iniciando carregamento do dashboard...");
            setIsLoading(true);
            setError(null);
            try {
                const today = new Date();
                const fim = today.toISOString().slice(0, 10);
                const ini = new Date(today.getTime() - (rangeDias - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

                console.log("📅 Período:", ini, "até", fim);

                const [patiosData, resumoApi, veiculosEstacionadosData, serieApi, totalVeiculos, totalClientes] = await Promise.all([
                    PatioService.listarPaginadoFiltrado({}, 0, 1),
                    DashboardApi.resumo(),
                    VeiculoService.listarEstacionados(),
                    DashboardApi.ocupacaoPorDia(ini, fim),
                    DashboardApi.totalVeiculos(),
                    DashboardApi.totalClientes(),
                ]);

                console.log("✅ Dados carregados:", {
                    patiosData,
                    resumoApi,
                    veiculosEstacionadosData,
                    serieApi,
                    totalVeiculos,
                    totalClientes
                });

                setStats({
                    totalPatios: patiosData.totalElements,
                    totalBoxes: resumoApi.totalBoxes,
                    boxesOcupados: resumoApi.ocupados,
                    totalVeiculos,
                    totalClientes
                });

                setVeiculosEstacionados(veiculosEstacionadosData);
                setResumo(resumoApi);
                setSerie(serieApi);

                console.log("🎯 Dashboard carregado com sucesso!");

            } catch (e: any) {
                console.error("❌ Erro ao carregar dados do dashboard:", e);
                setError("Não foi possível carregar os dados do dashboard. Verifique a conexão com a API.");
            } finally {
                setIsLoading(false);
            }
        }, [rangeDias]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!enableRealtime) return;

        // 1) Tentar SSE para a lista de estacionadas
        const sseUrl = `${API_BASE_URL}/veiculos/estacionados/stream`;
        let es: EventSource | null = null;
        try {
            es = new EventSource(sseUrl);
            es.onopen = () => console.log("🔌 SSE conectado (estacionados)");
            es.onmessage = (ev) => {
                try {
                    const data = JSON.parse(ev.data);
                    if (Array.isArray(data)) {
                        setVeiculosEstacionados(data);
                    }
                } catch {}
            };
            es.onerror = () => {
                console.warn("⚠️ SSE erro (estacionados), fallback para polling");
                es && es.close();
                es = null;
            };
        } catch (e) {
            console.warn("⚠️ Falha ao iniciar SSE (estacionados):", e);
        }

        // 2) Polling de resumo/serie/contagens (mantemos separados do SSE)
        const id = setInterval(() => {
            console.log("⏱️ Polling dashboard (resumo/serie/contagens)...");
            fetchData();
        }, Math.max(5000, pollingMs));

        return () => {
            clearInterval(id);
            if (es) es.close();
        };
    }, [enableRealtime, pollingMs, fetchData]);

    const pieData = useMemo(() => {
        console.log("📊 Processando dados do gráfico pizza:", resumo);
        if (!resumo) {
            console.log("⚠️ Resumo não disponível ainda");
            return [];
        }
        const data = [
            { name: "Ocupados", value: resumo.ocupados, color: COLORS.red },
            { name: "Livres", value: resumo.livres, color: COLORS.blue },
        ];
        console.log("📊 Dados do gráfico pizza:", data);
        return data;
    }, [resumo]);

    const lineData = useMemo(
        () => (serie || []).map((x) => ({ ...x, diaLabel: formatISODate(x.dia) })),
        [serie]
    );

    const handleOpenModal = async (veiculoId: number) => {
        try {
            const result = await VeiculoService.getById(veiculoId);
            setModalVehicleData(result);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Erro ao buscar detalhes do veículo:", error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalVehicleData(null);
    };

    // Lógica de paginação
    const totalPages = Math.ceil(veiculosEstacionados.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVeiculos = veiculosEstacionados.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(0); // Reset para primeira página
    };

    console.log("🔍 Estado do dashboard:", { isLoading, error, stats, resumo, serie });

    if (isLoading) {
        console.log("⏳ Mostrando tela de loading...");
        return (
            <div className="flex justify-center items-center min-h-screen relative z-10">
                    <div className="flex flex-col items-center gap-2 text-white">
                        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
                        <span>Carregando dados do dashboard...</span>
                    </div>
                </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4 relative z-10">
                    <div className="text-center bg-red-900/50 p-8 rounded-lg">
                        <i className="ion-ios-warning mx-auto text-red-500 text-6xl"></i>
                        <p className="mt-4 text-red-400">{error}</p>
                    </div>
                </div>
        );
    }

    return (
        <>
        <div className="min-h-screen text-white p-4 md:p-8 pb-64 relative z-10">
                <div className="container mx-auto space-y-8 mb-12">
                    <h1 className="text-3xl font-bold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>Dashboard Gerencial</h1>

                    {/* Cards Estatísticos com Responsividade Melhorada */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <StatCard 
                            title="Pátios Totais" 
                            value={stats.totalPatios} 
                            icon={<i className="ion-ios-home text-blue-500 text-xl"></i>} 
                            colorScheme="blue"
                        />
                        <StatCard 
                            title="Vagas Totais" 
                            value={stats.totalBoxes} 
                            icon={<i className="ion-ios-grid text-emerald-600 text-xl"></i>}
                            colorScheme="emerald"
                        />
                        <StatCard 
                            title="Total de Box" 
                            value={stats.totalBoxes} 
                            icon={<i className="ion-ios-square text-indigo-500 text-xl"></i>}
                            colorScheme="indigo"
                        />
                        <StatCard 
                            title="Vagas Ocupadas" 
                            value={stats.boxesOcupados} 
                            icon={<i className="ion-ios-car text-orange-500 text-xl"></i>}
                            colorScheme="orange"
                        />
                        <StatCard 
                            title="Motos Cadastradas" 
                            value={stats.totalVeiculos} 
                            icon={<i className="ion-ios-bicycle text-purple-500 text-xl"></i>}
                            colorScheme="purple"
                        />
                        <StatCard 
                            title="Clientes Cadastrados" 
                            value={stats.totalClientes} 
                            icon={<i className="ion-ios-people text-cyan-500 text-xl"></i>}
                            colorScheme="cyan"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <section className="neumorphic-container p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                            <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-pie-chart mr-2 text-blue-500 text-xl"></i> Estado Atual de Ocupação
                            </h2>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} isAnimationActive>
                                            {pieData.map((entry, i) => ( <Cell key={i} fill={entry.color} /> ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", color: "#111827" }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                        <section className="neumorphic-container p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-analytics mr-2 text-emerald-600 text-xl"></i> Ocupação por Dia
                                </h2>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Período:</span>
                                    {[7, 14, 30].map((n) => (
                                        <button key={n} onClick={() => setRangeDias(n as 7 | 14 | 30)}
                                                className={`px-2 py-1 rounded border transition-all duration-200 hover:scale-110 ${rangeDias === n ? "bg-blue-100 border-blue-400 text-blue-800" : "border-slate-300 hover:bg-slate-50 text-slate-600"}`}
                                                style={{fontFamily: 'Montserrat, sans-serif'}}>
                                            {n}d
                                        </button>
                                    ))}
                                <span className="ml-3 text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Tempo real:</span>
                                <button
                                    onClick={() => setEnableRealtime(v => !v)}
                                    className={`px-2 py-1 rounded border transition-all duration-200 ${enableRealtime ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                                    title="Ativar/desativar atualização automática"
                                >
                                    {enableRealtime ? 'ON' : 'OFF'}
                                </button>
                                <span className="ml-3 text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>Escala log:</span>
                                <button
                                    onClick={() => setIsLogScale(v => !v)}
                                    className={`px-2 py-1 rounded border transition-all duration-200 ${isLogScale ? 'bg-purple-100 border-purple-400 text-purple-800' : 'border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                                    title="Alternar escala logarítmica no eixo Y"
                                >
                                    {isLogScale ? 'LOG' : 'LIN'}
                                </button>
                                </div>
                            </div>
                            <div className="w-full h-96">
                                <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                                <LineChart data={lineData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="diaLabel" />
                                    {isLogScale ? (
                                        <YAxis
                                            allowDecimals={false}
                                            scale="log"
                                            domain={[1, 'auto']}
                                            allowDataOverflow
                                            tickFormatter={(v) => `${Math.round(v as number)}`}
                                        />
                                    ) : (
                                        <YAxis allowDecimals={false} />
                                    )}
                                        <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", color: "#111827" }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="ocupados" name="Ocupados" stroke={COLORS.red} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="livres" name="Livres" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} />
                                        <Brush height={20} travellerWidth={8} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </div>

                    <div className="neumorphic-fieldset p-6 mb-8">
                        <legend className="neumorphic-legend flex items-center mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-car mr-2 text-purple-500 text-xl"></i> Motos Estacionadas
                        </legend>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            {/* Controle de Itens por Página - à esquerda */}
                            <div className="flex items-center gap-2 mb-4 sm:mb-0">
                                <label className="text-sm text-slate-700 font-medium">Itens por página:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                    className="neumorphic-input text-sm"
                                    style={{fontFamily: 'Montserrat, sans-serif'}}
                                    title="Selecionar quantidade de itens por página"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            
                            {/* Toggle de Visualização - à direita */}
                            <div className="flex bg-zinc-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewType('cards')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                        viewType === 'cards' 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    <i className={`ion-ios-apps ${viewType === 'cards' ? 'text-white' : 'text-zinc-400'}`}></i>
                                    Cards
                                </button>
                                <button
                                    onClick={() => setViewType('list')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                        viewType === 'list' 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    <i className={`ion-ios-list ${viewType === 'list' ? 'text-white' : 'text-zinc-400'}`}></i>
                                    Lista
                                </button>
                            </div>
                        </div>

                        {viewType === 'cards' ? (
                            // Visualização em Cards
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                {currentVeiculos.length > 0 ? (
                                    currentVeiculos.map((v) => (
                                        <div key={v.idVeiculo} className="neumorphic-card-gradient p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {v.idVeiculo}</span>
                                                    <h3 className="text-lg font-bold text-[var(--color-mottu-dark)] font-mono" style={{fontFamily: 'Montserrat, sans-serif'}}>{v.placa}</h3>
                                                </div>
                                                <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-0.5 rounded-full" style={{fontFamily: 'Montserrat, sans-serif'}}>Estacionada</span>
                                            </div>
                                            <div className="space-y-3 text-sm mb-4">
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-bicycle text-blue-500"></i>
                                                    <span className="text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Modelo:</strong> {v.modelo}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-square text-yellow-500"></i>
                                                    <span className="text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Box:</strong> {v.boxAssociado?.nome}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <i className="ion-ios-home text-red-500"></i>
                                                    <span className="text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Pátio:</strong> {v.patioAssociado?.nomePatio || "-"}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleOpenModal(v.idVeiculo)}
                                                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 hover:scale-110"
                                                    title="Ver Detalhes"
                                                >
                                                    <i className="ion-ios-eye text-xl"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10">
                                        <i className="ion-ios-bicycle text-purple-400 mb-2" style={{fontSize: '48px'}}></i>
                                        <p className="text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>Nenhuma moto estacionada no momento.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Visualização em Lista (original)
                            <div className="neumorphic-container p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Matrícula</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Modelo</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Localização (Box)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Pátio</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Ações</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                        {currentVeiculos.length > 0 ? (
                                            currentVeiculos.map((v) => (
                                                <tr key={v.idVeiculo} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>{v.placa}</td>
                                                    <td className="px-4 py-3 text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>{v.modelo}</td>
                                                    <td className="px-4 py-3 text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>{v.boxAssociado?.nome}</td>
                                                    <td className="px-4 py-3 text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>{v.patioAssociado?.nomePatio || "-"}</td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleOpenModal(v.idVeiculo)}
                                                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 hover:scale-110"
                                                            title="Ver Detalhes"
                                                        >
                                                            <i className="ion-ios-eye text-xl"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center p-6 text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    Nenhuma moto estacionada no momento.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Controles de Paginação */}
                        {veiculosEstacionados.length > 0 && (
                            <div className="mt-12 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-700 font-medium">
                                        Mostrando {startIndex + 1} a {Math.min(endIndex, veiculosEstacionados.length)} de {veiculosEstacionados.length} motos
                                    </span>
                                </div>
                                
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="neumorphic-button text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="ion-ios-arrow-back mr-1"></i> Anterior
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i + 1)}
                                                    className={`px-2 py-1 rounded text-xs transition-all duration-300 hover:scale-110 ${
                                                        currentPage === i + 1
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-zinc-700 hover:bg-zinc-600 text-slate-300'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                            className="neumorphic-button text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Próxima <i className="ion-ios-arrow-forward ml-1"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && modalVehicleData && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseModal}>
                    <div className="bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-md text-white border border-zinc-700 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
                                <i className="ion-ios-bicycle text-emerald-400 text-2xl"></i> Detalhes da Moto
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-zinc-800 transition-colors" title="Fechar modal">
                                <i className="ion-ios-close text-zinc-400 text-xl"></i>
                            </button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">Placa</dt>
                                <dd className="font-mono text-emerald-300">{modalVehicleData.placa}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">Modelo</dt>
                                <dd className="text-white">{modalVehicleData.modelo}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">Fabricante</dt>
                                <dd className="text-white">{modalVehicleData.fabricante}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">RENAVAM</dt>
                                <dd className="font-mono text-zinc-300">{modalVehicleData.renavam}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">Chassi</dt>
                                <dd className="font-mono text-zinc-300">{modalVehicleData.chassi}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">Ano</dt>
                                <dd className="text-white">{modalVehicleData.ano}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">Combustível</dt>
                                <dd className="text-white">{modalVehicleData.combustivel}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700 pb-2">
                                <dt className="text-zinc-400 font-medium">Status</dt>
                                <dd>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        modalVehicleData.status === 'OPERACIONAL'
                                            ? 'bg-emerald-600/20 text-emerald-400'
                                            : modalVehicleData.status === 'EM_MANUTENCAO'
                                                ? 'bg-amber-600/20 text-amber-400'
                                                : 'bg-zinc-600/20 text-zinc-400'
                                    }`}>
                                        {modalVehicleData.status}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-400 font-medium">Tag BLE ID</dt>
                                <dd className="font-mono text-zinc-300">{modalVehicleData.tagBleId || 'N/A'}</dd>
                            </div>
                        </dl>
                        <div className="mt-6 text-right">
                            <button onClick={handleCloseModal} className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}