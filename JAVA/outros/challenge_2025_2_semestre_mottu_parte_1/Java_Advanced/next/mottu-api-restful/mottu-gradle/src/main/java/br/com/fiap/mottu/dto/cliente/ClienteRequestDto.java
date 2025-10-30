// Caminho do arquivo: br\com\fiap\mottu\dto\cliente\ClienteRequestDto.java
package br.com.fiap.mottu.dto.cliente;

import br.com.fiap.mottu.dto.contato.ContatoRequestDto;
import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto;
import br.com.fiap.mottu.dto.cnh.CnhRequestDto;
import lombok.Value;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link br.com.fiap.mottu.model.Cliente}
 */
@Value
public class ClienteRequestDto implements Serializable {
    @NotBlank(message = "O sexo não pode estar em branco.")
    @Size(min = 1, max = 2, message = "O sexo deve ter 1 ou 2 caracteres.")
    @Pattern(regexp = "^[MH]$", message = "O sexo deve ser 'M' (Masculino) ou 'H' (Feminino).")
    String sexo;

    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
    String nome;

    @NotBlank(message = "O sobrenome não pode estar em branco.")
    @Size(max = 100, message = "O sobrenome deve ter no máximo 100 caracteres.")
    String sobrenome;

    @NotNull(message = "A data de nascimento não pode ser nula.")
    @Past(message = "A data de nascimento deve ser no passado.")
    LocalDate dataNascimento;

    @NotBlank(message = "O CPF não pode estar em branco.")
    @Size(min = 11, max = 11, message = "O CPF deve ter 11 caracteres.")
    @Pattern(regexp = "^\\d{11}$", message = "O CPF deve conter apenas dígitos.")
    String cpf;

    @NotBlank(message = "A profissão não pode estar em branco.")
    @Size(max = 50, message = "A profissão deve ter no máximo 50 caracteres.")
    String profissao;

    @NotBlank(message = "O estado civil não pode estar em branco.")
    @Size(max = 50, message = "O estado civil deve ter no máximo 50 caracteres.")
    @Pattern(regexp = "^(Solteiro|Casado|Divorciado|Viúvo|Separado|União Estável)$", message = "Estado civil inválido.")
    String estadoCivil;

    @NotNull(message = "O endereço não pode ser nulo.")
    @Valid
    EnderecoRequestDto enderecoRequestDto;

    @NotNull(message = "O contato não pode ser nulo.")
    @Valid
    ContatoRequestDto contatoRequestDto;

    @NotNull(message = "A CNH não pode ser nula.")
    @Valid
    CnhRequestDto cnhRequestDto;
}