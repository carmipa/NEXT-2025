// src/types/box.d.ts

export interface BoxRequestDto {
    nome: string;
    status: 'L' | 'O';
    dataEntrada: string; // "YYYY-MM-DD"
    dataSaida: string;   // "YYYY-MM-DD"
    observacao?: string;
    patioId: number;        // ✅ NOVO - ID do pátio pai
    patioStatus: string;    // ✅ NOVO - Status do pátio pai
}

export interface BoxResponseDto {
    idBox: number;
    nome: string;
    status: 'L' | 'O';
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
    patioId: number;        // ✅ NOVO - ID do pátio pai
    patioStatus: string;    // ✅ NOVO - Status do pátio pai
    patio: {                // ✅ NOVO - Relacionamento com pátio
        idPatio: number;
        nomePatio: string;
    };
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