// src/types/cliente.d.ts

// --- DTOs para Endereço ---
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
    complemento?: string;
    observacao?: string;
}

// --- DTOs para Contato ---
export interface ContatoRequestDto {
    idContato?: number;
    email: string;
    ddd: number;
    ddi: number;
    telefone1: string;
    telefone2?: string; // Campo opcional
    telefone3?: string; // Campo opcional
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
    telefone2?: string;
    telefone3?: string;
    celular: string;
    outro?: string;
    observacao?: string;
}

// --- DTOs para Cliente ---
export interface ClienteRequestDto {
    sexo: 'M' | 'H';
    nome: string;
    sobrenome: string;
    dataNascimento: string; // "YYYY-MM-DD"
    cpf: string;
    profissao: string;
    estadoCivil: 'Solteiro' | 'Casado' | 'Divorciado' | 'Viúvo' | 'Separado' | 'União Estável';
    enderecoRequestDto: EnderecoRequestDto;
    contatoRequestDto: ContatoRequestDto;
}

export interface ClienteResponseDto {
    idCliente: number;
    dataCadastro: string; // "YYYY-MM-DD"
    sexo: 'M' | 'H';
    nome: string;
    sobrenome: string;
    dataNascimento: string;
    cpf: string;
    profissao: string;
    estadoCivil: string;
    enderecoResponseDto: EnderecoResponseDto;
    contatoResponseDto: ContatoResponseDto;
}

// --- Filtro para Busca de Cliente ---
export interface ClienteFilter {
    nome?: string;
    sobrenome?: string;
    cpf?: string;
    sexo?: 'M' | 'H';
    profissao?: string;
    estadoCivil?: string;
    dataCadastroInicio?: string;
    dataCadastroFim?: string;
    dataNascimentoInicio?: string;
    dataNascimentoFim?: string;
    enderecoCidade?: string;
    enderecoEstado?: string;
    contatoEmail?: string;
    contatoCelular?: string;
    veiculoPlaca?: string;
    veiculoModelo?: string;
}