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
@Schema(description = "DTO para movimentação diária")
public class MovimentacaoDiariaDto {

    @Schema(description = "Data da movimentação", example = "2024-01-15")
    private LocalDate data;

    @Schema(description = "Quantidade de entradas", example = "25")
    private Integer entradas;

    @Schema(description = "Quantidade de saídas", example = "23")
    private Integer saidas;

    @Schema(description = "Total de movimentações", example = "48")
    private Integer totalMovimentacoes;

    @Schema(description = "Tempo médio de estacionamento em minutos", example = "120.5")
    private Double tempoMedioEstacionamento;

    @Schema(description = "Pátio com mais movimentações", example = "Patio Mottu Guarulhos")
    private String patioMaisMovimentado;

    @Schema(description = "Box mais utilizado", example = "GRU001")
    private String boxMaisUtilizado;

    @Schema(description = "Lista de movimentações detalhadas")
    private List<MovimentacaoDetalhadaDto> movimentacoesDetalhadas;
}

