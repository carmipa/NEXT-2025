package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para performance de um pátio")
public class PerformancePatioDto {

    @Schema(description = "ID do pátio", example = "1")
    private Long patioId;

    @Schema(description = "Nome do pátio", example = "Patio Mottu Guarulhos")
    private String nomePatio;

    @Schema(description = "Taxa de ocupação média", example = "75.5")
    private Double taxaOcupacaoMedia;

    @Schema(description = "Tempo médio de estacionamento em minutos", example = "145.2")
    private Double tempoMedioEstacionamento;

    @Schema(description = "Total de movimentações", example = "1250")
    private Long totalMovimentacoes;

    @Schema(description = "Total de entradas", example = "625")
    private Long totalEntradas;

    @Schema(description = "Total de saídas", example = "625")
    private Long totalSaidas;

    @Schema(description = "Número total de boxes", example = "50")
    private Integer totalBoxes;

    @Schema(description = "Boxes mais utilizados")
    private List<TopBoxDto> topBoxes;

    @Schema(description = "Veículos mais frequentes")
    private List<TopVeiculoDto> topVeiculos;

    @Schema(description = "Status do pátio", example = "A")
    private String status;

    @Schema(description = "Cidade", example = "Guarulhos")
    private String cidade;

    @Schema(description = "Estado", example = "SP")
    private String estado;
}

