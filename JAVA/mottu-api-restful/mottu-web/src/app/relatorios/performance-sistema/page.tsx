"use client";

import { useEffect, useState } from 'react';
import { RelatoriosApi, SystemPerformance, ThreadInfo, AvancadosData } from '@/utils/api/relatorios';
import { buildApiUrl } from '@/config/api';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

function formatBytes(bytes: number): string {
  if (!bytes && bytes !== 0) return '-';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function formatBandwidth(mbps: number | null | undefined): string {
  if (mbps == null) return '—';
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(2)} Gbps`;
  }
  return `${mbps.toFixed(1)} Mbps`;
}

function formatSpeed(mhz: number | null | undefined): string {
  if (mhz == null) return '—';
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(2)} GHz`;
  }
  return `${mhz.toFixed(0)} MHz`;
}

export default function PerformanceSistemaPage() {
  const [data, setData] = useState<SystemPerformance | null>(null);
  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<Array<{ t: string; cpu: number; memory: number; disco: number; rede: number; bd: number }>>([]);
  const [adv, setAdv] = useState<AvancadosData['metricas'] | null>(null);
  const [sseActive, setSseActive] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sys, th, advResp] = await Promise.all([
        RelatoriosApi.getPerformanceSystem(),
        RelatoriosApi.getPerformanceThreads(),
        RelatoriosApi.getAvancados()
      ]);
      setData(sys);
      setThreads(th.slice(0, 10));
      setAdv(advResp.metricas);

      // Atualiza série temporal (mantém últimos 20 pontos)
      const cpu = advResp.metricas?.usoCPU ?? (sys.processCpuLoad != null ? +(sys.processCpuLoad * 100).toFixed(1) : 0);
      const memory = advResp.metricas?.usoMemory ?? (sys.heapMaxBytes > 0 ? +(sys.heapUsedBytes * 100 / sys.heapMaxBytes).toFixed(1) : 0);
      const disco = advResp.metricas?.escritaDisco ?? 0; // MB/s
      const rede = advResp.metricas?.throughputRede ?? 0; // MB/s
      const bd = (advResp.metricas?.conexoesBD ?? 0) * 10; // escala para visualização
      const ponto = { t: new Date().toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' }), cpu, memory, disco, rede, bd };
      setSeries(prev => {
        const next = [...prev, ponto];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // SSE: reaproveita stream de analytics para atualizar métricas avançadas e série
    let es: EventSource | null = null;
    try {
      es = new EventSource(buildApiUrl('/api/relatorios/analytics/stream'));
      es.onopen = () => setSseActive(true);
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload?.kpi) {
            const cpu = payload.kpi.systemCpuLoad != null ? +(payload.kpi.systemCpuLoad).toFixed(1) : undefined;
          }
          if (payload?.topVeiculos) {
            // apenas manter viva a conexão; série é atualizada por load() também
          }
          if (payload?.topBoxes && adv) {
            // nada a fazer
          }
          if (payload?.kpi || payload?.topVeiculos) {
            // dispara atualização leve
            load();
          }
        } catch {}
      };
      es.onerror = () => setSseActive(false);
    } catch {}
    const id = setInterval(load, 10_000);
    return () => { if (es) es.close(); setSseActive(false); clearInterval(id); };
  }, []);

  return (
    <div className="min-h-screen bg-black relative">
      <ParticleBackground />
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a 
                  href="/relatorios" 
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Voltar para Relatórios"
                >
                  <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                </a>
                <h1 className="text-2xl md:text-3xl font-bold text-white"><i className="ion-ios-speedometer mr-2 text-emerald-400"></i>Relatórios • Performance do Sistema</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className={`hidden sm:flex items-center gap-2 px-2 py-1 rounded-full border text-xs ${sseActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${sseActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span>Tempo Real</span>
                </div>
                <button onClick={load} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition text-white text-sm"><i className="ion-ios-refresh mr-1"></i>Atualizar</button>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neumorphic-container hover:scale-105 transition border border-card-gray-border bg-card-gray">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-barcode text-emerald-500"></i> PID</div>
              <div className="text-gray-900 text-xl">{data?.pid ?? '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-gray-border bg-card-gray">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-time text-blue-500"></i> Uptime</div>
              <div className="text-gray-900 text-xl">{data ? `${Math.floor(data.uptimeMs/1000)}s` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-gray-border bg-card-gray">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-speedometer text-orange-500"></i> CPU (sistema/processo)</div>
              <div className="text-gray-900 text-xl">{data?.systemCpuLoad != null ? `${(data.systemCpuLoad*100).toFixed(1)}%` : '—'} / {data?.processCpuLoad != null ? `${(data.processCpuLoad*100).toFixed(1)}%` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-gray-border bg-card-gray">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-cog text-indigo-500"></i> Processadores</div>
              <div className="text-gray-900 text-xl">{data?.availableProcessors ?? '—'}</div>
            </div>
          </div>

          {/* KPIs Adicionais - Cache e Largura de Banda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="neumorphic-container hover:scale-105 transition border border-card-cyan-border bg-card-cyan">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-flash text-cyan-500"></i> Cache do Processador</div>
              <div className="text-gray-900 text-xl">{data?.processorCacheSizeBytes ? formatBytes(data.processorCacheSizeBytes) : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-rose-border bg-card-rose">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-cloud-upload text-rose-500"></i> Largura de Banda</div>
              <div className="text-gray-900 text-xl">{formatBandwidth(data?.networkBandwidthMbps ?? adv?.larguraBandaMbps)}</div>
            </div>
          </div>

          {/* KPIs de Hardware - RAM e Processador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="neumorphic-container hover:scale-105 transition border border-card-blue-border bg-card-blue">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-albums text-blue-500"></i> RAM Total</div>
              <div className="text-gray-900 text-xl">{data?.totalRamBytes ? formatBytes(data.totalRamBytes) : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-purple-border bg-card-purple">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-speedometer text-purple-500"></i> Velocidade RAM</div>
              <div className="text-gray-900 text-xl">{formatSpeed(data?.ramSpeedMhz)}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-emerald-border bg-card-emerald">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-cog text-emerald-500"></i> Velocidade CPU</div>
              <div className="text-gray-900 text-xl">{formatSpeed(data?.processorSpeedMhz)}</div>
            </div>
          </div>

          {/* KPIs Avançados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="neumorphic-container hover:scale-105 transition border border-card-orange-border bg-card-orange">
              <div className="text-gray-500 text-xs">Conexões BD Ativas</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-link text-orange-400 mr-1"/>{adv ? `${adv.conexoesBD} conexões` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-amber-border bg-card-amber">
              <div className="text-gray-500 text-xs">Latência BD</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-timer text-yellow-400 mr-1"/>{adv ? `${adv.latenciaBD.toFixed(2)} ms` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-purple-border bg-card-purple">
              <div className="text-gray-500 text-xs">Throughput Rede</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-cloud-upload text-indigo-400 mr-1"/>{adv ? `${adv.throughputRede.toFixed(2)} MB/s` : '—'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="neumorphic-container hover:scale-105 transition border border-card-emerald-border bg-card-emerald">
              <div className="text-gray-500 text-xs">Uso CPU</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-speedometer text-emerald-400 mr-1"/>{adv ? `${adv.usoCPU.toFixed(1)} %` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-fuchsia-border bg-card-fuchsia">
              <div className="text-gray-500 text-xs">Uso Memória</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-albums text-purple-400 mr-1"/>{adv ? `${adv.usoMemory.toFixed(1)} %` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-green-border bg-card-green">
              <div className="text-gray-500 text-xs">Leitura Disco</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-download text-green-400 mr-1"/>{adv ? `${adv.leituraDisco.toFixed(0)} MB/s` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-teal-border bg-card-teal">
              <div className="text-gray-500 text-xs">Escrita Disco</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-upload text-teal-400 mr-1"/>{adv ? `${adv.escritaDisco.toFixed(1)} MB/s` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:scale-105 transition border border-card-pink-border bg-card-pink">
              <div className="text-gray-500 text-xs">Uso Disco</div>
              <div className="text-gray-900 text-lg"><i className="ion-ios-disc text-pink-400 mr-1"/>{adv ? `${adv.usoDisco.toFixed(2)} %` : '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="neumorphic-container hover:shadow-emerald-500/20 transition border border-card-blue-border bg-card-blue">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-albums text-blue-500"></i> Heap</div>
              <div className="text-gray-900 text-lg">{data ? `${formatBytes(data.heapUsedBytes)} / ${formatBytes(data.heapMaxBytes)}` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:shadow-emerald-500/20 transition border border-card-violet-border bg-card-violet">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-archive text-violet-500"></i> Non-Heap</div>
              <div className="text-gray-900 text-lg">{data ? `${formatBytes(data.nonHeapUsedBytes)}` : '—'}</div>
            </div>
            <div className="neumorphic-container hover:shadow-emerald-500/20 transition border border-card-orange-border bg-card-orange">
              <div className="text-gray-500 text-xs flex items-center gap-1"><i className="ion-ios-git-branch text-orange-500"></i> Threads (ativas/daemon)</div>
              <div className="text-gray-900 text-lg">{data ? `${data.threadCount} / ${data.daemonThreadCount}` : '—'}</div>
            </div>
          </div>

          {/* Gráfico 1 - Linha (uma por linha; varia com tempo) */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-analytics text-emerald-400 mr-2"></i>Performance ao Longo do Tempo</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="t" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  {/* Escala log para evidenciar variações pequenas entre grandezas diferentes */}
                  <YAxis 
                    scale="log" 
                    domain={[0.1, 'auto']} 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#ffffff' }}
                  />
                  <Line type="monotone" dataKey="bd" stroke="#34d399" strokeWidth={2} name="BD" dot={false} isAnimationActive />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU (%)" dot={false} isAnimationActive />
                  <Line type="monotone" dataKey="disco" stroke="#6366f1" strokeWidth={2} name="Disco (MB/s)" dot={false} isAnimationActive />
                  <Line type="monotone" dataKey="memory" stroke="#ef4444" strokeWidth={2} name="Memória (%)" dot={false} isAnimationActive />
                  <Line type="monotone" dataKey="rede" stroke="#f59e0b" strokeWidth={2} name="Rede (MB/s)" dot={false} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2 - Barras (métricas absolutas) */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-stats text-blue-400 mr-2"></i>Uso de Recursos</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ 
                    name: 'Atual',
                    // absolutos – deixar de fora PID para não esmagar as outras barras
                    uptimeMin: data ? Math.floor(data.uptimeMs / 60000) : 0,
                    procs: data?.availableProcessors ?? 0,
                    conexoes: adv?.conexoesBD ?? 0,
                    latencia: adv?.latenciaBD ?? 0,
                    rede: adv?.throughputRede ?? 0,
                    leitura: adv?.leituraDisco ?? 0,
                    escrita: adv?.escritaDisco ?? 0,
                    nonHeap: data ? +(data.nonHeapUsedBytes / (1024*1024)).toFixed(2) : 0,
                    threads: data?.threadCount ?? 0
                }]}> 
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#ffffff' }}
                  />
                  <Bar dataKey="uptimeMin" name="Uptime (min)" fill="#0ea5e9" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="procs" name="Processadores" fill="#7c3aed" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="conexoes" name="Conexões BD" fill="#10b981" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="latencia" name="Latência ms" fill="#f97316" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="rede" name="Rede MB/s" fill="#06b6d4" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="leitura" name="Leitura MB/s" fill="#8b5cf6" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="escrita" name="Escrita MB/s" fill="#a78bfa" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="nonHeap" name="Non-Heap MB" fill="#94a3b8" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="threads" name="Threads" fill="#f59e0b" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 3 - Barras (métricas percentuais 0-100%) */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl"><i className="ion-ios-stats-outline text-emerald-400 mr-2"></i>Uso de Recursos (%)</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ 
                    name: 'Atual',
                    cpuSys: (data?.systemCpuLoad ?? 0) * 100,
                    cpuProc: (data?.processCpuLoad ?? 0) * 100,
                    usoCpu: adv?.usoCPU ?? ((data?.processCpuLoad ?? 0) * 100),
                    usoMem: adv?.usoMemory ?? (data && data.heapMaxBytes > 0 ? (data.heapUsedBytes * 100 / data.heapMaxBytes) : 0),
                    usoDisco: adv?.usoDisco ?? 0,
                    heap: data && data.heapMaxBytes > 0 ? (data.heapUsedBytes * 100 / data.heapMaxBytes) : 0
                }]}> 
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    domain={[0,100]} 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, 'Percentual']}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#ffffff' }}
                  />
                  <Bar dataKey="cpuSys" name="CPU Sistema %" fill="#22c55e" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="cpuProc" name="CPU Processo %" fill="#16a34a" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="usoCpu" name="Uso CPU %" fill="#34d399" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="usoMem" name="Uso Mem %" fill="#3b82f6" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="usoDisco" name="Uso Disco %" fill="#ef4444" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                  <Bar dataKey="heap" name="Heap %" fill="#60a5fa" barSize={18} radius={[4, 4, 0, 0]} isAnimationActive />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threads */}
          <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-xl">Top 10 Threads</h2>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <i className="ion-ios-key text-gray-500"></i>
                        ID
                      </div>
                    </th>
                    <th className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <i className="ion-ios-paper text-blue-500"></i>
                        Nome
                      </div>
                    </th>
                    <th className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <i className="ion-ios-pulse text-green-500"></i>
                        Estado
                      </div>
                    </th>
                    <th className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <i className="ion-ios-flash text-yellow-500"></i>
                        CPU ns
                      </div>
                    </th>
                    <th className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <i className="ion-ios-flame text-orange-500"></i>
                        User ns
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                {threads.map(t => {
                  const cpuActive = (t.cpuTimeNanos ?? 0) > 0;
                  const userActive = (t.userTimeNanos ?? 0) > 0;
                  const state = (t.state || '').toUpperCase();
                  const badge = (() => {
                    if (state === 'RUNNABLE') return { cls: 'bg-emerald-100 text-emerald-800', icon: 'ion-ios-play' };
                    if (state === 'WAITING') return { cls: 'bg-gray-100 text-gray-800', icon: 'ion-ios-time' };
                    if (state === 'TIMED_WAITING') return { cls: 'bg-amber-100 text-amber-800', icon: 'ion-ios-alarm' };
                    if (state === 'BLOCKED') return { cls: 'bg-red-100 text-red-800', icon: 'ion-ios-hand' };
                    return { cls: 'bg-blue-100 text-blue-800', icon: 'ion-ios-radio-button-on' };
                  })();
                  return (
                    <tr key={t.id} className="text-gray-800 border-t border-white/10 hover:bg-white/10 transition">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <i className="ion-ios-key text-gray-400"></i>
                          <span>{t.id}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <i className="ion-ios-git-commit text-indigo-500"></i>
                          <span className="truncate max-w-xs">{t.name}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                          <i className={`${badge.icon}`}></i>
                          {t.state}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 ${cpuActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                          <i className={`ion-ios-flash ${cpuActive ? 'text-yellow-500' : 'text-gray-400'}`}></i>
                          {t.cpuTimeNanos ?? '—'}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 ${userActive ? 'text-blue-600' : 'text-gray-500'}`}>
                          <i className={`ion-ios-flame ${userActive ? 'text-orange-500' : 'text-gray-400'}`}></i>
                          {t.userTimeNanos ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


