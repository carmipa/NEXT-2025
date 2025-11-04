package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Informações de uma placa detectada via OCR")
public class PlacaDetectadaDto {

    @Schema(description = "Placa detectada", example = "ABC1234")
    private String placa;

    @Schema(description = "Confiança do reconhecimento (0-1)", example = "0.95")
    private BigDecimal confianca;

    @Schema(description = "Data e hora da detecção", example = "2025-01-15T14:30:00")
    private LocalDateTime dataHoraDetecao;

    @Schema(description = "Status da validação", example = "VALIDADA")
    private String statusValidacao; // "VALIDADA", "ERRO", "PENDENTE"

    @Schema(description = "Tipo de erro se houver", example = "CARACTERE_INDEFINIDO")
    private String tipoErro;

    @Schema(description = "Tempo de processamento (ms)", example = "180")
    private Long tempoProcessamento;

    @Schema(description = "Coordenadas da placa na imagem")
    private CoordenadasPlacaDto coordenadas;

    @Schema(description = "Qualidade da imagem (0-1)", example = "0.87")
    private BigDecimal qualidadeImagem;

    // Construtor padrão
    public PlacaDetectadaDto() {}

    // Construtor completo
    public PlacaDetectadaDto(String placa, BigDecimal confianca, LocalDateTime dataHoraDetecao,
                            String statusValidacao, String tipoErro, Long tempoProcessamento,
                            CoordenadasPlacaDto coordenadas, BigDecimal qualidadeImagem) {
        this.placa = placa;
        this.confianca = confianca;
        this.dataHoraDetecao = dataHoraDetecao;
        this.statusValidacao = statusValidacao;
        this.tipoErro = tipoErro;
        this.tempoProcessamento = tempoProcessamento;
        this.coordenadas = coordenadas;
        this.qualidadeImagem = qualidadeImagem;
    }

    // Getters e Setters
    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public BigDecimal getConfianca() {
        return confianca;
    }

    public void setConfianca(BigDecimal confianca) {
        this.confianca = confianca;
    }

    public LocalDateTime getDataHoraDetecao() {
        return dataHoraDetecao;
    }

    public void setDataHoraDetecao(LocalDateTime dataHoraDetecao) {
        this.dataHoraDetecao = dataHoraDetecao;
    }

    public String getStatusValidacao() {
        return statusValidacao;
    }

    public void setStatusValidacao(String statusValidacao) {
        this.statusValidacao = statusValidacao;
    }

    public String getTipoErro() {
        return tipoErro;
    }

    public void setTipoErro(String tipoErro) {
        this.tipoErro = tipoErro;
    }

    public Long getTempoProcessamento() {
        return tempoProcessamento;
    }

    public void setTempoProcessamento(Long tempoProcessamento) {
        this.tempoProcessamento = tempoProcessamento;
    }

    public CoordenadasPlacaDto getCoordenadas() {
        return coordenadas;
    }

    public void setCoordenadas(CoordenadasPlacaDto coordenadas) {
        this.coordenadas = coordenadas;
    }

    public BigDecimal getQualidadeImagem() {
        return qualidadeImagem;
    }

    public void setQualidadeImagem(BigDecimal qualidadeImagem) {
        this.qualidadeImagem = qualidadeImagem;
    }

    @Override
    public String toString() {
        return "PlacaDetectadaDto{" +
                "placa='" + placa + '\'' +
                ", confianca=" + confianca +
                ", dataHoraDetecao=" + dataHoraDetecao +
                ", statusValidacao='" + statusValidacao + '\'' +
                ", confianca=" + confianca +
                '}';
    }
}


