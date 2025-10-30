// Caminho do arquivo: br\com\fiap\mottu\filter\EnderecoFilter.java
package br.com.fiap.mottu.filter;

public record EnderecoFilter(
        String cep,
        Integer numero,
        String logradouro,
        String bairro,
        String cidade,
        String estado,
        String pais,
        String observacao,
        String clienteNome // Filtro por cliente associado
) {}