// src/types/patio.d.ts

export interface PatioRequestDto {
    nomePatio: string;
    dataEntrada: string; // "YYYY-MM-DD"
    dataSaida: string;   // "YYYY-MM-DD"
    observacao?: string;
}

export interface PatioResponseDto {
    idPatio: number;
    nomePatio: string;
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
}

export interface PatioFilter {
    nomePatio?: string;
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
    veiculoPlaca?: string;
    enderecoCidade?: string;
    contatoEmail?: string;
    zonaNome?: string;
}