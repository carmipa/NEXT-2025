package br.com.fiap.mottu.dto.rastreamento;

import lombok.Value;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal; // Importe BigDecimal!

/**
 * DTO for {@link br.com.fiap.mottu.model.Rastreamento}
 */
@Value
public class RastreamentoRequestDto implements Serializable {

    @NotNull(message = "A coordenada IPS X não pode ser nula.")
    private BigDecimal ipsX;

    @NotNull(message = "A coordenada IPS Y não pode ser nula.")
    private BigDecimal ipsY;

    @NotNull(message = "A coordenada IPS Z não pode ser nula.")
    private BigDecimal ipsZ;

    @NotNull(message = "A Latitude GPRS não pode ser nula.")
    private BigDecimal gprsLatitude;

    @NotNull(message = "A Longitude GPRS não pode ser nula.")
    private BigDecimal gprsLongitude;

    @NotNull(message = "A Altitude GPRS não pode ser nula.")
    private BigDecimal gprsAltitude;
}