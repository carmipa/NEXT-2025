// Caminho do arquivo: br\com\fiap\mottu\dto\box\BoxRequestDto.java
package br.com.fiap.mottu.dto.box;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

/**
 * DTO for {@link br.com.fiap.mottu.model.Box}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoxRequestDto implements Serializable {
    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres.")
    private String nome;

    @NotBlank(message = "O status é obrigatório.")
    @Pattern(regexp = "[LO]", message = "O status deve ser 'L' (Livre) ou 'O' (Ocupado).")
    private String status;

    private LocalDateTime dataEntrada;

    private LocalDateTime dataSaida;

    @Size(max = 100, message = "A observação deve ter no máximo 100 caracteres.")
    private String observacao;

    @NotNull(message = "O pátio do box é obrigatório.")
    private Long patioId;

    @NotBlank(message = "O status do pátio é obrigatório.")
    private String patioStatus;
}