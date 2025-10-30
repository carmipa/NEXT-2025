"use client";

import { useEffect, useMemo, useState } from 'react';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { ManutencaoResumoPatio, RelatoriosApi } from '@/utils/api/relatorios';
import { buildApiUrl } from '@/config/api';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

type SerieManutencao = { t: string; livres: number; ocupados: number; manutencao: number };

export default function ManutencaoRelatorioPage() {
  const [dados, setDados] = useState<ManutencaoResumoPatio[]>([]);
  const [series, setSeries] = useState<SerieManutencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [patioSelecionado, setPatioSelecionado] = useState<number | 'all'>('all');

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await RelatoriosApi.getManutencaoResumoPorPatio();
      setDados(res);

      const totalLivres = res.reduce((a, p) => a + (p.boxesLivres || 0), 0);
      const totalOcupados = res.reduce((a, p) => a + (p.boxesOcupados || 0), 0);
      const totalManut = res.reduce((a, p) => a + (p.boxesManutencao || 0), 0);
      const ponto: SerieManutencao = {
        t: new Date().toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        livres: totalLivres || 0.1,
        ocupados: totalOcupados || 0.1,
        manutencao: totalManut || 0.1,
      };
      setSeries(prev => {
        const next = [...prev, ponto];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // SSE em tempo real
    let es: EventSource | null = null;
    try {
      es = new EventSource(buildApiUrl('/api/relatorios/manutencao/stream'));
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (Array.isArray(payload.porPatio)) {
            setDados(payload.porPatio);
            const totalLivres = payload.porPatio.reduce((a: number, p: unknown) => a + Number((p as any).boxesLivres || 0), 0);
            const totalOcupados = payload.porPatio.reduce((a: number, p: unknown) => a + Number((p as any).boxesOcupados || 0), 0);
            const totalManut = payload.porPatio.reduce((a: number, p: unknown) => a + Number((p as any).boxesManutencao || 0), 0);
            const ponto: SerieManutencao = {
              t: new Date().toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
              livres: totalLivres || 0.1,
              ocupados: totalOcupados || 0.1,
              manutencao: totalManut || 0.1,
            };
            setSeries(prev => {
              const next = [...prev, ponto];
              return next.length > 20 ? next.slice(next.length - 20) : next;
            });
          }
        } catch {}
      };
    } catch {}
    const id = setInterval(carregar, 30_000);
    return () => { if (es) es.close(); clearInterval(id); };
  }, []);

  const kpis = useMemo(() => {
    const totalVeiculos = dados.reduce((a, p) => a + (p.veiculosOperacionais + p.veiculosEmManutencao + p.veiculosInativos), 0);
    const operacionais = dados.reduce((a, p) => a + p.veiculosOperacionais, 0);
    const emManutencao = dados.reduce((a, p) => a + p.veiculosEmManutencao, 0);
    const inativos = dados.reduce((a, p) => a + p.veiculosInativos, 0);
    const livres = dados.reduce((a, p) => a + p.boxesLivres, 0);
    const ocupados = dados.reduce((a, p) => a + p.boxesOcupados, 0);
    const manutencao = dados.reduce((a, p) => a + p.boxesManutencao, 0);
    return { totalVeiculos, operacionais, emManutencao, inativos, livres, ocupados, manutencao };
  }, [dados]);

  return (
    <div className="min-h-screen bg-black relative">
      <ParticleBackground />
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-white"><i className="ion-ios-construct mr-2 text-emerald-400"></i>Relatórios • Manutenção</h1>
              <div className="flex items-center gap-3">
                <select
                  className="px-3 py-2 rounded-lg bg-white/90 text-gray-900 text-sm border border-gray-200"
                  value={patioSelecionado}
                  onChange={(e) => setPatioSelecionado(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                  <option value="all">Todos os Pátios</option>
                  {dados.map(p => (
                    <option key={p.patioId} value={p.patioId}>{p.patioNome}</option>
                  ))}
                </select>
                <button onClick={carregar} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition text-white text-sm"><i className="ion-ios-refresh mr-1"></i>Atualizar</button>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neumorphic-container border border-card-gray-border bg-card-gray">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><span className="text-emerald-600 text-lg" aria-label="moto" role="img">🏍️</span></div>
                <span className="text-gray-600 text-xs">Total Veículos</span>
              </div>
              <div className="text-gray-900 text-xl">{kpis.totalVeiculos}</div>
            </div>
            <div className="neumorphic-container border border-card-emerald-border bg-card-emerald">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-checkmark-circle text-emerald-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Operacionais</span>
              </div>
              <div className="text-gray-900 text-xl">{kpis.operacionais}</div>
            </div>
            <div className="neumorphic-container border border-card-amber-border bg-card-amber">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-build text-amber-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Em Manutenção</span>
              </div>
              <div className="text-gray-900 text-xl">{kpis.emManutencao}</div>
            </div>
            <div className="neumorphic-container border border-card-pink-border bg-card-pink">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-alert text-pink-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Inativos</span>
              </div>
              <div className="text-gray-900 text-xl">{kpis.inativos}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="neumorphic-container border border-card-green-border bg-card-green">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-cube text-green-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Boxes Livres</span>
              </div>
              <div className="text-gray-900 text-lg">{kpis.livres}</div>
            </div>
            <div className="neumorphic-container border border-card-yellow-border bg-card-yellow">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-cube text-yellow-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Boxes Ocupados</span>
              </div>
              <div className="text-gray-900 text-lg">{kpis.ocupados}</div>
            </div>
            <div className="neumorphic-container border border-card-orange-border bg-card-orange">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-md bg-white/70"><i className="ion-ios-build text-orange-600 text-lg"></i></div>
                <span className="text-gray-600 text-xs">Boxes Manutenção</span>
              </div>
              <div className="text-gray-900 text-lg">{kpis.manutencao}</div>
            </div>
          </div>

          {/* Gráfico por pátio - barras empilhadas */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-podium text-blue-400 mr-2"></i>Status por Pátio</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(patioSelecionado === 'all' ? dados : dados.filter(p => p.patioId === patioSelecionado)).map(p => ({
                  nome: p.patioNome,
                  livres: p.boxesLivres,
                  ocupados: p.boxesOcupados,
                  manutencao: p.boxesManutencao
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="livres" name="Livres" stackId="a" fill="#22c55e" barSize={18} />
                  <Bar dataKey="ocupados" name="Ocupados" stackId="a" fill="#f59e0b" barSize={18} />
                  <Bar dataKey="manutencao" name="Manutenção" stackId="a" fill="#ef4444" barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico temporal com escala log para evolução de boxes*/}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-analytics text-emerald-400 mr-2"></i>Evolução de Boxes</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis scale="log" domain={[0.1, 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="livres" name="Livres" fill="#34d399" barSize={14} />
                  <Bar dataKey="ocupados" name="Ocupados" fill="#fbbf24" barSize={14} />
                  <Bar dataKey="manutencao" name="Manutenção" fill="#fb7185" barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


