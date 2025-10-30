// src/main/java/br/com/fiap/mottu/dto/patio/PatioCompletoRequestDto.java
package br.com.fiap.mottu.dto.patio;

import br.com.fiap.mottu.dto.contato.ContatoRequestDto;
import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto;

// ALTERAÇÃO: imports corrigidos de 'javax' para 'jakarta'
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PatioCompletoRequestDto(
        @NotNull @Valid PatioDto patio,
        @NotNull @Valid ContatoRequestDto contato,
        @NotNull @Valid EnderecoRequestDto endereco,
        List<@Valid ZonaDto> zonas,
        List<@Valid BoxDto> boxes
) {
    // DTOs aninhados que representam cada parte do wizard

    public record PatioDto(
            @NotEmpty(message = "O nome do pátio é obrigatório") String nomePatio,
            String observacao,
            @NotEmpty(message = "O status do pátio é obrigatório") String status
    ) {}

    public record ZonaDto(
            @NotEmpty(message = "O nome da zona é obrigatório") String nome,
            String observacao,
            @NotEmpty(message = "O status da zona é obrigatório") String status
    ) {}

    public record BoxDto(
            @NotEmpty(message = "O nome do box é obrigatório") String nome,
            @NotEmpty(message = "O status do box é obrigatório") String status,
            String observacao,
            @NotEmpty(message = "O nome da zona para o box é obrigatório") String zonaNome
    ) {}
}