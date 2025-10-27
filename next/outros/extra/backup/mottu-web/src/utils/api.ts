// mottu-web/src/utils/api.ts

import axios from "axios";
import { SpringPage } from "@/types/common";
import {
    ClienteRequestDto,
    ClienteResponseDto,
    ClienteFilter,
} from "@/types/cliente";
import {
    VeiculoRequestDto,
    VeiculoResponseDto,
    VeiculoFilter,
    VeiculoLocalizacaoResponseDto,
} from "@/types/veiculo";
import {
    PatioRequestDto,
    PatioResponseDto,
    PatioFilter,
} from "@/types/patio";
import {
    BoxRequestDto,
    BoxResponseDto,
    BoxFilter,
} from "@/types/box";
import {
    ZonaRequestDto,
    ZonaResponseDto,
    ZonaFilter,
} from "@/types/zona";

// ---- OCR / Radar types ----
export interface OcrSession {
    id: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR";
    recognizedPlate?: string;
    errorMessage?: string;
}

/**
 * Base da API:
 * - Padrão: '/api' (funciona com rewrites do Next e com Caddy HTTPS — mesma origem).
 * - Override opcional: NEXT_PUBLIC_API_BASE_URL (ex.: 'https://app.local:3443/api' ou 'http://localhost:8080/api').
 */
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Client único, sem headers forçados.
 * - Para JSON, o Axios seta automaticamente "application/json".
 * - Para FormData, o Axios seta automaticamente "multipart/form-data; boundary=...".
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000,
});

// util p/ limpar filtros
const cleanFilterParams = (filter: object): Record<string, any> =>
    Object.entries(filter).reduce((acc, [k, v]) => {
        if (v !== null && v !== undefined && v !== "") acc[k] = v;
        return acc;
    }, {} as Record<string, any>);

// ---------------- CLIENTES ----------------
export const ClienteService = {
    listarPaginadoFiltrado: async (
        filter: ClienteFilter = {},
        page = 0,
        size = 10,
        sort = "idCliente,asc"
    ): Promise<SpringPage<ClienteResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<ClienteResponseDto>>(
            "/clientes/search",
            { params }
        );
        return data;
    },

    getById: async (id: number): Promise<ClienteResponseDto> => {
        const { data } = await api.get<ClienteResponseDto>(`/clientes/${id}`);
        return data;
    },

    create: async (
        payload: ClienteRequestDto
    ): Promise<ClienteResponseDto> => {
        const { data } = await api.post<ClienteResponseDto>("/clientes", payload);
        return data;
    },

    update: async (
        id: number,
        payload: ClienteRequestDto
    ): Promise<ClienteResponseDto> => {
        const { data } = await api.put<ClienteResponseDto>(
            `/clientes/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/clientes/${id}`);
    },
};

// ---------------- VEÍCULOS ----------------
export const VeiculoService = {
    listarPaginadoFiltrado: async (
        filter: VeiculoFilter = {},
        page = 0,
        size = 10,
        sort = "idVeiculo,asc"
    ): Promise<SpringPage<VeiculoResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<VeiculoResponseDto>>(
            "/veiculos/search",
            { params }
        );
        return data;
    },

    getById: async (id: number): Promise<VeiculoResponseDto> => {
        const { data } = await api.get<VeiculoResponseDto>(`/veiculos/${id}`);
        return data;
    },

    create: async (
        payload: VeiculoRequestDto
    ): Promise<VeiculoResponseDto> => {
        const { data } = await api.post<VeiculoResponseDto>("/veiculos", payload);
        return data;
    },

    update: async (
        id: number,
        payload: VeiculoRequestDto
    ): Promise<VeiculoResponseDto> => {
        const { data } = await api.put<VeiculoResponseDto>(
            `/veiculos/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/veiculos/${id}`);
    },

    getLocalizacao: async (
        id: number
    ): Promise<VeiculoLocalizacaoResponseDto> => {
        const { data } = await api.get<VeiculoLocalizacaoResponseDto>(
            `/veiculos/${id}/localizacao`
        );
        return data;
    },
};

// ---------------- PÁTIOS ----------------
export const PatioService = {
    listarPaginadoFiltrado: async (
        filter: PatioFilter = {},
        page = 0,
        size = 10,
        sort = "idPatio,asc"
    ): Promise<SpringPage<PatioResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<PatioResponseDto>>(
            "/patios/search",
            { params }
        );
        return data;
    },

    getById: async (id: number): Promise<PatioResponseDto> => {
        const { data } = await api.get<PatioResponseDto>(`/patios/${id}`);
        return data;
    },

    create: async (
        payload: PatioRequestDto
    ): Promise<PatioResponseDto> => {
        const { data } = await api.post<PatioResponseDto>("/patios", payload);
        return data;
    },

    update: async (
        id: number,
        payload: PatioRequestDto
    ): Promise<PatioResponseDto> => {
        const { data } = await api.put<PatioResponseDto>(
            `/patios/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/patios/${id}`);
    },
};

// ---------------- BOXES ----------------
export const BoxService = {
    listarPaginadoFiltrado: async (
        filter: BoxFilter = {},
        page = 0,
        size = 10,
        sort = "idBox,asc"
    ): Promise<SpringPage<BoxResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<BoxResponseDto>>(
            "/boxes/search",
            { params }
        );
        return data;
    },

    getById: async (id: number): Promise<BoxResponseDto> => {
        const { data } = await api.get<BoxResponseDto>(`/boxes/${id}`);
        return data;
    },

    create: async (
        payload: BoxRequestDto
    ): Promise<BoxResponseDto> => {
        const { data } = await api.post<BoxResponseDto>("/boxes", payload);
        return data;
    },

    update: async (
        id: number,
        payload: BoxRequestDto
    ): Promise<BoxResponseDto> => {
        const { data } = await api.put<BoxResponseDto>(
            `/boxes/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/boxes/${id}`);
    },
};

// ---------------- ZONAS ----------------
export const ZonaService = {
    listarPaginadoFiltrado: async (
        filter: ZonaFilter = {},
        page = 0,
        size = 10,
        sort = "idZona,asc"
    ): Promise<SpringPage<ZonaResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<ZonaResponseDto>>(
            "/zonas/search",
            { params }
        );
        return data;
    },

    getById: async (id: number): Promise<ZonaResponseDto> => {
        const { data } = await api.get<ZonaResponseDto>(`/zonas/${id}`);
        return data;
    },

    create: async (
        payload: ZonaRequestDto
    ): Promise<ZonaResponseDto> => {
        const { data } = await api.post<ZonaResponseDto>("/zonas", payload);
        return data;
    },

    update: async (
        id: number,
        payload: ZonaRequestDto
    ): Promise<ZonaResponseDto> => {
        const { data } = await api.put<ZonaResponseDto>(
            `/zonas/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/zonas/${id}`);
    },
};

// ---------------- ESTACIONAMENTO ----------------
export const EstacionamentoService = {
    estacionar: async (placa: string): Promise<BoxResponseDto> => {
        const { data } = await api.post<BoxResponseDto>(
            "/estacionamento/estacionar",
            null,
            { params: { placa } }
        );
        return data;
    },

    liberarVaga: async (placa: string): Promise<void> => {
        await api.post("/estacionamento/liberar", null, { params: { placa } });
    },
};

// ---------------- RADAR / OCR ----------------
export const RadarService = {
    iniciarSessao: async (): Promise<{ sessionId: string }> => {
        const { data } = await api.post<{ sessionId: string }>(
            "/radar/iniciar-sessao"
        );
        return data;
    },

    getStatusSessao: async (sessionId: string): Promise<OcrSession> => {
        const { data } = await api.get<OcrSession>(
            `/radar/status-sessao/${encodeURIComponent(sessionId)}`
        );
        return data;
    },

    /**
     * Envia a imagem da placa para o backend.
     * Aceita tanto File quanto FormData. NÃO define headers manualmente.
     */
    uploadImagem: async (sessionId: string, fileOrForm: File | FormData): Promise<any> => {
        const formData =
            fileOrForm instanceof FormData
                ? fileOrForm
                : (() => {
                    const fd = new FormData();
                    fd.append("image", fileOrForm); // nome do campo que o backend espera
                    return fd;
                })();

        const { data } = await api.post(
            `/radar/upload-imagem/${encodeURIComponent(sessionId)}`,
            formData
        );
        return data;
    },
};

export default api;
