// Caminho: src/main/java/br/com/fiap/mottu/dto/patio/PatioRequestDto.java
package br.com.fiap.mottu.dto.patio;

import br.com.fiap.mottu.dto.contato.ContatoRequestDto;
import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto;
import lombok.Value;
import java.io.Serializable;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;

/**
 * DTO for {@link br.com.fiap.mottu.model.Patio}
 */
@Value
public class PatioRequestDto implements Serializable {
    @NotBlank(message = "O nome do pátio não pode estar em branco.")
    @Size(max = 50, message = "O nome do pátio deve ter no máximo 50 caracteres.")
    String nomePatio;

    @Size(max = 100, message = "A observação deve ter no máximo 100 caracteres.")
    String observacao;

    @NotBlank(message = "O status não pode estar em branco.")
    @Size(max = 1, message = "O status deve ter no máximo 1 caractere.")
    String status;

    // Campos para associar contato e endereço existentes por ID (FK direta)
    Long contatoId;
    Long enderecoId;

    // Suporte a criação aninhada de contato e endereço no cadastro de pátio
    @Valid
    ContatoRequestDto contato;

    @Valid
    EnderecoRequestDto endereco;
}