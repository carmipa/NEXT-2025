// src/types/veiculo.d.ts

// Importe outras interfaces de DTO de Resposta necessárias
import { PatioResponseDto } from './patio'; // Ou de um arquivo 'patio.d.ts'
import { ZonaResponseDto } from './zona';   // Você precisará criar src/types/zona.d.ts
import { BoxResponseDto } from './box';     // Já existe em src/types/box.d.ts

// Interfaces para Rastreamento (importante para VeiculoLocalizacaoResponseDto)
export interface RastreamentoRequestDto {
    ipsX: number; // BigDecimal em Java, number em TS para simplificar
    ipsY: number;
    ipsZ: number;
    gprsLatitude: number;
    gprsLongitude: number;
    gprsAltitude: number;
}

export interface RastreamentoResponseDto {
    idRastreamento: number;
    ipsX: number;
    ipsY: number;
    ipsZ: number;
    gprsLatitude: number;
    gprsLongitude: number;
    gprsAltitude: number;
}


// DTO de Requisição para Veiculo
export interface VeiculoRequestDto {
    placa: string;
    renavam: string;
    chassi: string;
    fabricante: string;
    modelo: string;
    motor?: string; // Opcional
    ano: number; // Conforme o backend Java (Integer)
    combustivel: string;
}

// DTO de Resposta para Veiculo
export interface VeiculoResponseDto {
    idVeiculo: number;
    placa: string;
    renavam: string;
    chassi: string;
    fabricante: string;
    modelo: string;
    motor?: string;
    ano: number;
    combustivel: string;
    // Propriedades adicionais para compatibilidade com o frontend anterior:
    // proprietario?: string; // Não está no seu Veiculo.java ou DTOs. Se necessário, adicione no Java.
    // montadora?: string;    // No Java, 'fabricante' já cobre isso.
    // cor?: string;          // Não está no seu Veiculo.java ou DTOs. Se necessário, adicione no Java.
    // anoFabricacao?: string; // O campo 'ano' já cobre isso.
}

// DTO de Resposta para Localização de Veículo (Endpoint específico)
export interface VeiculoLocalizacaoResponseDto {
    idVeiculo: number;
    placa: string;
    modelo: string;
    fabricante: string;
    ultimoRastreamento?: RastreamentoResponseDto;
    patioAssociado?: PatioResponseDto;
    zonaAssociada?: ZonaResponseDto;
    boxAssociado?: BoxResponseDto;
    dataConsulta: string; // LocalDateTime em Java, string em TS
}

// Interface para os filtros de Veiculo
export interface VeiculoFilter {
    placa?: string;
    renavam?: string;
    chassi?: string;
    fabricante?: string;
    modelo?: string;
    motor?: string;
    ano?: number;
    combustivel?: string;
    // Campos para filtros de relacionamento (usados em VeiculoSpecification.java)
    clienteCpf?: string;
    boxNome?: string;
    patioNome?: string;
    zonaNome?: string;
}