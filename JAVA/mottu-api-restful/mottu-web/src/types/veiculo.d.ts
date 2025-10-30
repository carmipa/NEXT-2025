// src/types/veiculo.d.ts
import { BoxResponseDto } from './box';
import { PatioResponseDto } from './patio';
import { ZonaResponseDto } from './zona';

// --- DTOs para Rastreamento ---
export interface RastreamentoResponseDto {
    idRastreamento: number;
    ipsX: number;
    ipsY: number;
    ipsZ: number;
    gprsLatitude: number;
    gprsLongitude: number;
    gprsAltitude: number;
    dataHoraRegistro: string; // LocalDateTime
}

// --- DTOs para Veiculo ---
export interface VeiculoRequestDto {
    placa: string;
    renavam: string;
    chassi: string;
    fabricante: string;
    modelo: string;
    motor?: string;
    ano: number;
    combustivel: string;
    // NOVOS CAMPOS ADICIONADOS
    status?: 'OPERACIONAL' | 'EM_MANUTENCAO' | 'INATIVO';
    tagBleId?: string;
}

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
    // NOVOS CAMPOS ADICIONADOS
    status?: 'OPERACIONAL' | 'EM_MANUTENCAO' | 'INATIVO';
    tagBleId?: string;
}

// --- DTO de Localização ---
export interface VeiculoLocalizacaoResponseDto {
    idVeiculo: number;
    placa: string;
    modelo: string;
    fabricante: string;
    // NOVOS CAMPOS ADICIONADOS
    status?: 'OPERACIONAL' | 'EM_MANUTENCAO' | 'INATIVO';
    tagBleId?: string;
    ultimoRastreamento?: RastreamentoResponseDto;
    patioAssociado?: PatioResponseDto;
    zonaAssociada?: ZonaResponseDto;
    boxAssociado?: BoxResponseDto;
    dataConsulta: string; // LocalDateTime
}

// --- Filtro para Busca de Veículo ---
export interface VeiculoFilter {
    placa?: string;
    renavam?: string;
    chassi?: string;
    fabricante?: string;
    modelo?: string;
    motor?: string;
    ano?: number;
    combustivel?: string;
    clienteCpf?: string;
    boxNome?: string;
    patioNome?: string;
    zonaNome?: string;
    // NOVOS CAMPOS ADICIONADOS
    status?: 'OPERACIONAL' | 'EM_MANUTENCAO' | 'INATIVO' | '';
    tagBleId?: string;
}

