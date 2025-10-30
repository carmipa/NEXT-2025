// Caminho do arquivo: br\com\fiap\mottu\filter\ZonaFilter.java
package br.com.fiap.mottu.filter;

import java.time.LocalDate;

public record ZonaFilter(
        String nome,
        LocalDate dataEntradaInicio,
        LocalDate dataEntradaFim,
        LocalDate dataSaidaInicio,
        LocalDate dataSaidaFim,
        String observacao,
        String boxNome, // Filtro por box associado (via junção)
        String veiculoPlaca, // Filtro por veículo associado (via junção)
        String patioNome // Filtro por patio associado (via junção)
) {}