package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "DTO para performance do OCR por horário")
public class PerformanceOcrDto {

    @Schema(description = "Horário da análise", example = "08:00")
    private String horario;

    @Schema(description = "Total de processamentos neste horário", example = "45")
    private Long totalProcessamentos;

    @Schema(description = "Taxa de acerto neste horário (%)", example = "92.5")
    private BigDecimal taxaAcerto;

    @Schema(description = "Tempo médio de processamento (ms)", example = "180")
    private BigDecimal tempoMedioProcessamento;

    @Schema(description = "Confiança média neste horário", example = "0.89")
    private BigDecimal confiancaMedia;

    @Schema(description = "Número de erros neste horário", example = "3")
    private Long numeroErros;

    // Construtor padrão
    public PerformanceOcrDto() {}

    // Construtor completo
    public PerformanceOcrDto(String horario, Long totalProcessamentos, BigDecimal taxaAcerto,
                            BigDecimal tempoMedioProcessamento, BigDecimal confiancaMedia, Long numeroErros) {
        this.horario = horario;
        this.totalProcessamentos = totalProcessamentos;
        this.taxaAcerto = taxaAcerto;
        this.tempoMedioProcessamento = tempoMedioProcessamento;
        this.confiancaMedia = confiancaMedia;
        this.numeroErros = numeroErros;
    }

    // Getters e Setters
    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public Long getTotalProcessamentos() {
        return totalProcessamentos;
    }

    public void setTotalProcessamentos(Long totalProcessamentos) {
        this.totalProcessamentos = totalProcessamentos;
    }

    public BigDecimal getTaxaAcerto() {
        return taxaAcerto;
    }

    public void setTaxaAcerto(BigDecimal taxaAcerto) {
        this.taxaAcerto = taxaAcerto;
    }

    public BigDecimal getTempoMedioProcessamento() {
        return tempoMedioProcessamento;
    }

    public void setTempoMedioProcessamento(BigDecimal tempoMedioProcessamento) {
        this.tempoMedioProcessamento = tempoMedioProcessamento;
    }

    public BigDecimal getConfiancaMedia() {
        return confiancaMedia;
    }

    public void setConfiancaMedia(BigDecimal confiancaMedia) {
        this.confiancaMedia = confiancaMedia;
    }

    public Long getNumeroErros() {
        return numeroErros;
    }

    public void setNumeroErros(Long numeroErros) {
        this.numeroErros = numeroErros;
    }

    @Override
    public String toString() {
        return "PerformanceOcrDto{" +
                "horario='" + horario + '\'' +
                ", totalProcessamentos=" + totalProcessamentos +
                ", taxaAcerto=" + taxaAcerto +
                ", tempoMedioProcessamento=" + tempoMedioProcessamento +
                ", confiancaMedia=" + confiancaMedia +
                ", numeroErros=" + numeroErros +
                '}';
    }
}






