// Caminho do arquivo: br\com\fiap\mottu\filter\BoxFilter.java
package br.com.fiap.mottu.filter;

import java.time.LocalDate;

public record BoxFilter(
        String nome,
        String status,
        LocalDate dataEntradaInicio,
        LocalDate dataEntradaFim,
        LocalDate dataSaidaInicio,
        LocalDate dataSaidaFim,
        String observacao
) {}