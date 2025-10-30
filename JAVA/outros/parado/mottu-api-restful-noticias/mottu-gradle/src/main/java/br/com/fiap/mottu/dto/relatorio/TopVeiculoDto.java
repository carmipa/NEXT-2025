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
@Schema(description = "DTO para veículo mais frequente")
public class TopVeiculoDto {

    @Schema(description = "ID do veículo", example = "1")
    private Long veiculoId;

    @Schema(description = "Placa do veículo", example = "ABC1D20")
    private String placa;

    @Schema(description = "Modelo do veículo", example = "CG 160 Start")
    private String modelo;

    @Schema(description = "Fabricante do veículo", example = "Honda")
    private String fabricante;

    @Schema(description = "Total de utilizações", example = "45")
    private Long totalUtilizacoes;

    @Schema(description = "Pátio mais utilizado", example = "Patio Mottu Guarulhos")
    private String patioMaisUtilizado;

    @Schema(description = "Box mais utilizado", example = "GRU001")
    private String boxMaisUtilizado;

    @Schema(description = "Tempo médio de estacionamento em minutos", example = "165.5")
    private Double tempoMedioEstacionamento;

    @Schema(description = "Última movimentação")
    private String ultimaMovimentacao;
}

