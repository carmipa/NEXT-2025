package br.com.fiap.mottu.dto.estacionamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PlacaRequestDto {

    @NotBlank(message = "A placa não pode estar em branco.")
    @Size(max = 10, message = "A placa deve ter no máximo 10 caracteres.")
    private String placa;

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }
}
