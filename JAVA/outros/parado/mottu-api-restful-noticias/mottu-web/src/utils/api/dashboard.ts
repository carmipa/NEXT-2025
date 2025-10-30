// src/utils/api/dashboard.ts
export type ResumoOcupacao = {
    totalBoxes: number;
    ocupados: number;
    livres: number;
};

export type OcupacaoDia = {
    dia: string;      // ISO (yyyy-MM-dd)
    ocupados: number;
    livres: number;
};

// Usa mesma convenção do cliente Axios: NEXT_PUBLIC_API_BASE_URL ou fallback "/api"
const RAW = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
const BASE = RAW
    ? RAW.replace(/\/+$/, "")
    : "/api";

import { fetchDashboard } from '../cache';

async function http<T>(pathOrUrl: string) {
    // Usar cache otimizado para dashboard
    return fetchDashboard<T>(pathOrUrl);
}

export const DashboardApi = {
    resumo(): Promise<ResumoOcupacao> {
        // /api/dashboard/resumo  (ou http://host:8080/api/dashboard/resumo se a env estiver correta)
        return http<ResumoOcupacao>(`${BASE}/dashboard/resumo`);
    },

    ocupacaoPorDia(ini: string, fim: string): Promise<OcupacaoDia[]> {
        const qs = new URLSearchParams({ ini, fim }).toString();
        return http<OcupacaoDia[]>(`${BASE}/dashboard/ocupacao-por-dia?${qs}`);
    },

    // NOVO: Métodos para obter totais
    totalVeiculos(): Promise<number> {
        return http<number>(`${BASE}/dashboard/total-veiculos`);
    },

    totalClientes(): Promise<number> {
        return http<number>(`${BASE}/dashboard/total-clientes`);
    },
};
