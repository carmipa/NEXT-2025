// Configuração da API Mottu
export const API_CONFIG = {
    // URL base da API
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    
    // Endpoints disponíveis
    ENDPOINTS: {
        // Pátios
        PATIO: {
            LISTAR: '/api/patios',
            BUSCAR: '/api/patios/search',
            CADASTRAR: '/api/patios',
            ALTERAR: '/api/patios',
            DELETAR: '/api/patios',
            DETALHES: '/api/patios'
        },
        
        // Boxes/Vagas
        BOX: {
            LISTAR: '/api/boxes',
            BUSCAR: '/api/boxes/search',
            CADASTRAR: '/api/boxes',
            ALTERAR: '/api/boxes',
            DELETAR: '/api/boxes',
            DETALHES: '/api/boxes',
            MAPA: '/api/vagas/mapa'
        },
        
        // Veículos
        VEICULO: {
            LISTAR: '/api/veiculos',
            BUSCAR: '/api/veiculos/search',
            CADASTRAR: '/api/veiculos',
            ALTERAR: '/api/veiculos',
            DELETAR: '/api/veiculos',
            DETALHES: '/api/veiculos'
        },
        
        // Clientes
        CLIENTE: {
            LISTAR: '/api/clientes',
            BUSCAR: '/api/clientes/search',
            CADASTRAR: '/api/clientes',
            ALTERAR: '/api/clientes',
            DELETAR: '/api/clientes',
            DETALHES: '/api/clientes'
        },
        
        // Zonas
        ZONA: {
            LISTAR: '/api/zonas',
            BUSCAR: '/api/zonas/search',
            CADASTRAR: '/api/zonas',
            ALTERAR: '/api/zonas',
            DELETAR: '/api/zonas',
            DETALHES: '/api/zonas'
        },
        
        // Dashboard
        DASHBOARD: {
            RESUMO: '/api/dashboard/resumo',
            OCUPACAO_DIA: '/api/dashboard/ocupacao-por-dia',
            TOTAL_VEICULOS: '/api/dashboard/total-veiculos',
            TOTAL_CLIENTES: '/api/dashboard/total-clientes'
        }
    }
};

// Função helper para construir URLs completas
export function buildApiUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Função helper para fazer requisições HTTP
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = buildApiUrl(endpoint);
    
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        },
        ...options
    };
    
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    return response.json();
}
