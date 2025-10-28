/**
 * API de Relatórios com Cache Otimizado
 * Focado em performance para relatórios críticos
 */

import { fetchRelatorios } from '../cache';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// Tipos para relatórios
export interface OcupacaoDiariaData {
  data: string;
  ocupados: number;
  livres: number;
  percentual: number;
}

export interface MovimentacaoData {
  data: string;
  entradas: number;
  saidas: number;
  totalMovimentacoes: number;
}

export interface HeatmapData {
  patioId: number;
  nomePatio: string;
  taxaOcupacao: number;
  boxesOcupados: number;
  boxesLivres: number;
}

export interface ComportamentalData {
  clientes: Array<{
    id: string;
    nome: string;
    rating: number;
    visitas: number;
    tempoMedio: string;
    patioPreferido: string;
  }>;
}

export interface IAData {
  previsao1h: number;
  picoMaximo: number;
  confiancaMedia: number;
  tendencia: string;
  dadosGrafico: Array<{
    hora: string;
    ocupacao: number;
    previsao: number;
    confianca: number;
  }>;
}

export interface AvancadosData {
  metricas: {
    totalMovimentacoes: number;
    ocupacaoMedia: number;
    conexoesBD: number;
    latenciaBD: number;
    throughputRede: number;
    usoCPU: number;
    usoMemory: number;
    leituraDisco: number;
    escritaDisco: number;
    usoDisco: number;
  };
}

// Performance do Sistema (backend: /api/relatorios/performance)
export interface SystemPerformance {
  pid: number;
  uptimeMs: number;
  availableProcessors: number;
  systemCpuLoad?: number | null;
  processCpuLoad?: number | null;
  heapUsedBytes: number;
  heapMaxBytes: number;
  nonHeapUsedBytes: number;
  threadCount: number;
  daemonThreadCount: number;
}

export interface ThreadInfo {
  id: number;
  name: string;
  state: string;
  cpuTimeNanos?: number | null;
  userTimeNanos?: number | null;
}

// Manutenção
export interface ManutencaoResumoPatio {
  patioId: number;
  patioNome: string;
  boxesLivres: number;
  boxesOcupados: number;
  boxesManutencao: number;
  veiculosOperacionais: number;
  veiculosEmManutencao: number;
  veiculosInativos: number;
}

// Analytics
export interface AnalyticsKpi {
  totalEventos: number;
  veiculosUnicos: number;
  conversao: number; // %
  latenciaMediaMs?: number;
  throughput?: number;
}

export interface TopVeiculo {
  placa: string;
  eventos: number;
}

export interface TopBox {
  boxId: number;
  eventos: number;
}

export interface TopPatio {
  patioId: number;
  patioNome: string;
  eventos: number;
}

export interface NotificacoesData {
  content: Array<{
    id: number;
    titulo: string;
    mensagem: string;
    tipo: string;
    prioridade: string;
    categoria: string;
    lida: boolean;
    dataHoraCriacao: string;
    urlRedirecionamento?: string;
  }>;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * API de Relatórios com Cache
 */
export const RelatoriosApi = {
  // Ocupação Diária
  async getOcupacaoDiaria(dataInicio?: string, dataFim?: string): Promise<OcupacaoDiariaData[]> {
    const params = new URLSearchParams();
    if (dataInicio) params.set('ini', dataInicio);
    if (dataFim) params.set('fim', dataFim);
    
    const url = `${BASE}/dashboard/ocupacao-por-dia?${params.toString()}`;
    return fetchRelatorios<OcupacaoDiariaData[]>(url);
  },

  // Movimentação Diária
  async getMovimentacaoDiaria(dataInicio?: string, dataFim?: string): Promise<MovimentacaoData[]> {
    const params = new URLSearchParams();
    if (dataInicio) params.set('dataInicio', dataInicio);
    if (dataFim) params.set('dataFim', dataFim);
    
    const url = `${BASE}/relatorios/movimentacao/diaria?${params.toString()}`;
    return fetchRelatorios<MovimentacaoData[]>(url);
  },

  // Ocupação Atual (Heatmap)
  async getOcupacaoAtual(): Promise<HeatmapData[]> {
    const url = `${BASE}/relatorios/ocupacao/atual`;
    return fetchRelatorios<HeatmapData[]>(url);
  },

  // Análise Comportamental
  async getComportamental(): Promise<ComportamentalData> {
    const url = `${BASE}/relatorios/comportamental-detalhado`;
    return fetchRelatorios<ComportamentalData>(url);
  },

  // Dashboard IA
  async getIADashboard(): Promise<IAData> {
    const url = `${BASE}/relatorios/ia/dashboard`;
    return fetchRelatorios<IAData>(url);
  },

  // Relatórios Avançados
  async getAvancados(): Promise<AvancadosData> {
    const url = `${BASE}/relatorios/avancados/performance-sistema`;
    return fetchRelatorios<AvancadosData>(url);
  },

  // Notificações
  async getNotificacoes(page = 0, size = 10): Promise<NotificacoesData> {
    const url = `${BASE}/notificacoes?page=${page}&size=${size}`;
    return fetchRelatorios<NotificacoesData>(url);
  },

  // Performance do Sistema
  async getPerformanceSystem(): Promise<SystemPerformance> {
    const url = `${BASE}/relatorios/performance/system`;
    return fetchRelatorios<SystemPerformance>(url);
  },

  async getPerformanceThreads(): Promise<ThreadInfo[]> {
    const url = `${BASE}/relatorios/performance/threads`;
    return fetchRelatorios<ThreadInfo[]>(url);
  },

  // Manutenção
  async getManutencaoResumoPorPatio(): Promise<ManutencaoResumoPatio[]> {
    const url = `${BASE}/relatorios/manutencao/resumo-por-patio`;
    return fetchRelatorios<ManutencaoResumoPatio[]>(url);
  },

  // Analytics
  async getAnalyticsKpis(params?: { inicio?: string; fim?: string; dias?: number }): Promise<AnalyticsKpi> {
    const q = params ? new URLSearchParams(params as any).toString() : '';
    const url = `${BASE}/relatorios/analytics/kpis${q ? `?${q}` : ''}`;
    return fetchRelatorios<AnalyticsKpi>(url);
  },
  async getAnalyticsTopVeiculos(params?: { limite?: number; inicio?: string; fim?: string; dias?: number }): Promise<TopVeiculo[]> {
    const q = params ? new URLSearchParams(params as any).toString() : '';
    const url = `${BASE}/relatorios/analytics/top-veiculos${q ? `?${q}` : ''}`;
    return fetchRelatorios<TopVeiculo[]>(url);
  },
  async getAnalyticsTopBoxes(params?: { limite?: number; inicio?: string; fim?: string; dias?: number }): Promise<TopBox[]> {
    const q = params ? new URLSearchParams(params as any).toString() : '';
    const url = `${BASE}/relatorios/analytics/top-boxes${q ? `?${q}` : ''}`;
    return fetchRelatorios<TopBox[]>(url);
  },
  async getAnalyticsTopPatios(params?: { limite?: number; inicio?: string; fim?: string; dias?: number }): Promise<TopPatio[]> {
    const q = params ? new URLSearchParams(params as any).toString() : '';
    const url = `${BASE}/relatorios/analytics/top-patios${q ? `?${q}` : ''}`;
    return fetchRelatorios<TopPatio[]>(url);
  }
};
