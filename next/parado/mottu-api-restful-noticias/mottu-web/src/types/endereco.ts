// Caminho: src/types/endereco.ts

export interface EnderecoRequestDto {
    idEndereco?: number;
    cep: string;
    numero: number;
    complemento?: string;
    observacao?: string;
}

export interface EnderecoResponseDto {
    idEndereco: number;
    cep: string;
    numero: number;
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
    complemento: string | null;
    observacao: string | null;
}

export interface EnderecoFilter {
    cep?: string;
    cidade?: string;
    estado?: string;
    clienteNome?: string;
}