// Caminho do arquivo: br\com\fiap\mottu\dto\endereco\EnderecoRequestDto.java
package br.com.fiap.mottu.dto.endereco;

import lombok.Value;

import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * DTO for {@link br.com.fiap.mottu.model.Endereco}
 */
@Value
public class EnderecoRequestDto implements Serializable {
    // Apenas CEP, numero, complemento e observacao virão na requisição
    // Outros campos serão preenchidos pela ViaCEP
    @NotBlank(message = "O CEP não pode estar em branco.")
    @Size(min = 8, max = 9, message = "O CEP deve ter 8 ou 9 caracteres (formato 'XXXXXXXX' ou 'XXXXX-XXX').")
    @Pattern(regexp = "^\\d{8}$|^\\d{5}-\\d{3}$", message = "Formato de CEP inválido (esperado XXXXXXXX ou XXXXX-XXX).")
    String cep;

    @NotNull(message = "O número do endereço não pode ser nulo.")
    @Positive(message = "O número do endereço deve ser positivo.")
    @Max(value = 9999999, message = "O número do endereço deve ter no máximo 7 dígitos.")
    Integer numero;

    @Size(max = 60, message = "O complemento deve ter no máximo 60 caracteres.")
    String complemento;

    @Size(max = 300, message = "A observação deve ter no máximo 300 caracteres.")
    String observacao;

    // ID para identificar um endereço existente em operações de atualização
    Long idEndereco; // Adicionado para permitir a atualização de endereços existentes via ClienteRequestDto
}