package br.com.fiap.mottu.dto.estacionamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PlacaRequestDto {

    @NotBlank(message = "A placa não pode estar em branco.")
    @Size(min = 7, max = 7, message = "A placa deve ter exatamente 7 caracteres (padrão Mercosul).")
    @Pattern(regexp = "^[A-Z]{3}[0-9][A-Z][0-9]{2}$", message = "A placa deve seguir o padrão Mercosul (ABC1D23).")
    private String placa;

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }
}
