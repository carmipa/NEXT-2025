// Caminho do arquivo: br\com\fiap\mottu\filter\PatioFilter.java
package br.com.fiap.mottu.filter;

import java.time.LocalDate;

public record PatioFilter(
        String nomePatio,
        LocalDate dataCadastroInicio,
        LocalDate dataCadastroFim,
        String observacao,
        String veiculoPlaca, // Filtro por veículo associado (via junção)
        String enderecoCidade, // Filtro por endereço associado (via junção)
        String contatoEmail, // Filtro por contato associado (via junção)
        String zonaNome, // Filtro por zona associada (via FK direta)
        String boxNome // Filtro por box associado (via zona)
) {}