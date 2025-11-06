// mottu-web/src/utils/api.ts

import axios from "axios";
import { SpringPage } from "@/types/common";
import {
    createExceptionFromResponse,
    ApiException,
    ResourceNotFoundException,
    ResourceInUseException,
    OperationNotAllowedException,
    ValidationException,
    DuplicatedResourceException,
    InvalidInputException,
} from "@/utils/exceptions";
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

import { 
    ContatoRequestDto,
    ContatoResponseDto,
    ContatoFilter
} from "@/types/contato";
import { 
    EnderecoRequestDto,
    EnderecoResponseDto,
    EnderecoFilter
} from "@/types/endereco";
import {
    EstacionamentoRequestDto,
    EstacionamentoResponseDto,
    EstacionamentoFilter,
    PlacaRequestDto,
    EstacionamentoPage,
    EstacionamentoDataTableResponse,
} from "@/types/estacionamento";
import { DataTableRequest } from "@/types/datatable";

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
    // Configuração para não tentar fazer parse de respostas vazias
    validateStatus: (status) => {
        return status >= 200 && status < 300; // aceita 2xx incluindo 204
    },
});

// Interceptor para tratar respostas vazias (204 No Content)
api.interceptors.response.use(
    (response) => {
        // Se a resposta é 204 No Content (sem corpo), retorna response diretamente
        if (response.status === 204 || response.data === '') {
            return { ...response, data: null };
        }
        return response;
    },
    (error) => {
        // Trata erros de parsing JSON quando a resposta está vazia
        if (error.response?.status === 204) {
            // 204 é sucesso, não erro
            return Promise.resolve({ data: null, status: 204, headers: error.response.headers });
        }
        
        // Se o erro for de parsing JSON com resposta vazia e status 2xx
        if (error.message?.includes('Unexpected end of JSON input') && 
            error.response?.status >= 200 && error.response?.status < 300) {
            // Resposta vazia válida (como 204)
            return Promise.resolve({ data: null, status: error.response.status, headers: error.response.headers });
        }
        
        // Converte erro para exceção personalizada
        throw createExceptionFromResponse(error);
    }
);

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

    // NOVO MÉTODO:
    listarEstacionados: async (): Promise<VeiculoLocalizacaoResponseDto[]> => {
        const { data } = await api.get<VeiculoLocalizacaoResponseDto[]>('/veiculos/estacionados');
        return data;
    },

    // NOVO MÉTODO: Gerar próxima Tag BLE automaticamente
    gerarProximaTagBle: async (): Promise<string> => {
        const { data } = await api.get<{ tagBleId: string }>('/veiculos/proxima-tag-ble');
        return data.tagBleId;
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
        const { data} = await api.put<PatioResponseDto>(
            `/patios/${id}`,
            payload
        );
        return data;
    },

    updateStatus: async (
        id: number,
        status: 'A' | 'I'
    ): Promise<PatioResponseDto> => {
        const { data } = await api.patch<PatioResponseDto>(
            `/patios/${id}/status`,
            null,
            { params: { status } }
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/patios/${id}`);
    },

    // Endpoint para criar pátio completo via wizard
    createCompleto: async (payload: any): Promise<PatioResponseDto> => {
        const { data } = await api.post<PatioResponseDto>("/patios/completo", payload);
        return data;
    },
};

// ---------------- BOXES ----------------
export const BoxService = {
    // ✅ MÉTODOS LEGADOS - Mantidos para compatibilidade
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

    // NOVO MÉTODO: Adicione esta função para chamar o endpoint de geração em lote.
    gerarEmLote: async (prefixo: string, quantidade: number): Promise<string> => {
        const payload = { prefixo, quantidade };
        const { data } = await api.post<string>('/boxes/gerar-em-lote', payload);
        return data;
    },

    // ✅ NOVOS MÉTODOS HIERÁRQUICOS
    listarPorPatio: async (
        patioId: number, 
        patioStatus: string, 
        page = 0, 
        size = 10
    ): Promise<SpringPage<BoxResponseDto>> => {
        const { data } = await api.get<SpringPage<BoxResponseDto>>(
            `/patios/${patioId}/status/${patioStatus}/boxes`,
            { params: { page, size } }
        );
        return data;
    },

    createPorPatio: async (
        patioId: number, 
        patioStatus: string, 
        payload: Omit<BoxRequestDto, 'patioId' | 'patioStatus'>
    ): Promise<BoxResponseDto> => {
        const { data } = await api.post<BoxResponseDto>(
            `/patios/${patioId}/status/${patioStatus}/boxes`,
            { ...payload, patioId, patioStatus }
        );
        return data;
    },

    updatePorPatio: async (
        patioId: number, 
        patioStatus: string, 
        id: number, 
        payload: Omit<BoxRequestDto, 'patioId' | 'patioStatus'>
    ): Promise<BoxResponseDto> => {
        const { data } = await api.put<BoxResponseDto>(
            `/patios/${patioId}/status/${patioStatus}/boxes/${id}`,
            { ...payload, patioId, patioStatus }
        );
        return data;
    },

    deletePorPatio: async (
        patioId: number, 
        patioStatus: string, 
        id: number
    ): Promise<void> => {
        await api.delete(`/patios/${patioId}/status/${patioStatus}/boxes/${id}`);
    },

    getByIdPorPatio: async (
        patioId: number, 
        patioStatus: string, 
        id: number
    ): Promise<BoxResponseDto> => {
        const { data } = await api.get<BoxResponseDto>(
            `/patios/${patioId}/status/${patioStatus}/boxes/${id}`
        );
        return data;
    },

    // ✅ NOVO MÉTODO: Geração em lote por pátio
    gerarEmLotePorPatio: async (
        patioId: number, 
        patioStatus: string, 
        prefixo: string, 
        quantidade: number
    ): Promise<string> => {
        const payload = { prefixo, quantidade, patioId, patioStatus };
        const { data } = await api.post<string>(
            `/patios/${patioId}/status/${patioStatus}/boxes/gerar-em-lote`, 
            payload
        );
        return data;
    },
};

// ---------------- ZONAS ----------------
export const ZonaService = {
    // ✅ MÉTODOS LEGADOS - Mantidos para compatibilidade
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

    // ✅ NOVOS MÉTODOS HIERÁRQUICOS
    listarPorPatio: async (
        patioId: number, 
        patioStatus: string, 
        page = 0, 
        size = 10
    ): Promise<SpringPage<ZonaResponseDto>> => {
        const { data } = await api.get<SpringPage<ZonaResponseDto>>(
            `/patios/${patioId}/status/${patioStatus}/zonas`,
            { params: { page, size } }
        );
        return data;
    },

    createPorPatio: async (
        patioId: number, 
        patioStatus: string, 
        payload: Omit<ZonaRequestDto, 'patioId' | 'patioStatus'>
    ): Promise<ZonaResponseDto> => {
        const { data } = await api.post<ZonaResponseDto>(
            `/patios/${patioId}/status/${patioStatus}/zonas`,
            { ...payload, patioId, patioStatus }
        );
        return data;
    },

    updatePorPatio: async (
        patioId: number, 
        patioStatus: string, 
        id: number, 
        payload: Omit<ZonaRequestDto, 'patioId' | 'patioStatus'>
    ): Promise<ZonaResponseDto> => {
        const { data } = await api.put<ZonaResponseDto>(
            `/patios/${patioId}/status/${patioStatus}/zonas/${id}`,
            { ...payload, patioId, patioStatus }
        );
        return data;
    },

    deletePorPatio: async (
        patioId: number, 
        patioStatus: string, 
        id: number
    ): Promise<void> => {
        await api.delete(`/patios/${patioId}/status/${patioStatus}/zonas/${id}`);
    },

    getByIdPorPatio: async (
        patioId: number, 
        patioStatus: string, 
        id: number
    ): Promise<ZonaResponseDto> => {
        const { data } = await api.get<ZonaResponseDto>(
            `/patios/${patioId}/status/${patioStatus}/zonas/${id}`
        );
        return data;
    },
};

// ---------------- ESTACIONAMENTO ----------------
export const EstacionamentoService = {
    // Listar todos com paginação e filtros
    listarPaginadoFiltrado: async (
        filter: EstacionamentoFilter = {},
        page = 0,
        size = 10,
        sort = "dataUltimaAtualizacao,desc"
    ): Promise<EstacionamentoPage> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<EstacionamentoPage>(
            "/estacionamentos/search",
            { params }
        );
        return data;
    },

    // Buscar por ID
    getById: async (id: number): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.get<EstacionamentoResponseDto>(`/estacionamentos/${id}`);
        return data;
    },

    // Listar estacionamentos ativos (com paginação)
    listarAtivos: async (
        page = 0,
        size = 100,
        sort = "dataUltimaAtualizacao,desc"
    ): Promise<EstacionamentoPage> => {
        const { data } = await api.get<EstacionamentoPage>(
            "/estacionamentos/ativos",
            { params: { page, size, sort } }
        );
        return data;
    },

    // Listar todos os ativos (sem paginação, para SSE e dashboards)
    listarTodosAtivos: async (): Promise<EstacionamentoResponseDto[]> => {
        const { data } = await api.get<EstacionamentoResponseDto[]>(
            "/estacionamentos/ativos/todos"
        );
        return data;
    },

    // Buscar estacionamento ativo por placa
    buscarAtivoPorPlaca: async (placa: string): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.get<EstacionamentoResponseDto>(
            `/estacionamentos/placa/${encodeURIComponent(placa)}`
        );
        return data;
    },

    // Verificar se veículo está estacionado
    verificarSeEstaEstacionado: async (placa: string): Promise<boolean> => {
        const { data } = await api.get<boolean>(
            `/estacionamentos/placa/${encodeURIComponent(placa)}/verificar`
        );
        return data;
    },

    // Listar estacionamentos ativos por pátio
    listarAtivosPorPatio: async (patioId: number): Promise<EstacionamentoResponseDto[]> => {
        const { data } = await api.get<EstacionamentoResponseDto[]>(
            `/estacionamentos/patio/${patioId}/ativos`
        );
        return data;
    },

    // Histórico de estacionamentos por veículo
    buscarHistoricoPorVeiculo: async (
        veiculoId: number,
        page = 0,
        size = 20
    ): Promise<EstacionamentoPage> => {
        const { data } = await api.get<EstacionamentoPage>(
            `/estacionamentos/veiculo/${veiculoId}/historico`,
            { params: { page, size } }
        );
        return data;
    },

    // Histórico de estacionamentos por placa
    buscarHistoricoPorPlaca: async (
        placa: string,
        page = 0,
        size = 20
    ): Promise<EstacionamentoPage> => {
        const { data } = await api.get<EstacionamentoPage>(
            `/estacionamentos/placa/${encodeURIComponent(placa)}/historico`,
            { params: { page, size } }
        );
        return data;
    },

    // Estacionar veículo (NOVO - usa nova API /estacionamentos/estacionar)
    estacionar: async (
        placa: string,
        boxId?: number | null,
        patioId?: number | null,
        observacoes?: string
    ): Promise<EstacionamentoResponseDto> => {
        const payload: PlacaRequestDto = { placa };
        const params: Record<string, any> = {};
        if (boxId !== undefined && boxId !== null) params.boxId = boxId;
        if (patioId !== undefined && patioId !== null) params.patioId = patioId;
        if (observacoes) params.observacoes = observacoes;
        
        const { data } = await api.post<EstacionamentoResponseDto>(
            "/estacionamentos/estacionar",
            payload,
            { params }
        );
        return data;
    },

    // Liberar veículo (NOVO - usa nova API /estacionamentos/liberar)
    liberar: async (placa: string, observacoes?: string): Promise<EstacionamentoResponseDto> => {
        const payload: PlacaRequestDto = { placa };
        const params: Record<string, any> = {};
        if (observacoes) params.observacoes = observacoes;
        
        const { data } = await api.post<EstacionamentoResponseDto>(
            "/estacionamentos/liberar",
            payload,
            { params }
        );
        return data;
    },

    // Criar estacionamento (genérico)
    criar: async (payload: EstacionamentoRequestDto): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.post<EstacionamentoResponseDto>("/estacionamentos", payload);
        return data;
    },

    // Atualizar estacionamento
    atualizar: async (
        id: number,
        payload: EstacionamentoRequestDto
    ): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.put<EstacionamentoResponseDto>(
            `/estacionamentos/${id}`,
            payload
        );
        return data;
    },

    // Deletar estacionamento
    deletar: async (id: number): Promise<void> => {
        await api.delete(`/estacionamentos/${id}`);
    },

    // Estatísticas - contar estacionados
    contarEstacionados: async (): Promise<number> => {
        const { data } = await api.get<number>("/estacionamentos/estatisticas/total-ativos");
        return data;
    },

    // Estatísticas - contar estacionados por pátio
    contarEstacionadosPorPatio: async (patioId: number): Promise<number> => {
        const { data } = await api.get<number>(
            `/estacionamentos/estatisticas/patio/${patioId}/total-ativos`
        );
        return data;
    },

    // DataTable support
    buscarParaDataTable: async (
        request: DataTableRequest,
        filter?: EstacionamentoFilter
    ): Promise<EstacionamentoDataTableResponse> => {
        const { data } = await api.post<EstacionamentoDataTableResponse>(
            "/estacionamentos/datatable",
            request,
            { params: cleanFilterParams(filter || {}) }
        );
        return data;
    },

    // MÉTODO LEGADO (mantido para compatibilidade)
    // @deprecated Use liberar() em vez disso
    liberarVaga: async (placa: string): Promise<void> => {
        await EstacionamentoService.liberar(placa);
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

// ---------------- CONTATOS ----------------
export const ContatoService = {
    listarPaginadoFiltrado: async (
        filter: ContatoFilter = {},
        page = 0,
        size = 10,
        sort = "idContato,asc"
    ): Promise<SpringPage<ContatoResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<ContatoResponseDto>>(
            "/contatos/search",
            { params }
        );
        return data;
    },

    listarTodos: async (): Promise<ContatoResponseDto[]> => {
        const { data } = await api.get<ContatoResponseDto[]>("/contatos/all");
        return data;
    },

    getById: async (id: number): Promise<ContatoResponseDto> => {
        const { data } = await api.get<ContatoResponseDto>(`/contatos/${id}`);
        return data;
    },

    create: async (
        payload: ContatoRequestDto
    ): Promise<ContatoResponseDto> => {
        const { data } = await api.post<ContatoResponseDto>("/contatos", payload);
        return data;
    },

    update: async (
        id: number,
        payload: ContatoRequestDto
    ): Promise<ContatoResponseDto> => {
        const { data } = await api.put<ContatoResponseDto>(
            `/contatos/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/contatos/${id}`);
    },
};

// ---------------- ENDEREÇOS ----------------
export const EnderecoService = {
    listarPaginadoFiltrado: async (
        filter: EnderecoFilter = {},
        page = 0,
        size = 10,
        sort = "idEndereco,asc"
    ): Promise<SpringPage<EnderecoResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<EnderecoResponseDto>>(
            "/enderecos/search",
            { params }
        );
        return data;
    },

    listarTodos: async (): Promise<EnderecoResponseDto[]> => {
        const { data } = await api.get<EnderecoResponseDto[]>("/enderecos/all");
        return data;
    },

    getById: async (id: number): Promise<EnderecoResponseDto> => {
        const { data } = await api.get<EnderecoResponseDto>(`/enderecos/${id}`);
        return data;
    },

    create: async (
        payload: EnderecoRequestDto
    ): Promise<EnderecoResponseDto> => {
        const { data } = await api.post<EnderecoResponseDto>("/enderecos", payload);
        return data;
    },

    update: async (
        id: number,
        payload: EnderecoRequestDto
    ): Promise<EnderecoResponseDto> => {
        const { data } = await api.put<EnderecoResponseDto>(
            `/enderecos/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/enderecos/${id}`);
    },

    // Método para buscar dados do CEP via ViaCEP
    buscarCep: async (cep: string): Promise<any> => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            throw new Error('CEP deve ter 8 dígitos');
        }
        
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar CEP: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.erro) {
            throw new Error('CEP não encontrado ou inválido');
        }
        
        return {
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
            pais: 'Brasil'
        };
    },
};

export default api;
