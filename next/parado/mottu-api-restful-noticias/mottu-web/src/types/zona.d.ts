// src/types/zona.d.ts

export interface ZonaRequestDto {
    nome: string;
    status: string;         // ✅ NOVO - Status da zona (A=Ativa, I=Inativa)
    observacao?: string;
    patioId: number;        // ✅ NOVO - ID do pátio pai
    patioStatus: string;    // ✅ NOVO - Status do pátio pai
}

export interface ZonaResponseDto {
    idZona: number;
    nome: string;
    status: string;         // ✅ NOVO - Status da zona (A=Ativa, I=Inativa)
    observacao?: string;
    patioId: number;        // ✅ NOVO - ID do pátio pai
    patioStatus: string;    // ✅ NOVO - Status do pátio pai
    patio: {                // ✅ NOVO - Relacionamento com pátio
        idPatio: number;
        nomePatio: string;
    };
    // Campos legados mantidos para compatibilidade
    idPatios?: number[];
    boxNomes?: string[];
}

export interface ZonaFilter {
    nome?: string;
    observacao?: string;
    boxNome?: string;
    veiculoPlaca?: string;
    patioNome?: string;
}