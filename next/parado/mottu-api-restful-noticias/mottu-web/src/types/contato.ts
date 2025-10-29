// Caminho: src/types/contato.ts

export interface ContatoRequestDto {
    idContato?: number;
    email: string;
    ddd: number;
    ddi: number;
    telefone1: string;
    telefone2?: string;
    telefone3?: string;
    celular: string;
    outro?: string;
    observacao?: string;
}

export interface ContatoResponseDto {
    idContato: number;
    email: string;
    ddd: number;
    ddi: number;
    telefone1: string;
    telefone2: string | null;
    telefone3: string | null;
    celular: string;
    outro: string | null;
    observacao: string | null;
}

export interface ContatoFilter {
    email?: string;
    ddd?: number;
    celular?: string;
    clienteNome?: string;
}