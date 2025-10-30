package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para horário de pico")
public class HorarioPicoDto {

    @Schema(description = "Horário de início", example = "08:00")
    private String horarioInicio;

    @Schema(description = "Horário de fim", example = "10:00")
    private String horarioFim;

    @Schema(description = "Percentual de ocupação no pico", example = "85.5")
    private Double percentualOcupacao;

    @Schema(description = "Tipo de pico", example = "MANHA")
    private TipoPico tipoPico;

    @Schema(description = "Duração do pico em minutos", example = "120")
    private Integer duracaoMinutos;

    public enum TipoPico {
        MANHA, TARDE, NOITE, MADRUGADA
    }
}

