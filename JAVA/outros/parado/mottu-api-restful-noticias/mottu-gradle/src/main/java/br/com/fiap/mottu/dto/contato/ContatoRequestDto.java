// br/com/fiap/mottu/dto/contato/ContatoRequestDto.java
package br.com.fiap.mottu.dto.contato;

import lombok.Value;
import jakarta.validation.constraints.*;
import java.io.Serializable;

@Value
public class ContatoRequestDto implements Serializable {
    /** ID para identificar um contato existente em operações de atualização */
    Long idContato;

    @NotBlank(message = "O email não pode estar em branco.")
    @Email(message = "Formato de email inválido.")
    String email;

    @Min(value = 0, message = "DDD inválido.")
    Integer ddd;

    @Min(value = 0, message = "DDI inválido.")
    Integer ddi;

    @Size(max = 20, message = "O telefone 1 deve ter no máximo 20 caracteres.")
    String telefone1;

    @Size(max = 20, message = "O telefone 2 deve ter no máximo 20 caracteres.")
    String telefone2;

    @Size(max = 20, message = "O telefone 3 deve ter no máximo 20 caracteres.")
    String telefone3;

    @NotBlank(message = "O celular não pode estar em branco.")
    @Size(max = 20, message = "O celular deve ter no máximo 20 caracteres.")
    String celular;

    @Size(max = 100, message = "Outras informações de contato devem ter no máximo 100 caracteres.")
    String outro;

    @Size(max = 200, message = "A observação deve ter no máximo 200 caracteres.")
    String observacao;
}
