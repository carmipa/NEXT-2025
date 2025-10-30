package br.com.fiap.mottu.dto.cnh;

import lombok.Value;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO para requisições de CNH (Carteira Nacional de Habilitação)
 */
@Value
public class CnhRequestDto implements Serializable {
    
    @NotNull(message = "A data de emissão não pode ser nula.")
    @PastOrPresent(message = "A data de emissão deve ser no passado ou presente.")
    LocalDate dataEmissao;

    @NotNull(message = "A data de validade não pode ser nula.")
    @Future(message = "A data de validade deve ser no futuro.")
    LocalDate dataValidade;

    @NotBlank(message = "O número de registro não pode estar em branco.")
    @Size(min = 11, max = 11, message = "O número de registro deve ter exatamente 11 dígitos.")
    @Pattern(regexp = "^\\d{11}$", message = "O número de registro deve conter apenas dígitos.")
    String numeroRegistro;

    @NotBlank(message = "A categoria não pode estar em branco.")
    @Size(min = 1, max = 5, message = "A categoria deve ter entre 1 e 5 caracteres.")
    @Pattern(regexp = "^(A|B|C|D|E|AB|AC|AD|AE)$", 
             message = "A categoria deve ser uma das seguintes: A, B, C, D, E, AB, AC, AD, AE.")
    String categoria;

    // clienteId será definido automaticamente pelo backend na criação
    Long clienteId;
}
