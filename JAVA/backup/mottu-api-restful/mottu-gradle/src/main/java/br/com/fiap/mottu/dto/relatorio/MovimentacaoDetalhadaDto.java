package br.com.fiap.mottu.dto.relatorio;

import br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao;
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
@Schema(description = "DTO para movimentação detalhada")
public class MovimentacaoDetalhadaDto {

    @Schema(description = "ID da movimentação", example = "1")
    private Long idMovimentacao;

    @Schema(description = "Placa do veículo", example = "ABC1D20")
    private String placaVeiculo;

    @Schema(description = "Nome do box", example = "GRU001")
    private String nomeBox;

    @Schema(description = "Nome do pátio", example = "Patio Mottu Guarulhos")
    private String nomePatio;

    @Schema(description = "Tipo de movimentação", example = "ENTRADA")
    private TipoMovimentacao tipoMovimentacao;

    @Schema(description = "Data e hora da movimentação")
    private LocalDateTime dataHoraMovimentacao;

    @Schema(description = "Tempo de estacionamento em minutos", example = "120")
    private Long tempoEstacionamentoMinutos;

    @Schema(description = "Observações", example = "Movimentação normal")
    private String observacoes;

    @Schema(description = "Modelo do veículo", example = "CG 160 Start")
    private String modeloVeiculo;

    @Schema(description = "Fabricante do veículo", example = "Honda")
    private String fabricanteVeiculo;
}

