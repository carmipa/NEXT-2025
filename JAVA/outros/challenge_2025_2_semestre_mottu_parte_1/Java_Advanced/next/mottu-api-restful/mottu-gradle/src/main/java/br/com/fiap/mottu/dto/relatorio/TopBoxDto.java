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
@Schema(description = "DTO para box mais utilizado")
public class TopBoxDto {

    @Schema(description = "ID do box", example = "1")
    private Long boxId;

    @Schema(description = "Nome do box", example = "GRU001")
    private String nomeBox;

    @Schema(description = "Nome do pátio", example = "Patio Mottu Guarulhos")
    private String nomePatio;

    @Schema(description = "Total de utilizações", example = "125")
    private Long totalUtilizacoes;

    @Schema(description = "Taxa de utilização em percentual", example = "85.5")
    private Double taxaUtilizacao;

    @Schema(description = "Status atual do box", example = "O")
    private String statusAtual;

    @Schema(description = "Tempo médio de ocupação em minutos", example = "180.5")
    private Double tempoMedioOcupacao;
}

