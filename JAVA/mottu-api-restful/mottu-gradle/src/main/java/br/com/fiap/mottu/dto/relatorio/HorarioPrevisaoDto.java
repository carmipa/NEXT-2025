package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Previsão de ocupação para um horário específico")
public class HorarioPrevisaoDto {

    @Schema(description = "Horário da previsão", example = "2025-01-15T14:00:00")
    private LocalDateTime horario;

    @Schema(description = "Taxa de ocupação prevista (%)", example = "75.5")
    private BigDecimal taxaOcupacaoPrevista;

    @Schema(description = "Número de boxes ocupados previstos", example = "15")
    private Integer boxesOcupadosPrevistos;

    @Schema(description = "Número de boxes livres previstos", example = "5")
    private Integer boxesLivresPrevistos;

    @Schema(description = "Nível de confiança da previsão (0-1)", example = "0.88")
    private BigDecimal nivelConfianca;

    @Schema(description = "Categoria da ocupação", example = "ALTA")
    private String categoriaOcupacao; // "ALTA", "MEDIA", "BAIXA"

    @Schema(description = "Recomendação para este horário", example = "Preparar equipe adicional")
    private String recomendacao;

    // Construtor padrão
    public HorarioPrevisaoDto() {}

    // Construtor completo
    public HorarioPrevisaoDto(LocalDateTime horario, BigDecimal taxaOcupacaoPrevista,
                             Integer boxesOcupadosPrevistos, Integer boxesLivresPrevistos,
                             BigDecimal nivelConfianca, String categoriaOcupacao, String recomendacao) {
        this.horario = horario;
        this.taxaOcupacaoPrevista = taxaOcupacaoPrevista;
        this.boxesOcupadosPrevistos = boxesOcupadosPrevistos;
        this.boxesLivresPrevistos = boxesLivresPrevistos;
        this.nivelConfianca = nivelConfianca;
        this.categoriaOcupacao = categoriaOcupacao;
        this.recomendacao = recomendacao;
    }

    // Getters e Setters
    public LocalDateTime getHorario() {
        return horario;
    }

    public void setHorario(LocalDateTime horario) {
        this.horario = horario;
    }

    public BigDecimal getTaxaOcupacaoPrevista() {
        return taxaOcupacaoPrevista;
    }

    public void setTaxaOcupacaoPrevista(BigDecimal taxaOcupacaoPrevista) {
        this.taxaOcupacaoPrevista = taxaOcupacaoPrevista;
    }

    public Integer getBoxesOcupadosPrevistos() {
        return boxesOcupadosPrevistos;
    }

    public void setBoxesOcupadosPrevistos(Integer boxesOcupadosPrevistos) {
        this.boxesOcupadosPrevistos = boxesOcupadosPrevistos;
    }

    public Integer getBoxesLivresPrevistos() {
        return boxesLivresPrevistos;
    }

    public void setBoxesLivresPrevistos(Integer boxesLivresPrevistos) {
        this.boxesLivresPrevistos = boxesLivresPrevistos;
    }

    public BigDecimal getNivelConfianca() {
        return nivelConfianca;
    }

    public void setNivelConfianca(BigDecimal nivelConfianca) {
        this.nivelConfianca = nivelConfianca;
    }

    public String getCategoriaOcupacao() {
        return categoriaOcupacao;
    }

    public void setCategoriaOcupacao(String categoriaOcupacao) {
        this.categoriaOcupacao = categoriaOcupacao;
    }

    public String getRecomendacao() {
        return recomendacao;
    }

    public void setRecomendacao(String recomendacao) {
        this.recomendacao = recomendacao;
    }

    @Override
    public String toString() {
        return "HorarioPrevisaoDto{" +
                "horario=" + horario +
                ", taxaOcupacaoPrevista=" + taxaOcupacaoPrevista +
                ", boxesOcupadosPrevistos=" + boxesOcupadosPrevistos +
                ", boxesLivresPrevistos=" + boxesLivresPrevistos +
                ", nivelConfianca=" + nivelConfianca +
                ", categoriaOcupacao='" + categoriaOcupacao + '\'' +
                ", recomendacao='" + recomendacao + '\'' +
                '}';
    }
}


