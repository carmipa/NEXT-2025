// Caminho do arquivo: br\com\fiap\mottu\dto\veiculo\VeiculoRequestDto.java
package br.com.fiap.mottu.dto.veiculo;

import lombok.Value;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * DTO for {@link br.com.fiap.mottu.model.Veiculo}
 */
@Value
public class VeiculoRequestDto implements Serializable {
    @NotBlank(message = "A placa não pode estar em branco.")
    @Size(max = 10, message = "A placa deve ter no máximo 10 caracteres.")
    String placa;

    @NotBlank(message = "O RENAVAM não pode estar em branco.")
    @Size(min = 11, max = 11, message = "O RENAVAM deve ter 11 caracteres.")
    @Pattern(regexp = "^\\d{11}$", message = "O RENAVAM deve conter apenas dígitos.")
    String renavam;

    @NotBlank(message = "O chassi não pode estar em branco.")
    @Size(min = 17, max = 17, message = "O chassi deve ter 17 caracteres.")
    String chassi;

    @NotBlank(message = "O fabricante não pode estar em branco.")
    @Size(max = 50, message = "O fabricante deve ter no máximo 50 caracteres.")
    String fabricante;

    @NotBlank(message = "O modelo não pode estar em branco.")
    @Size(max = 60, message = "O modelo deve ter no máximo 60 caracteres.")
    String modelo;

    @Size(max = 30, message = "O motor deve ter no máximo 30 caracteres.")
    String motor;

    @NotNull(message = "O ano não pode ser nulo.")
    @Min(value = 1900, message = "O ano deve ser a partir de 1900.")
    @Max(value = 2100, message = "O ano deve ser no máximo 2100.")
    Integer ano;

    @NotBlank(message = "O combustível não pode estar em branco.")
    @Size(max = 20, message = "O combustível deve ter no máximo 20 caracteres.")
    String combustivel;
}