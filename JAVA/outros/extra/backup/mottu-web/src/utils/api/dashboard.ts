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

// Se a env estiver errada/vazia, caímos para "/api"
const RAW = (process.env.NEXT_PUBLIC_API || "").trim();
const BASE =
    RAW && /^https?:\/\//i.test(RAW) ? RAW.replace(/\/+$/, "") : "/api";

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
};
