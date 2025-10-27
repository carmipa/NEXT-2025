// Caminho do arquivo: br\com\fiap\mottu\dto\box\BoxRequestDto.java
package br.com.fiap.mottu.dto.box;

import lombok.Value;
import java.io.Serializable;
import java.time.LocalDate;
import jakarta.validation.constraints.*;

/**
 * DTO for {@link br.com.fiap.mottu.model.Box}
 */
@Value
public class BoxRequestDto implements Serializable {
    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres.")
    String nome;

    @NotBlank(message = "O status não pode estar em branco.")
    @Size(max = 1, message = "O status deve ter 1 caracter.")
    @Pattern(regexp = "[LO]", message = "O status deve ser 'L' (Livre) ou 'O' (Ocupado).")
    String status;

    @NotNull(message = "A data de entrada não pode ser nula.")
    LocalDate dataEntrada;

    @NotNull(message = "A data de saída não pode ser nula.")
    LocalDate dataSaida;

    @Size(max = 100, message = "A observação deve ter no máximo 100 caracteres.")
    String observacao;
}