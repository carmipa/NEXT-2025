// Caminho do arquivo: br\com\fiap\mottu\filter\VeiculoFilter.java
package br.com.fiap.mottu.filter;

public record VeiculoFilter(
        String placa,
        String renavam,
        String chassi,
        String fabricante,
        String modelo,
        String motor,
        Integer ano,
        String combustivel,
        String clienteCpf, // Filtro por cliente associado (via junção)
        String boxNome, // Filtro por box associado (via junção)
        String patioNome, // Filtro por patio associado (via junção)
        String zonaNome // Filtro por zona associada (via junção)
) {}