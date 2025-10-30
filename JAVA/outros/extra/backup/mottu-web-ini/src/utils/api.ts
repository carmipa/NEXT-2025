// src/utils/api.ts
import axios from 'axios';

// ===============================================================
// IMPORTAÇÕES DE INTERFACES DTOs, FILTROS E TIPOS COMUNS
// ===============================================================
import { BoxResponseDto, BoxFilter, BoxRequestDto } from '@/types/box';
import { ContatoResponseDto, ContatoFilter, ContatoRequestDto, EnderecoResponseDto, EnderecoFilter, EnderecoRequestDto, ClienteResponseDto, ClienteFilter, ClienteRequestDto } from '@/types/cliente';
import { PatioResponseDto, PatioFilter, PatioRequestDto } from '@/types/patio';
import { RastreamentoResponseDto, RastreamentoFilter, RastreamentoRequestDto, VeiculoResponseDto, VeiculoFilter, VeiculoRequestDto, VeiculoLocalizacaoResponseDto } from '@/types/veiculo';
import { ZonaResponseDto, ZonaFilter, ZonaRequestDto } from '@/types/zona';

// Interface para a resposta paginada do Spring Boot
// (Idealmente, mova para src/types/common.d.ts e importe aqui)
export interface SpringPage<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number; // current page (0-indexed)
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}


// ===============================================================
// CONFIGURAÇÃO DA INSTÂNCIA AXIOS
// ===============================================================
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
const API_BASE_URL = 'http://localhost:8080/api'; // Forçando para teste local
console.log('API Base URL em uso (forçada para teste local):', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===============================================================
// DEFINIÇÃO DOS SERVIÇOS DA API
// ===============================================================

export const BoxService = {
    getAll: async (filterParams: BoxFilter = {}): Promise<BoxResponseDto[]> => {
        try {
            const response = await api.get<BoxResponseDto[]>('/boxes', { params: filterParams });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar boxes:', error.response?.data || error.message);
            throw error;
        }
    },
    getById: async (id: number): Promise<BoxResponseDto> => {
        try {
            const response = await api.get<BoxResponseDto>(`/boxes/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar box com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (boxData: BoxRequestDto): Promise<BoxResponseDto> => {
        try {
            const response = await api.post<BoxResponseDto>('/boxes', boxData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar box:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, boxData: BoxRequestDto): Promise<BoxResponseDto> => {
        try {
            const response = await api.put<BoxResponseDto>(`/boxes/${id}`, boxData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar box com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/boxes/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar box com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

export const EnderecoService = {
    // ... (manter métodos existentes)
    getAll: async (filterParams: EnderecoFilter = {}): Promise<EnderecoResponseDto[]> => {
        try {
            const response = await api.get<EnderecoResponseDto[]>('/enderecos', { params: filterParams });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar endereços:', error.response?.data || error.message);
            throw error;
        }
    },
    getById: async (id: number): Promise<EnderecoResponseDto> => {
        try {
            const response = await api.get<EnderecoResponseDto>(`/enderecos/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar endereço com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (enderecoData: EnderecoRequestDto): Promise<EnderecoResponseDto> => {
        try {
            const response = await api.post<EnderecoResponseDto>('/enderecos', enderecoData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar endereço:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, enderecoData: EnderecoRequestDto): Promise<EnderecoResponseDto> => {
        try {
            const response = await api.put<EnderecoResponseDto>(`/enderecos/${id}`, enderecoData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar endereço com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/enderecos/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar endereço com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

export const ContatoService = {
    // ... (manter métodos existentes)
    getAll: async (filterParams: ContatoFilter = {}): Promise<ContatoResponseDto[]> => {
        try {
            const response = await api.get<ContatoResponseDto[]>('/contatos', { params: filterParams });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar contatos:', error.response?.data || error.message);
            throw error;
        }
    },
    getById: async (id: number): Promise<ContatoResponseDto> => {
        try {
            const response = await api.get<ContatoResponseDto>(`/contatos/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar contato com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (contatoData: ContatoRequestDto): Promise<ContatoResponseDto> => {
        try {
            const response = await api.post<ContatoResponseDto>('/contatos', contatoData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar contato:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, contatoData: ContatoRequestDto): Promise<ContatoResponseDto> => {
        try {
            const response = await api.put<ContatoResponseDto>(`/contatos/${id}`, contatoData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar contato com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/contatos/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar contato com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

export const ClienteService = {
    /**
     * Busca clientes de forma paginada e com filtros.
     * Este método deve ser usado tanto para listagem geral paginada quanto para buscas filtradas.
     * @param filterParams Objeto com os parâmetros de filtro.
     * @param page Número da página (0-indexed).
     * @param size Quantidade de itens por página.
     * @param sort Parâmetro de ordenação (ex: "nome,asc" ou "dataCadastro,desc").
     * @returns Uma Promise que resolve com um objeto SpringPage<ClienteResponseDto>.
     */
    listarPaginadoFiltrado: async (
        filterParams: ClienteFilter = {},
        page: number = 0,
        size: number = 10,
        sort: string = 'nome,asc' // Ordenação padrão
    ): Promise<SpringPage<ClienteResponseDto>> => {
        try {
            const params: any = { ...filterParams, page, size, sort };
            // Remove chaves de filtro que são strings vazias ou nulas/undefined para não enviar parâmetros desnecessários
            Object.keys(params).forEach(key => {
                const filterKey = key as keyof typeof params;
                if (params[filterKey] === null || params[filterKey] === undefined ||
                    (typeof params[filterKey] === 'string' && (params[filterKey] as string).trim() === '')) {
                    delete params[filterKey];
                }
            });

            // Define o endpoint baseado na presença de filtros.
            // Se houver filtros (além de page, size, sort), usa /search. Caso contrário, usa /clientes.
            // No entanto, o backend GET /api/clientes já aceita Pageable e o ClienteController.buscarClientesPorFiltro
            // usa GET /api/clientes/search.
            // Para simplificar e ter um único método robusto, vamos sempre usar o endpoint que aceita filtros e paginação.
            // O backend ClienteController.listarTodosClientes é para GET /api/clientes (sem filtros de ClienteFilter)
            // O backend ClienteController.buscarClientesPorFiltro é para GET /api/clientes/search (com ClienteFilter)

            // CORREÇÃO: Usar o endpoint /clientes/search se houver filtros, ou /clientes se não houver filtros de entidade.
            // Ou, melhor ainda, ter um único endpoint no backend que aceite filtros opcionais.
            // Por agora, vamos assumir que o backend /clientes aceita os filtros como query params e também paginação.
            // Se o backend tiver um endpoint dedicado /clientes/search para filtros, mude a URL abaixo.
            // Com base na sua estrutura de backend, o endpoint que aceita ClienteFilter e Pageable é /api/clientes/search

            let endpoint = '/clientes';
            const filterKeys = Object.keys(filterParams).filter(k => filterParams[k as keyof ClienteFilter] !== '' && filterParams[k as keyof ClienteFilter] !== undefined && filterParams[k as keyof ClienteFilter] !== null);

            if (filterKeys.length > 0) {
                endpoint = '/clientes/search'; // Endpoint correto para filtros no seu backend
            }
            // Se não houver filtros de entidade, os parâmetros de paginação ainda serão enviados para /clientes
            // que o backend ClienteController.listarTodosClientes deve tratar.

            console.log(`Buscando clientes em ${endpoint} com params:`, params);
            const response = await api.get<SpringPage<ClienteResponseDto>>(endpoint, { params });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar clientes paginados e filtrados:', error.response?.data || error.message);
            throw error;
        }
    },

    getById: async (id: number): Promise<ClienteResponseDto> => {
        try {
            const response = await api.get<ClienteResponseDto>(`/clientes/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar cliente com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (clienteData: ClienteRequestDto): Promise<ClienteResponseDto> => {
        try {
            const response = await api.post<ClienteResponseDto>('/clientes', clienteData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar cliente:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, clienteData: ClienteRequestDto): Promise<ClienteResponseDto> => {
        try {
            const response = await api.put<ClienteResponseDto>(`/clientes/${id}`, clienteData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar cliente com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/clientes/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar cliente com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getVeiculosByClienteId: async (clienteId: number): Promise<VeiculoResponseDto[]> => {
        try {
            const response = await api.get<VeiculoResponseDto[]>(`/clientes/${clienteId}/veiculos`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar veículos do cliente ${clienteId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarVeiculo: async (clienteId: number, enderecoId: number, contatoId: number, veiculoId: number): Promise<any> => {
        try {
            const response = await api.post(`/clientes/${clienteId}/enderecos/${enderecoId}/contatos/${contatoId}/veiculos/${veiculoId}/associar`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao associar veículo ${veiculoId} ao cliente ${clienteId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarVeiculo: async (clienteId: number, enderecoId: number, contatoId: number, veiculoId: number): Promise<void> => {
        try {
            const response = await api.delete(`/clientes/${clienteId}/enderecos/${enderecoId}/contatos/${contatoId}/veiculos/${veiculoId}/desassociar`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao desassociar veículo ${veiculoId} do cliente ${clienteId}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

export const PatioService = {
    getAll: async (filterParams: PatioFilter = {}): Promise<PatioResponseDto[]> => {
        try {
            const response = await api.get<PatioResponseDto[]>('/patios', { params: filterParams });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar pátios:', error.response?.data || error.message);
            throw error;
        }
    },
    getById: async (id: number): Promise<PatioResponseDto> => {
        try {
            const response = await api.get<PatioResponseDto>(`/patios/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar pátio com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (patioData: PatioRequestDto): Promise<PatioResponseDto> => {
        try {
            const response = await api.post<PatioResponseDto>('/patios', patioData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar pátio:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, patioData: PatioRequestDto): Promise<PatioResponseDto> => {
        try {
            const response = await api.put<PatioResponseDto>(`/patios/${id}`, patioData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar pátio com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/patios/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar pátio com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarVeiculo: async (patioId: number, veiculoId: number): Promise<void> => {
        try {
            await api.post(`/patios/${patioId}/veiculos/${veiculoId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar veículo ${veiculoId} ao pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarVeiculo: async (patioId: number, veiculoId: number): Promise<void> => {
        try {
            await api.delete(`/patios/${patioId}/veiculos/${veiculoId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar veículo ${veiculoId} do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getVeiculosByPatioId: async (patioId: number): Promise<VeiculoResponseDto[]> => {
        try {
            const response = await api.get<VeiculoResponseDto[]>(`/patios/${patioId}/veiculos`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar veículos do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarZona: async (patioId: number, zonaId: number): Promise<void> => {
        try {
            await api.post(`/patios/${patioId}/zonas/${zonaId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar zona ${zonaId} ao pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarZona: async (patioId: number, zonaId: number): Promise<void> => {
        try {
            await api.delete(`/patios/${patioId}/zonas/${zonaId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar zona ${zonaId} do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getZonasByPatioId: async (patioId: number): Promise<ZonaResponseDto[]> => {
        try {
            const response = await api.get<ZonaResponseDto[]>(`/patios/${patioId}/zonas`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar zonas do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarContato: async (patioId: number, contatoId: number): Promise<void> => {
        try {
            await api.post(`/patios/${patioId}/contatos/${contatoId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar contato ${contatoId} ao pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarContato: async (patioId: number, contatoId: number): Promise<void> => {
        try {
            await api.delete(`/patios/${patioId}/contatos/${contatoId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar contato ${contatoId} do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getContatosByPatioId: async (patioId: number): Promise<ContatoResponseDto[]> => {
        try {
            const response = await api.get<ContatoResponseDto[]>(`/patios/${patioId}/contatos`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar contatos do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarEndereco: async (patioId: number, enderecoId: number): Promise<void> => {
        try {
            await api.post(`/patios/${patioId}/enderecos/${enderecoId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar endereço ${enderecoId} ao pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarEndereco: async (patioId: number, enderecoId: number): Promise<void> => {
        try {
            await api.delete(`/patios/${patioId}/enderecos/${enderecoId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar endereço ${enderecoId} do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getEnderecosByPatioId: async (patioId: number): Promise<EnderecoResponseDto[]> => {
        try {
            const response = await api.get<EnderecoResponseDto[]>(`/patios/${patioId}/enderecos`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar endereços do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarBox: async (patioId: number, boxId: number): Promise<void> => {
        try {
            await api.post(`/patios/${patioId}/boxes/${boxId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar box ${boxId} ao pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarBox: async (patioId: number, boxId: number): Promise<void> => {
        try {
            await api.delete(`/patios/${patioId}/boxes/${boxId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar box ${boxId} do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getBoxesByPatioId: async (patioId: number): Promise<BoxResponseDto[]> => {
        try {
            const response = await api.get<BoxResponseDto[]>(`/patios/${patioId}/boxes`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar boxes do pátio ${patioId}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

export const RastreamentoService = {
    getAll: async (filterParams: RastreamentoFilter = {}): Promise<RastreamentoResponseDto[]> => {
        try {
            const response = await api.get<RastreamentoResponseDto[]>('/rastreamentos', { params: filterParams });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar rastreamentos:', error.response?.data || error.message);
            throw error;
        }
    },
    getById: async (id: number): Promise<RastreamentoResponseDto> => {
        try {
            const response = await api.get<RastreamentoResponseDto>(`/rastreamentos/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar rastreamento com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (rastreamentoData: RastreamentoRequestDto): Promise<RastreamentoResponseDto> => {
        try {
            const response = await api.post<RastreamentoResponseDto>('/rastreamentos', rastreamentoData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar rastreamento:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, rastreamentoData: RastreamentoRequestDto): Promise<RastreamentoResponseDto> => {
        try {
            const response = await api.put<RastreamentoResponseDto>(`/rastreamentos/${id}`, rastreamentoData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar rastreamento com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/rastreamentos/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar rastreamento com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

export const VeiculoService = {
    getAll: async (filterParams: VeiculoFilter = {}): Promise<VeiculoResponseDto[]> => {
        try {
            const response = await api.get<VeiculoResponseDto[]>('/veiculos', { params: filterParams });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar veículos:', error.response?.data || error.message);
            throw error;
        }
    },
    getById: async (id: number): Promise<VeiculoResponseDto> => {
        try {
            const response = await api.get<VeiculoResponseDto>(`/veiculos/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar veículo com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (veiculoData: VeiculoRequestDto): Promise<VeiculoResponseDto> => {
        try {
            const response = await api.post<VeiculoResponseDto>('/veiculos', veiculoData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar veículo:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, veiculoData: VeiculoRequestDto): Promise<VeiculoResponseDto> => {
        try {
            const response = await api.put<VeiculoResponseDto>(`/veiculos/${id}`, veiculoData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar veículo com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/veiculos/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar veículo com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getLocalizacao: async (id: number): Promise<VeiculoLocalizacaoResponseDto> => {
        try {
            const response = await api.get<VeiculoLocalizacaoResponseDto>(`/veiculos/${id}/localizacao`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar localização do veículo ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarRastreamento: async (veiculoId: number, rastreamentoId: number): Promise<void> => {
        try {
            await api.post(`/veiculos/${veiculoId}/rastreamentos/${rastreamentoId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar rastreamento ${rastreamentoId} ao veículo ${veiculoId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarRastreamento: async (veiculoId: number, rastreamentoId: number): Promise<void> => {
        try {
            await api.delete(`/veiculos/${veiculoId}/rastreamentos/${rastreamentoId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar rastreamento ${rastreamentoId} do veículo ${veiculoId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getRastreamentosByVeiculoId: async (veiculoId: number): Promise<RastreamentoResponseDto[]> => {
        try {
            const response = await api.get<RastreamentoResponseDto[]>(`/veiculos/${veiculoId}/rastreamentos`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar rastreamentos do veículo ${veiculoId}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

export const ZonaService = {
    getAll: async (filterParams: ZonaFilter = {}): Promise<ZonaResponseDto[]> => {
        try {
            const response = await api.get<ZonaResponseDto[]>('/zonas', { params: filterParams });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar zonas:', error.response?.data || error.message);
            throw error;
        }
    },
    getById: async (id: number): Promise<ZonaResponseDto> => {
        try {
            const response = await api.get<ZonaResponseDto>(`/zonas/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar zona com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    create: async (zonaData: ZonaRequestDto): Promise<ZonaResponseDto> => {
        try {
            const response = await api.post<ZonaResponseDto>('/zonas', zonaData);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar zona:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id: number, zonaData: ZonaRequestDto): Promise<ZonaResponseDto> => {
        try {
            const response = await api.put<ZonaResponseDto>(`/zonas/${id}`, zonaData);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao atualizar zona com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/zonas/${id}`);
        } catch (error: any) {
            console.error(`Erro ao deletar zona com ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarBox: async (zonaId: number, boxId: number): Promise<void> => {
        try {
            await api.post(`/zonas/${zonaId}/boxes/${boxId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar box ${boxId} à zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarBox: async (zonaId: number, boxId: number): Promise<void> => {
        try {
            await api.delete(`/zonas/${zonaId}/boxes/${boxId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar box ${boxId} da zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getBoxesByZonaId: async (zonaId: number): Promise<BoxResponseDto[]> => {
        try {
            const response = await api.get<BoxResponseDto[]>(`/zonas/${zonaId}/boxes`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar boxes da zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarVeiculo: async (zonaId: number, veiculoId: number): Promise<void> => {
        try {
            await api.post(`/zonas/${zonaId}/veiculos/${veiculoId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar veículo ${veiculoId} à zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarVeiculo: async (zonaId: number, veiculoId: number): Promise<void> => {
        try {
            await api.delete(`/zonas/${zonaId}/veiculos/${veiculoId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar veículo ${veiculoId} da zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getVeiculosByZonaId: async (zonaId: number): Promise<VeiculoResponseDto[]> => {
        try {
            const response = await api.get<VeiculoResponseDto[]>(`/zonas/${zonaId}/veiculos`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar veículos da zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    associarPatio: async (zonaId: number, patioId: number): Promise<void> => {
        try {
            await api.post(`/zonas/${zonaId}/patios/${patioId}/associar`);
        } catch (error: any) {
            console.error(`Erro ao associar pátio ${patioId} à zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    desassociarPatio: async (zonaId: number, patioId: number): Promise<void> => {
        try {
            await api.delete(`/zonas/${zonaId}/patios/${patioId}/desassociar`);
        } catch (error: any) {
            console.error(`Erro ao desassociar pátio ${patioId} da zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
    getPatiosByZonaId: async (zonaId: number): Promise<PatioResponseDto[]> => {
        try {
            const response = await api.get<PatioResponseDto[]>(`/zonas/${zonaId}/patios`);
            return response.data;
        } catch (error: any) {
            console.error(`Erro ao buscar pátios da zona ${zonaId}:`, error.response?.data || error.message);
            throw error;
        }
    },
};

// ===============================================================
// EXPORT DEFAULT DA INSTÂNCIA AXIOS
// ===============================================================
export default api;
