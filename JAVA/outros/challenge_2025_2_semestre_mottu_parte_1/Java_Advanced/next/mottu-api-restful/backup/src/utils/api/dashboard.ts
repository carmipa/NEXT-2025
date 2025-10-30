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

async function http<T>(pathOrUrl: string) {
    const res = await fetch(pathOrUrl, { cache: "no-store" });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} - ${text || res.statusText} @ ${pathOrUrl}`);
    }
    return res.json() as Promise<T>;
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
