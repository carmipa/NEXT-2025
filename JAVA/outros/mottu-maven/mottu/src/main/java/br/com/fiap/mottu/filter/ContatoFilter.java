// Caminho do arquivo: br\com\fiap\mottu\filter\ContatoFilter.java
package br.com.fiap.mottu.filter;

public record ContatoFilter(
        String email,
        Integer ddd,
        Integer ddi,
        String telefone1,
        String celular,
        String observacao,
        String clienteNome // Filtro por cliente associado
) {}