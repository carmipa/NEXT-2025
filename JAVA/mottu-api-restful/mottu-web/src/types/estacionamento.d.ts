// src/types/estacionamento.d.ts
/**
 * Tipos TypeScript para Estacionamento
 * Baseados na nova tabela TB_ESTACIONAMENTO
 */

import { SpringPage } from './common';
import { DataTableRequest, DataTableResponse } from './datatable';

// ================== REQUEST DTOs ==================

export interface EstacionamentoRequestDto {
    veiculoId: number;
    boxId: number;
    patioId: number;
    estaEstacionado?: boolean;
    dataEntrada?: string; // ISO 8601
    dataSaida?: string; // ISO 8601
    observacoes?: string;
}

export interface PlacaRequestDto {
    placa: string;
}

// ================== RESPONSE DTOs ==================

export interface EstacionamentoResponseDto {
    idEstacionamento: number;
    veiculo: {
        idVeiculo: number;
        placa: string;
        modelo: string;
        fabricante: string;
        tagBleId?: string;
        status?: string;
    };
    box: {
        idBox: number;
        nome: string;
        status: string;
        dataEntrada?: string;
        dataSaida?: string;
    };
    patio: {
        idPatio: number;
        nomePatio: string;
        status?: string;
    };
    estaEstacionado: boolean;
    dataEntrada: string;
    dataSaida?: string;
    dataUltimaAtualizacao: string;
    observacoes?: string;
    tempoEstacionadoMinutos?: number;
}

// ================== FILTER ==================

export interface EstacionamentoFilter {
    veiculoId?: number;
    placa?: string;
    modelo?: string;
    fabricante?: string;
    boxId?: number;
    boxNome?: string;
    boxStatus?: string;
    patioId?: number;
    patioNome?: string;
    estaEstacionado?: boolean;
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacoes?: string;
    tempoMinimoMinutos?: number;
    tempoMaximoMinutos?: number;
}

// ================== HELPER TYPES ==================

export type EstacionamentoPage = SpringPage<EstacionamentoResponseDto>;
export type EstacionamentoDataTableResponse = DataTableResponse<EstacionamentoResponseDto>;








