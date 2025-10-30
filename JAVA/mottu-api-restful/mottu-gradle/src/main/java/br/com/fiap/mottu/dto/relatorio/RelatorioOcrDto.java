package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Relatório de reconhecimento de placas via OCR")
public class RelatorioOcrDto {

    @Schema(description = "Data do relatório", example = "2025-01-15")
    private LocalDate data;

    @Schema(description = "Total de placas detectadas", example = "150")
    private Long totalPlacasDetectadas;

    @Schema(description = "Placas validadas com sucesso", example = "142")
    private Long placasValidadas;

    @Schema(description = "Placas com erro de reconhecimento", example = "8")
    private Long placasComErro;

    @Schema(description = "Taxa de acerto do OCR (%)", example = "94.67")
    private BigDecimal taxaAcerto;

    @Schema(description = "Tempo médio de processamento (ms)", example = "250")
    private BigDecimal tempoMedioProcessamento;

    @Schema(description = "Lista de placas detectadas no período")
    private List<PlacaDetectadaDto> placasDetectadas;

    @Schema(description = "Erros mais comuns no reconhecimento")
    private List<ErroOcrDto> errosComuns;

    @Schema(description = "Performance por horário")
    private List<PerformanceOcrDto> performancePorHorario;

    @Schema(description = "Confiança média do reconhecimento", example = "0.92")
    private BigDecimal confiancaMedia;

    // Construtor padrão
    public RelatorioOcrDto() {}

    // Construtor completo
    public RelatorioOcrDto(LocalDate data, Long totalPlacasDetectadas, Long placasValidadas,
                          Long placasComErro, BigDecimal taxaAcerto, BigDecimal tempoMedioProcessamento,
                          List<PlacaDetectadaDto> placasDetectadas, List<ErroOcrDto> errosComuns,
                          List<PerformanceOcrDto> performancePorHorario, BigDecimal confiancaMedia) {
        this.data = data;
        this.totalPlacasDetectadas = totalPlacasDetectadas;
        this.placasValidadas = placasValidadas;
        this.placasComErro = placasComErro;
        this.taxaAcerto = taxaAcerto;
        this.tempoMedioProcessamento = tempoMedioProcessamento;
        this.placasDetectadas = placasDetectadas;
        this.errosComuns = errosComuns;
        this.performancePorHorario = performancePorHorario;
        this.confiancaMedia = confiancaMedia;
    }

    // Getters e Setters
    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Long getTotalPlacasDetectadas() {
        return totalPlacasDetectadas;
    }

    public void setTotalPlacasDetectadas(Long totalPlacasDetectadas) {
        this.totalPlacasDetectadas = totalPlacasDetectadas;
    }

    public Long getPlacasValidadas() {
        return placasValidadas;
    }

    public void setPlacasValidadas(Long placasValidadas) {
        this.placasValidadas = placasValidadas;
    }

    public Long getPlacasComErro() {
        return placasComErro;
    }

    public void setPlacasComErro(Long placasComErro) {
        this.placasComErro = placasComErro;
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

    public List<PlacaDetectadaDto> getPlacasDetectadas() {
        return placasDetectadas;
    }

    public void setPlacasDetectadas(List<PlacaDetectadaDto> placasDetectadas) {
        this.placasDetectadas = placasDetectadas;
    }

    public List<ErroOcrDto> getErrosComuns() {
        return errosComuns;
    }

    public void setErrosComuns(List<ErroOcrDto> errosComuns) {
        this.errosComuns = errosComuns;
    }

    public List<PerformanceOcrDto> getPerformancePorHorario() {
        return performancePorHorario;
    }

    public void setPerformancePorHorario(List<PerformanceOcrDto> performancePorHorario) {
        this.performancePorHorario = performancePorHorario;
    }

    public BigDecimal getConfiancaMedia() {
        return confiancaMedia;
    }

    public void setConfiancaMedia(BigDecimal confiancaMedia) {
        this.confiancaMedia = confiancaMedia;
    }

    @Override
    public String toString() {
        return "RelatorioOcrDto{" +
                "data=" + data +
                ", totalPlacasDetectadas=" + totalPlacasDetectadas +
                ", placasValidadas=" + placasValidadas +
                ", placasComErro=" + placasComErro +
                ", taxaAcerto=" + taxaAcerto +
                ", confiancaMedia=" + confiancaMedia +
                '}';
    }
}


