package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para ocupação atual de um pátio")
public class OcupacaoAtualDto {

    @Schema(description = "ID do pátio", example = "1")
    private Long patioId;

    @Schema(description = "Nome do pátio", example = "Patio Mottu Guarulhos")
    private String nomePatio;

    @Schema(description = "Total de boxes no pátio", example = "50")
    private Integer totalBoxes;

    @Schema(description = "Quantidade de boxes ocupados", example = "35")
    private Integer boxesOcupados;

    @Schema(description = "Quantidade de boxes livres", example = "15")
    private Integer boxesLivres;

    @Schema(description = "Taxa de ocupação em percentual", example = "70.0")
    private Double taxaOcupacao;

    @Schema(description = "Data e hora da última atualização")
    private LocalDateTime ultimaAtualizacao;

    @Schema(description = "Status do pátio", example = "A")
    private String statusPatio;

    @Schema(description = "Cidade do pátio", example = "Guarulhos")
    private String cidade;

    @Schema(description = "Estado do pátio", example = "SP")
    private String estado;
}

