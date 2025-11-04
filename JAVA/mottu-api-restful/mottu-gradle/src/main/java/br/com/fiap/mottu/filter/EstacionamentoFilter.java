package br.com.fiap.mottu.filter;

import java.time.LocalDateTime;

/**
 * Filtros para busca de Estacionamentos
 * Usado em conjunto com EstacionamentoSpecification para queries dinâmicas
 */
public record EstacionamentoFilter(
        // Filtros por veículo
        Long veiculoId,
        String placa,
        String modelo,
        String fabricante,

        // Filtros por box
        Long boxId,
        String boxNome,
        String boxStatus,

        // Filtros por pátio
        Long patioId,
        String patioNome,

        // Filtros por status
        Boolean estaEstacionado,

        // Filtros por data
        LocalDateTime dataEntradaInicio,
        LocalDateTime dataEntradaFim,
        LocalDateTime dataSaidaInicio,
        LocalDateTime dataSaidaFim,

        // Filtros por observações
        String observacoes,

        // Filtros por tempo
        Long tempoMinimoMinutos,
        Long tempoMaximoMinutos
) {
    /**
     * Métodos auxiliares para limpar strings
     */
    public String getCleanPlaca() {
        return placa != null ? placa.trim().toUpperCase() : null;
    }

    public String getCleanBoxNome() {
        return boxNome != null ? boxNome.trim() : null;
    }

    public String getCleanPatioNome() {
        return patioNome != null ? patioNome.trim() : null;
    }

    public String getCleanObservacoes() {
        return observacoes != null ? observacoes.trim() : null;
    }
}




