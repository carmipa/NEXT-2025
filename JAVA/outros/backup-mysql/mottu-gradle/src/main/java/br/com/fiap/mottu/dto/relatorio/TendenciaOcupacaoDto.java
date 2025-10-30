package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para tendências de ocupação")
public class TendenciaOcupacaoDto {

    @Schema(description = "Período analisado", example = "Últimos 30 dias")
    private String periodoAnalisado;

    @Schema(description = "Tendência geral", example = "CRESCENTE")
    private TendenciaGeral tendenciaGeral;

    @Schema(description = "Variação percentual", example = "5.2")
    private Double variacaoPercentual;

    @Schema(description = "Ocupação média", example = "72.5")
    private Double ocupacaoMedia;

    @Schema(description = "Ocupação máxima", example = "95.0")
    private Double ocupacaoMaxima;

    @Schema(description = "Ocupação mínima", example = "45.0")
    private Double ocupacaoMinima;

    @Schema(description = "Dias de alta ocupação (>80%)", example = "8")
    private Integer diasAltaOcupacao;

    @Schema(description = "Dias de baixa ocupação (<50%)", example = "3")
    private Integer diasBaixaOcupacao;

    @Schema(description = "Horários de pico")
    private List<HorarioPicoDto> horariosPico;

    @Schema(description = "Pátios com melhor performance")
    private List<PatioPerformanceDto> pátiosPerformance;

    @Schema(description = "Data da análise")
    private LocalDate dataAnalise;

    public enum TendenciaGeral {
        CRESCENTE, DECRESCENTE, ESTAVEL, FLUTUANTE
    }
}

