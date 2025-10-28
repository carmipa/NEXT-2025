"use client";

import { useEffect, useMemo, useState } from 'react';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { AnalyticsKpi, RelatoriosApi, TopBox, TopVeiculo, TopPatio } from '@/utils/api/relatorios';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

type Serie = { t: string; eventos: number; veiculos: number; conversao: number; previsto?: number; real?: number };

const COLORS = ['#34d399','#60a5fa','#f59e0b','#ef4444','#8b5cf6','#22c55e','#a78bfa'];

export default function AnalyticsRelatorioPage() {
  const [kpi, setKpi] = useState<AnalyticsKpi | null>(null);
  const [topVeiculos, setTopVeiculos] = useState<TopVeiculo[]>([]);
  const [topBoxes, setTopBoxes] = useState<TopBox[]>([]);
  const [serie, setSerie] = useState<Serie[]>([]);
  const [topPatios, setTopPatios] = useState<TopPatio[]>([]);
  const [dias, setDias] = useState<number>(15);

  const carregar = async () => {
    const [k, tv, tb] = await Promise.all([
      RelatoriosApi.getAnalyticsKpis({ dias }),
      RelatoriosApi.getAnalyticsTopVeiculos({ limite: 10, dias }),
      RelatoriosApi.getAnalyticsTopBoxes({ limite: 10, dias })
    ]);
    setKpi(k);
    setTopVeiculos(tv);
    setTopBoxes(tb);
    try {
      const tp = await RelatoriosApi.getAnalyticsTopPatios({ limite: 10, dias });
      setTopPatios(tp);
    } catch (e) { /* opcional */ }
    const ponto: Serie = {
      t: new Date().toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      eventos: k.totalEventos || 0.1,
      veiculos: k.veiculosUnicos || 0.1,
      conversao: k.conversao || 0.1,
      real: k.totalEventos || 0.1
    };
    setSerie(prev => {
      const alpha = 0.35; // suavização exponencial para previsão
      const prevPrevisto = prev.length ? prev[prev.length - 1].previsto ?? prev[prev.length - 1].real ?? ponto.real : ponto.real;
      const previstoAtual = (alpha * (ponto.real || 0)) + ((1 - alpha) * (prevPrevisto || 0));
      const next = [...prev, { ...ponto, previsto: +previstoAtual.toFixed(2) }];
      return next.length > 24 ? next.slice(next.length - 24) : next;
    });
  };

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 5000);
    return () => clearInterval(id);
  }, [dias]);

  const pieData = useMemo(() => {
    const data = topVeiculos.slice(0, 5).map(v => ({ name: v.placa, value: v.eventos }));
    const total = data.reduce((a, b) => a + (b.value || 0), 0);
    return total > 0 ? data : [];
  }, [topVeiculos]);

  return (
    <div className="min-h-screen bg-black relative">
      <ParticleBackground />
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-white"><i className="ion-ios-analytics mr-2 text-sky-400"></i>Relatórios • Analytics</h1>
              <div className="flex items-center gap-3">
                <select className="px-3 py-2 rounded-lg bg-white/90 text-gray-900 text-sm border border-gray-200" value={dias} onChange={(e)=>setDias(Number(e.target.value))}>
                  {[15,30,60,90,120,180,360].map(d=> <option key={d} value={d}>{d} dias</option>)}
                </select>
                <button onClick={carregar} className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 transition text-white text-sm"><i className="ion-ios-refresh mr-1"></i>Atualizar</button>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neumorphic-container border border-card-indigo-border bg-card-indigo">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-pulse text-indigo-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Total Eventos</span>
              </div>
              <div className="text-gray-900 text-xl">{kpi?.totalEventos ?? 0}</div>
            </div>
            <div className="neumorphic-container border border-card-teal-border bg-card-teal">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-people text-teal-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Veículos Únicos</span>
              </div>
              <div className="text-gray-900 text-xl">{kpi?.veiculosUnicos ?? 0}</div>
            </div>
            <div className="neumorphic-container border border-card-green-border bg-card-green">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-trending-up text-green-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Conversão</span>
              </div>
              <div className="text-gray-900 text-xl">{(kpi?.conversao ?? 0).toFixed(1)} %</div>
            </div>
            <div className="neumorphic-container border border-card-sky-border bg-card-sky">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-speedometer text-sky-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Latência Média</span>
              </div>
              <div className="text-gray-900 text-xl">{kpi?.latenciaMediaMs ?? 0} ms</div>
            </div>
          </div>

          {/* Série temporal - escala log */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-timer text-amber-400 mr-2"></i>Evolução (tempo real)</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serie}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis scale="log" domain={[0.1,'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="eventos" name="Eventos" stroke="#60a5fa" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="veiculos" name="Veículos" stroke="#34d399" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="conversao" name="Conversão" stroke="#f59e0b" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Previsões vs Realidade (área empilhada) */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-pulse text-rose-400 mr-2"></i>Previsões vs Realidade</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serie}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="previsto" name="previsto" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.45} />
                  <Area type="monotone" dataKey="real" name="real" stroke="#f87171" fill="#f87171" fillOpacity={0.45} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cards adicionais no estilo "model" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neumorphic-container">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-pulse text-emerald-500"></i>Precisão do Modelo</div>
              <div className="text-gray-900 text-xl">{(kpi?.conversao ?? 0).toFixed(1)} %</div>
            </div>
            <div className="neumorphic-container">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-bulb text-sky-500"></i>Previsões Hoje</div>
              <div className="text-gray-900 text-xl">{kpi?.totalEventos ?? 0} previsões</div>
            </div>
            <div className="neumorphic-container">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-shield text-indigo-500"></i>Confiança Média</div>
              <div className="text-gray-900 text-xl">{(kpi?.conversao ?? 0).toFixed(2)} %</div>
            </div>
            <div className="neumorphic-container">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-flash text-orange-500"></i>Insights Gerados</div>
              <div className="text-gray-900 text-xl">{topVeiculos.length} hoje</div>
            </div>
          </div>

          {/* Top listas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="neumorphic-container">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-xl"><i className="ion-ios-list text-emerald-400 mr-2"></i>Top Veículos</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topVeiculos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="placa" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="eventos" name="Eventos" barSize={18}>
                      {topVeiculos.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="neumorphic-container">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-xl"><i className="ion-ios-pie text-purple-400 mr-2"></i>Top Veículos (Pizza)</h2>
              </div>
              <div className="h-72">
                {pieData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sem dados para exibir</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Top Pátios */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-home text-emerald-400 mr-2"></i>Top Pátios</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPatios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="patioNome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="eventos" name="Eventos" barSize={18}>
                    {topPatios.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i+4) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-cube text-pink-400 mr-2"></i>Top Boxes</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBoxes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="boxId" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="eventos" name="Eventos" barSize={18}>
                    {topBoxes.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i+2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


