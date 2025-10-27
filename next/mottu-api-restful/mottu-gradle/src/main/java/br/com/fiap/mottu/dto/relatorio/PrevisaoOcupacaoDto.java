package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Relatório de previsão de ocupação baseado em IA")
public class PrevisaoOcupacaoDto {

    @Schema(description = "ID do pátio", example = "1")
    private Long patioId;

    @Schema(description = "Nome do pátio", example = "Pátio Centro")
    private String nomePatio;

    @Schema(description = "Data e hora da previsão", example = "2025-01-15T14:30:00")
    private LocalDateTime dataHoraPrevisao;

    @Schema(description = "Probabilidade de alta ocupação (80-100%)", example = "0.85")
    private BigDecimal probabilidadeAltaOcupacao;

    @Schema(description = "Probabilidade de ocupação média (50-79%)", example = "0.12")
    private BigDecimal probabilidadeOcupacaoMedia;

    @Schema(description = "Probabilidade de baixa ocupação (0-49%)", example = "0.03")
    private BigDecimal probabilidadeBaixaOcupacao;

    @Schema(description = "Lista de horários com previsões detalhadas")
    private List<HorarioPrevisaoDto> horariosPrevisao;

    @Schema(description = "Recomendação baseada na previsão", example = "Recomenda-se aumentar a capacidade de atendimento entre 14h-16h")
    private String recomendacao;

    @Schema(description = "Confiança da previsão (0-1)", example = "0.92")
    private BigDecimal confiancaPrevisao;

    @Schema(description = "Fatores que influenciaram a previsão")
    private List<String> fatoresInfluencia;

    // Construtor padrão
    public PrevisaoOcupacaoDto() {}

    // Construtor completo
    public PrevisaoOcupacaoDto(Long patioId, String nomePatio, LocalDateTime dataHoraPrevisao,
                              BigDecimal probabilidadeAltaOcupacao, BigDecimal probabilidadeOcupacaoMedia,
                              BigDecimal probabilidadeBaixaOcupacao, List<HorarioPrevisaoDto> horariosPrevisao,
                              String recomendacao, BigDecimal confiancaPrevisao, List<String> fatoresInfluencia) {
        this.patioId = patioId;
        this.nomePatio = nomePatio;
        this.dataHoraPrevisao = dataHoraPrevisao;
        this.probabilidadeAltaOcupacao = probabilidadeAltaOcupacao;
        this.probabilidadeOcupacaoMedia = probabilidadeOcupacaoMedia;
        this.probabilidadeBaixaOcupacao = probabilidadeBaixaOcupacao;
        this.horariosPrevisao = horariosPrevisao;
        this.recomendacao = recomendacao;
        this.confiancaPrevisao = confiancaPrevisao;
        this.fatoresInfluencia = fatoresInfluencia;
    }

    // Getters e Setters
    public Long getPatioId() {
        return patioId;
    }

    public void setPatioId(Long patioId) {
        this.patioId = patioId;
    }

    public String getNomePatio() {
        return nomePatio;
    }

    public void setNomePatio(String nomePatio) {
        this.nomePatio = nomePatio;
    }

    public LocalDateTime getDataHoraPrevisao() {
        return dataHoraPrevisao;
    }

    public void setDataHoraPrevisao(LocalDateTime dataHoraPrevisao) {
        this.dataHoraPrevisao = dataHoraPrevisao;
    }

    public BigDecimal getProbabilidadeAltaOcupacao() {
        return probabilidadeAltaOcupacao;
    }

    public void setProbabilidadeAltaOcupacao(BigDecimal probabilidadeAltaOcupacao) {
        this.probabilidadeAltaOcupacao = probabilidadeAltaOcupacao;
    }

    public BigDecimal getProbabilidadeOcupacaoMedia() {
        return probabilidadeOcupacaoMedia;
    }

    public void setProbabilidadeOcupacaoMedia(BigDecimal probabilidadeOcupacaoMedia) {
        this.probabilidadeOcupacaoMedia = probabilidadeOcupacaoMedia;
    }

    public BigDecimal getProbabilidadeBaixaOcupacao() {
        return probabilidadeBaixaOcupacao;
    }

    public void setProbabilidadeBaixaOcupacao(BigDecimal probabilidadeBaixaOcupacao) {
        this.probabilidadeBaixaOcupacao = probabilidadeBaixaOcupacao;
    }

    public List<HorarioPrevisaoDto> getHorariosPrevisao() {
        return horariosPrevisao;
    }

    public void setHorariosPrevisao(List<HorarioPrevisaoDto> horariosPrevisao) {
        this.horariosPrevisao = horariosPrevisao;
    }

    public String getRecomendacao() {
        return recomendacao;
    }

    public void setRecomendacao(String recomendacao) {
        this.recomendacao = recomendacao;
    }

    public BigDecimal getConfiancaPrevisao() {
        return confiancaPrevisao;
    }

    public void setConfiancaPrevisao(BigDecimal confiancaPrevisao) {
        this.confiancaPrevisao = confiancaPrevisao;
    }

    public List<String> getFatoresInfluencia() {
        return fatoresInfluencia;
    }

    public void setFatoresInfluencia(List<String> fatoresInfluencia) {
        this.fatoresInfluencia = fatoresInfluencia;
    }

    @Override
    public String toString() {
        return "PrevisaoOcupacaoDto{" +
                "patioId=" + patioId +
                ", nomePatio='" + nomePatio + '\'' +
                ", dataHoraPrevisao=" + dataHoraPrevisao +
                ", probabilidadeAltaOcupacao=" + probabilidadeAltaOcupacao +
                ", probabilidadeOcupacaoMedia=" + probabilidadeOcupacaoMedia +
                ", probabilidadeBaixaOcupacao=" + probabilidadeBaixaOcupacao +
                ", recomendacao='" + recomendacao + '\'' +
                ", confiancaPrevisao=" + confiancaPrevisao +
                '}';
    }
}


