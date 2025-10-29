// Caminho do arquivo: br\com\fiap\mottu\filter\ClienteFilter.java
package br.com.fiap.mottu.filter;

import java.time.LocalDate;

public record ClienteFilter(
        String nome,
        String sobrenome,
        String cpf,
        String sexo,
        String profissao,
        String estadoCivil,
        LocalDate dataCadastroInicio,
        LocalDate dataCadastroFim,
        LocalDate dataNascimentoInicio,
        LocalDate dataNascimentoFim,
        String enderecoCidade,
        String enderecoEstado,
        String contatoEmail,
        String contatoCelular,
        String veiculoPlaca,
        String veiculoModelo
) {}