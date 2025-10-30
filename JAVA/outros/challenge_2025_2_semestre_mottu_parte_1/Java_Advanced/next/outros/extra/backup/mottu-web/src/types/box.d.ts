// src/types/box.d.ts

export interface BoxRequestDto {
    nome: string;
    status: 'L' | 'O';
    dataEntrada: string; // "YYYY-MM-DD"
    dataSaida: string;   // "YYYY-MM-DD"
    observacao?: string;
}

export interface BoxResponseDto {
    idBox: number;
    nome: string;
    status: 'L' | 'O';
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
}

export interface BoxFilter {
    nome?: string;
    status?: 'L' | 'O';
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
}