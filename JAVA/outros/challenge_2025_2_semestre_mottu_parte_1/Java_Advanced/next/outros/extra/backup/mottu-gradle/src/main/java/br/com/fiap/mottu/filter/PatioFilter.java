// Caminho do arquivo: br\com\fiap\mottu\filter\PatioFilter.java
package br.com.fiap.mottu.filter;

import java.time.LocalDate;

public record PatioFilter(
        String nomePatio,
        LocalDate dataEntradaInicio,
        LocalDate dataEntradaFim,
        LocalDate dataSaidaInicio,
        LocalDate dataSaidaFim,
        String observacao,
        String veiculoPlaca, // Filtro por veículo associado (via junção)
        String enderecoCidade, // Filtro por endereço associado (via junção)
        String contatoEmail, // Filtro por contato associado (via junção)
        String zonaNome // Filtro por zona associada (via junção)
) {}