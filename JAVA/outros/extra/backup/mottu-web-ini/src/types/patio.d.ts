// src/types/patio.d.ts

// Importe as interfaces de DTO de Resposta para as entidades associadas
// Certifique-se de que estes paths estão corretos no seu projeto
import { ContatoResponseDto } from './cliente'; // Ou de um arquivo 'contato.d.ts'
import { EnderecoResponseDto } from './cliente'; // Ou de um arquivo 'endereco.d.ts'
import { VeiculoResponseDto } from './veiculo';   // Você precisará criar src/types/veiculo.d.ts
import { ZonaResponseDto } from './zona';       // Você precisará criar src/types/zona.d.ts
import { BoxResponseDto } from './box';         // Já existe em src/types/box.d.ts


// DTO de Requisição (para criar ou atualizar um Patio)
export interface PatioRequestDto {
    nomePatio: string;
    dataEntrada: string; // Formato "YYYY-MM-DD"
    dataSaida: string;   // Formato "YYYY-MM-DD"
    observacao?: string; // Opcional
}

// DTO de Resposta (para receber dados de um Patio)
export interface PatioResponseDto {
    idPatio: number;
    nomePatio: string;
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
    // Para listagens diretas, as associações não vêm no DTO de Patio.
    // Se o backend retornasse, você poderia adicionar aqui:
    // contatos?: ContatoResponseDto[];
    // enderecos?: EnderecoResponseDto[];
    // veiculos?: VeiculoResponseDto[];
    // zonas?: ZonaResponseDto[];
    // boxes?: BoxResponseDto[];
}

// Interface para os filtros da busca de Patio
export interface PatioFilter {
    nomePatio?: string;
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
    // Campos para filtros de relacionamento (usados em PatioSpecification.java)
    veiculoPlaca?: string;
    enderecoCidade?: string;
    contatoEmail?: string;
    zonaNome?: string;
    boxNome?: string; // Novo filtro
}