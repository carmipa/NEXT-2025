// src/types/zona.d.ts

export interface ZonaRequestDto {
    nome: string;
    dataEntrada: string; // "YYYY-MM-DD"
    dataSaida: string;   // "YYYY-MM-DD"
    observacao?: string;
}

export interface ZonaResponseDto {
    idZona: number;
    nome: string;
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
}

export interface ZonaFilter {
    nome?: string;
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
    boxNome?: string;
    veiculoPlaca?: string;
    patioNome?: string;
}