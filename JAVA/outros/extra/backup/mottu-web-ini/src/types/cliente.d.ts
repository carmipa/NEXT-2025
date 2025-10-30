// src/types/cliente.d.ts

// Interfaces para Endereco (já existentes no seu projeto, mas confirmando a estrutura)
export interface EnderecoRequestDto {
    idEndereco?: number; // Opcional para criação, presente para atualização
    cep: string;
    numero: number;
    complemento?: string;
    observacao?: string;
    // Campos abaixo serão preenchidos pelo backend via ViaCEP, não são enviados no request inicial do frontend
    // logradouro?: string;
    // bairro?: string;
    // cidade?: string;
    // estado?: string;
    // pais?: string;
}

export interface EnderecoResponseDto {
    idEndereco: number;
    cep: string;
    numero: number;
    logradouro: string;
    bairro: string;
    cidade: string; // localidade no ViaCEP
    estado: string; // uf no ViaCEP
    pais: string;
    complemento?: string;
    observacao?: string;
}

// Interfaces para Contato (já existentes no seu projeto, mas confirmando a estrutura)
export interface ContatoRequestDto {
    idContato?: number; // Opcional para criação, presente para atualização
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
    telefone2?: string;
    telefone3?: string;
    celular: string;
    outro?: string;
    observacao?: string;
}

// DTO de Requisição para Cliente
export interface ClienteRequestDto {
    sexo: 'M' | 'H'; // Conforme seu Java (M=Masculino, H=Feminino)
    nome: string;
    sobrenome: string;
    dataNascimento: string; // Formato "YYYY-MM-DD"
    cpf: string;
    profissao: string;
    estadoCivil: 'Solteiro' | 'Casado' | 'Divorciado' | 'Viúvo' | 'Separado' | 'União Estável'; // Conforme seu Java

    enderecoRequestDto: EnderecoRequestDto; // Objeto aninhado
    contatoRequestDto: ContatoRequestDto;   // Objeto aninhado
}

// DTO de Resposta para Cliente
export interface ClienteResponseDto {
    idCliente: number;
    dataCadastro: string; // Formato "YYYY-MM-DD"
    sexo: 'M' | 'H';
    nome: string;
    sobrenome: string;
    dataNascimento: string;
    cpf: string;
    profissao: string;
    estadoCivil: string;

    enderecoResponseDto: EnderecoResponseDto; // Objeto aninhado
    contatoResponseDto: ContatoResponseDto;   // Objeto aninhado

    // Se você precisar exibir veículos associados ao cliente, pode adicionar aqui:
    // veiculos?: VeiculoResponseDto[]; // Requer importação de VeiculoResponseDto e mapeamento no ClienteMapper no backend
}

// Interface para os filtros de Cliente
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
    // Campos para filtros de relacionamento (usados em ClienteSpecification.java)
    enderecoCidade?: string;
    enderecoEstado?: string;
    contatoEmail?: string;
    contatoCelular?: string;
    veiculoPlaca?: string;
    veiculoModelo?: string;
}