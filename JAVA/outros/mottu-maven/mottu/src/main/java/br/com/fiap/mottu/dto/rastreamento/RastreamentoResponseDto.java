package br.com.fiap.mottu.dto.rastreamento;

import lombok.Value; // Lombok: Para criar DTOs imutáveis e concisos
import java.io.Serializable; // Interface para marcar a classe como serializável
import java.math.BigDecimal; // Para representar números decimais com precisão
import java.time.LocalDateTime; // Para representar data e hora

/**
 * DTO for {@link br.com.fiap.mottu.model.Rastreamento}
 * Usado para transferir dados de Rastreamento da aplicação para o cliente (resposta).
 */
@Value // Lombok: Gera construtor com todos os campos, getters, equals, hashCode e toString.
public class RastreamentoResponseDto implements Serializable {
    private static final long serialVersionUID = 1L; // Identificador para serialização

    Long idRastreamento; // ID do rastreamento

    // Coordenadas IPS (Indoor Positioning System)
    private BigDecimal ipsX;
    private BigDecimal ipsY;
    private BigDecimal ipsZ;

    // Coordenadas GPRS
    private BigDecimal gprsLatitude;
    private BigDecimal gprsLongitude;
    private BigDecimal gprsAltitude;

    LocalDateTime dataHoraRegistro; // NOVO CAMPO: Data e hora em que o rastreamento foi registrado
}