package br.com.fiap.mottu.filter;

import java.math.BigDecimal; // Importe BigDecimal!

public record RastreamentoFilter(
        BigDecimal ipsX,
        BigDecimal ipsY,
        BigDecimal ipsZ,

        BigDecimal gprsLatitude,
        BigDecimal gprsLongitude,
        BigDecimal gprsAltitude,

        String veiculoPlaca // Filtro por veículo associado
) {}