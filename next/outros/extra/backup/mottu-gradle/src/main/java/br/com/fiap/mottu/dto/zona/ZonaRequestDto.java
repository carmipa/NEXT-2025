// Caminho do arquivo: br\com\fiap\mottu\dto\zona\ZonaRequestDto.java
package br.com.fiap.mottu.dto.zona;

import lombok.Value;
import java.io.Serializable;
import java.time.LocalDate;
import jakarta.validation.constraints.*;

/**
 * DTO for {@link br.com.fiap.mottu.model.Zona}
 */
@Value
public class ZonaRequestDto implements Serializable {
    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres.")
    String nome;

    @NotNull(message = "A data de entrada não pode ser nula.")
    LocalDate dataEntrada;

    @NotNull(message = "A data de saída não pode ser nula.")
    LocalDate dataSaida;

    @Size(max = 100, message = "A observação deve ter no máximo 100 caracteres.")
    String observacao;
}