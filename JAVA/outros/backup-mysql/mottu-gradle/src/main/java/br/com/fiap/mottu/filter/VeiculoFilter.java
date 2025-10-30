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
        String clienteCpf,
        String boxNome,
        String patioNome,
        String zonaNome,
        String tagBleId // NOVO CAMPO
) {}