// src/types/zona.d.ts

// DTO de Requisição (para criar ou atualizar uma Zona)
export interface ZonaRequestDto {
    nome: string;
    dataEntrada: string; // Formato "YYYY-MM-DD"
    dataSaida: string;   // Formato "YYYY-MM-DD"
    observacao?: string; // Opcional
}

// DTO de Resposta (para receber dados de uma Zona)
export interface ZonaResponseDto {
    idZona: number;
    nome: string;
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
}

// Interface para os filtros da busca de Zona
export interface ZonaFilter {
    nome?: string;
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
    // Campos para filtros de relacionamento (usados em ZonaSpecification.java)
    boxNome?: string;
    veiculoPlaca?: string;
    patioNome?: string;
}