// Caminho: src/types/patio.ts
import { ContatoResponseDto } from './contato'; // Supondo que você tenha este tipo
import { EnderecoResponseDto } from './endereco'; // Supondo que você tenha este tipo

export interface PatioRequestDto {
    nomePatio: string;
    observacao?: string;
    status: string; // 'A' (Ativo) ou outro conforme regra
    contatoId?: number;
    enderecoId?: number;
    contato?: import('./contato').ContatoRequestDto;
    endereco?: import('./endereco').EnderecoRequestDto;
}

export interface PatioResponseDto {
    idPatio: number;
    status: string;
    nomePatio: string;
    observacao: string | null;
    dataCadastro: string;
    contato?: ContatoResponseDto | null;
    endereco?: EnderecoResponseDto | null;
}

export interface PatioFilter {
    nomePatio?: string;
    // ... outros filtros se houver
}