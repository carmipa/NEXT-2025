package br.com.fiap.mottu.dto.estacionamento;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO para requisições de Estacionamento
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstacionamentoRequestDto implements Serializable {

    @NotNull(message = "O ID do veículo é obrigatório.")
    @Positive(message = "O ID do veículo deve ser um número positivo.")
    private Long veiculoId;

    @NotNull(message = "O ID do box é obrigatório.")
    @Positive(message = "O ID do box deve ser um número positivo.")
    private Long boxId;

    @NotNull(message = "O ID do pátio é obrigatório.")
    @Positive(message = "O ID do pátio deve ser um número positivo.")
    private Long patioId;

    @Builder.Default
    private Boolean estaEstacionado = true;

    private LocalDateTime dataEntrada;

    private LocalDateTime dataSaida;

    @Size(max = 500, message = "As observações devem ter no máximo 500 caracteres.")
    private String observacoes;
}





