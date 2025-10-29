// Caminho do arquivo: br\com\fiap\mottu\dto\zona\ZonaRequestDto.java
package br.com.fiap.mottu.dto.zona;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;
import jakarta.validation.constraints.*;

/**
 * DTO for {@link br.com.fiap.mottu.model.Zona}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZonaRequestDto implements Serializable {
    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres.")
    private String nome;

    @NotBlank(message = "O status não pode estar em branco.")
    @Size(max = 1, message = "O status deve ter 1 caracter.")
    @Pattern(regexp = "[AI]", message = "O status deve ser 'A' (Ativa) ou 'I' (Inativa).")
    private String status;

    @Size(max = 100, message = "A observação deve ter no máximo 100 caracteres.")
    private String observacao;

    @NotNull(message = "O pátio da zona é obrigatório.")
    private Long patioId;

    @NotBlank(message = "O status do pátio é obrigatório.")
    private String patioStatus;
}