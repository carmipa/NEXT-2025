// Caminho do arquivo: br\com\fiap\mottu\filter\ZonaFilter.java
package br.com.fiap.mottu.filter;

public record ZonaFilter(
        String nome,
        String status,
        String observacao,
        String boxNome,
        Long patioId,
        String patioNome
) {}