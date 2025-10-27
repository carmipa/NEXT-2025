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
@Schema(description = "DTO para performance de pátio em tendências")
public class PatioPerformanceDto {

    @Schema(description = "ID do pátio", example = "1")
    private Long patioId;

    @Schema(description = "Nome do pátio", example = "Patio Mottu Guarulhos")
    private String nomePatio;

    @Schema(description = "Taxa de ocupação média", example = "78.5")
    private Double ocupacaoMedia;

    @Schema(description = "Ranking de performance", example = "1")
    private Integer ranking;

    @Schema(description = "Tendência do pátio", example = "CRESCENTE")
    private TendenciaOcupacaoDto.TendenciaGeral tendencia;

    @Schema(description = "Variação percentual", example = "3.2")
    private Double variacaoPercentual;

    @Schema(description = "Cidade", example = "Guarulhos")
    private String cidade;
}

