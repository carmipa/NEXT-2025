"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/nav-bar";
import { VeiculoService, PatioService, BoxService } from "@/utils/api";
import { DashboardApi } from "@/utils/api/dashboard";
import { VeiculoLocalizacaoResponseDto } from "@/types/veiculo";
import { Loader2, ParkingSquare, Car, MapPinned, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
    ResponsiveContainer,
    PieChart, Pie, Cell, Legend, Tooltip,
    LineChart, Line, CartesianGrid, XAxis, YAxis, Brush,
} from "recharts";

type Stats = { totalPatios: number; totalBoxes: number; boxesOcupados: number };

// paleta sem verde
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
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`;
}

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState<Stats>({ totalPatios: 0, totalBoxes: 0, boxesOcupados: 0 });
    const [veiculosEstacionados, setVeiculosEstacionados] = useState<VeiculoLocalizacaoResponseDto[]>([]);

    // gráficos
    const [resumo, setResumo] = useState<{ totalBoxes: number; ocupados: number; livres: number } | null>(null);
    const [serie, setSerie] = useState<Array<{ dia: string; ocupados: number; livres: number }>>([]);
    const [rangeDias, setRangeDias] = useState<7 | 14 | 30>(14);
    const [chartLoading, setChartLoading] = useState(false);
    const [show, setShow] = useState<{ ocupados: boolean; livres: boolean }>({ ocupados: true, livres: true });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const today = new Date();
                const fim = today.toISOString().slice(0, 10);
                const ini = new Date(today.getTime() - (rangeDias - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

                const [patiosData, boxesData, resumoApi, serieApi] = await Promise.all([
                    PatioService.listarPaginadoFiltrado({}, 0, 1),
                    BoxService.listarPaginadoFiltrado({}, 0, 500),
                    DashboardApi.resumo(),
                    DashboardApi.ocupacaoPorDia(ini, fim),
                ]);

                const boxesOcupados = (boxesData.content || []).filter((b: any) => b.status === "O");
                const veiculosPromises = boxesOcupados.map(async (box: any) => {
                    try {
                        const veiculoPage = await VeiculoService.buscarPorFiltro({ boxNome: box.nome }, 0, 1);
                        if (veiculoPage.content.length > 0) {
                            return VeiculoService.getLocalizacao(veiculoPage.content[0].idVeiculo);
                        }
                        return null;
                    } catch {
                        return null;
                    }
                });
                const veiculosComLocalizacao = (await Promise.all(veiculosPromises)).filter(Boolean) as VeiculoLocalizacaoResponseDto[];

                setStats({ totalPatios: patiosData.totalElements, totalBoxes: boxesData.totalElements, boxesOcupados: boxesOcupados.length });
                setVeiculosEstacionados(veiculosComLocalizacao);
                setResumo(resumoApi);
                setSerie(serieApi);
            } catch (e: any) {
                console.error("Erro ao carregar dados do dashboard:", e);
                setError("Não foi possível carregar os dados do dashboard. Verifique a conexão com a API.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const loadSerie = async () => {
            setChartLoading(true);
            try {
                const today = new Date();
                const fim = today.toISOString().slice(0, 10);
                const ini = new Date(today.getTime() - (rangeDias - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                const serieApi = await DashboardApi.ocupacaoPorDia(ini, fim);
                setSerie(serieApi);
            } catch (e) {
                console.error(e);
            } finally {
                setChartLoading(false);
            }
        };
        loadSerie();
    }, [rangeDias]);

    const pieData = useMemo(() => {
        if (!resumo) return [];
        return [
            { name: "Ocupados", value: resumo.ocupados, color: COLORS.red },
            { name: "Livres", value: resumo.livres, color: COLORS.blue },
        ];
    }, [resumo]);

    const lineData = useMemo(
        () => (serie || []).map((x) => ({ ...x, diaLabel: formatISODate(x.dia) })),
        [serie]
    );

    const isPieEmpty = !!resumo && resumo.ocupados === 0 && resumo.livres === 0;
    const isLineEmpty = (serie ?? []).length === 0;

    const toggleLine = (key: "ocupados" | "livres") =>
        setShow((s) => ({ ...s, [key]: !s[key] }));

    if (isLoading) {
        return (
            <>
                <NavBar active="dashboard" />
                <main className="flex justify-center items-center min-h-screen bg-black">
                    <div className="flex flex-col items-center gap-2 text-white">
                        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" />
                        <span>Carregando dados do dashboard...</span>
                    </div>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavBar active="dashboard" />
                <main className="flex justify-center items-center min-h-screen bg-black p-4">
                    <div className="text-center bg-red-900/50 p-8 rounded-lg">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                        <p className="mt-4 text-red-400">{error}</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="dashboard" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">Dashboard Gerencial</h1>

                    {/* Cards de resumo (mantidos no seu tema) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[var(--color-mottu-default)] p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                <MapPinned /> Pátios Totais
                            </h2>
                            <p className="text-4xl font-bold text-white">{stats.totalPatios}</p>
                        </div>
                        <div className="bg-[var(--color-mottu-default)] p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                <ParkingSquare /> Vagas Totais (Boxes)
                            </h2>
                            <p className="text-4xl font-bold text-white">{stats.totalBoxes}</p>
                        </div>
                        <div className="bg-[var(--color-mottu-default)] p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                <Car /> Vagas Ocupadas
                            </h2>
                            <p className="text-4xl font-bold text-white">{stats.boxesOcupados}</p>
                        </div>
                    </div>

                    {/* GRÁFICOS com fundo branco */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Pizza */}
                        <section className="bg-white text-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-200">
                            <h2 className="text-xl font-semibold mb-4">Estado Atual de Ocupação</h2>
                            {isPieEmpty ? (
                                <div className="w-full h-80 flex items-center justify-center text-zinc-500">
                                    Sem dados de ocupação no momento.
                                </div>
                            ) : (
                                <div className="w-full h-80">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={70}
                                                outerRadius={110}
                                                isAnimationActive
                                                label
                                            >
                                                {pieData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(val: any, name) => [`${val} boxes`, name as string]}
                                                contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", color: "#111827" }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>

                        {/* Linha */}
                        <section className="bg-white text-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Ocupação por Dia</h2>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-zinc-700">Período:</span>
                                    {[7, 14, 30].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setRangeDias(n as 7 | 14 | 30)}
                                            className={`px-2 py-1 rounded border ${
                                                rangeDias === n ? "bg-zinc-100 border-zinc-400" : "border-zinc-300 hover:bg-zinc-50"
                                            }`}
                                        >
                                            {n}d
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(isLineEmpty && !chartLoading) ? (
                                <div className="w-full h-96 flex items-center justify-center text-zinc-500">
                                    Sem registros no período consultado.
                                </div>
                            ) : (
                                <div className="w-full h-96">
                                    <ResponsiveContainer>
                                        <LineChart data={lineData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="diaLabel" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip
                                                labelFormatter={(l) => `Dia ${l}`}
                                                formatter={(val: any, name) => [`${val} boxes`, name as string]}
                                                contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", color: "#111827" }}
                                            />
                                            <Legend
                                                content={() => (
                                                    <div className="flex gap-4 text-sm px-4 pb-2">
                                                        <button
                                                            onClick={() => toggleLine("ocupados")}
                                                            className={`flex items-center gap-2 ${show.ocupados ? "" : "opacity-50 line-through"}`}
                                                        >
                                                            <span className="inline-block w-3 h-3 rounded" style={{ background: COLORS.red }} />
                                                            Ocupados
                                                        </button>
                                                        <button
                                                            onClick={() => toggleLine("livres")}
                                                            className={`flex items-center gap-2 ${show.livres ? "" : "opacity-50 line-through"}`}
                                                        >
                                                            <span className="inline-block w-3 h-3 rounded" style={{ background: COLORS.blue }} />
                                                            Livres
                                                        </button>
                                                    </div>
                                                )}
                                            />
                                            {show.ocupados && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="ocupados"
                                                    name="Ocupados"
                                                    stroke={COLORS.red}
                                                    dot={{ r: 2 }}
                                                    activeDot={{ r: 6 }}
                                                    strokeWidth={2}
                                                    animationDuration={600}
                                                />
                                            )}
                                            {show.livres && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="livres"
                                                    name="Livres"
                                                    stroke={COLORS.blue}
                                                    dot={{ r: 2 }}
                                                    activeDot={{ r: 6 }}
                                                    strokeWidth={2}
                                                    animationDuration={600}
                                                />
                                            )}
                                            <Brush height={20} travellerWidth={8} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Tabela (mantida no tema atual) */}
                    <div className="bg-[var(--color-mottu-default)] p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Motos Estacionadas</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-black/20 text-slate-200">
                                <tr>
                                    <th className="p-3">Matrícula</th>
                                    <th className="p-3">Modelo</th>
                                    <th className="p-3">Localização (Box)</th>
                                    <th className="p-3">Pátio</th>
                                    <th className="p-3">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {veiculosEstacionados.length > 0 ? (
                                    veiculosEstacionados.map((v) => (
                                        <tr key={v.idVeiculo} className="border-b border-slate-700 hover:bg-black/20">
                                            <td className="p-3 font-mono">{v.placa}</td>
                                            <td className="p-3">{v.modelo}</td>
                                            <td className="p-3">{v.boxAssociado?.nome}</td>
                                            <td className="p-3">{v.patioAssociado?.nomePatio || "-"}</td>
                                            <td className="p-3">
                                                <Link href={`/veiculo/detalhes/${v.idVeiculo}`} className="text-sky-300 hover:underline">
                                                    Ver Detalhes
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center p-6 text-slate-300">
                                            Nenhuma moto estacionada no momento.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
