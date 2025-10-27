// src/types/box.d.ts (ou src/types/box.ts)

// DTO de Requisição (para criar ou atualizar um Box)
export interface BoxRequestDto {
    nome: string;
    status: 'L' | 'O'; // 'L' para Livre, 'O' para Ocupado (conforme seu Java)
    dataEntrada: string; // Formato "YYYY-MM-DD" (LocalDate em Java)
    dataSaida: string;   // Formato "YYYY-MM-DD" (LocalDate em Java)
    observacao?: string; // Opcional
}

// DTO de Resposta (para receber dados de um Box)
export interface BoxResponseDto {
    idBox: number;
    nome: string;
    status: 'L' | 'O';
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
}

// Interface para os filtros da busca
export interface BoxFilter {
    nome?: string;
    status?: 'L' | 'O';
    dataEntradaInicio?: string; // Para filtros de range de data
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
}