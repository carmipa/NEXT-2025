package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "DTO para erros de reconhecimento OCR")
public class ErroOcrDto {

    @Schema(description = "Tipo do erro", example = "CARACTERE_INVÁLIDO")
    private String tipoErro;

    @Schema(description = "Descrição do erro", example = "Caractere não reconhecido na posição 3")
    private String descricao;

    @Schema(description = "Frequência do erro", example = "15")
    private Long frequencia;

    @Schema(description = "Confiança média quando ocorre este erro", example = "0.65")
    private BigDecimal confiancaMedia;

    @Schema(description = "Exemplo da placa com erro", example = "ABC-1X23")
    private String exemploPlaca;

    // Construtor padrão
    public ErroOcrDto() {}

    // Construtor completo
    public ErroOcrDto(String tipoErro, String descricao, Long frequencia, 
                      BigDecimal confiancaMedia, String exemploPlaca) {
        this.tipoErro = tipoErro;
        this.descricao = descricao;
        this.frequencia = frequencia;
        this.confiancaMedia = confiancaMedia;
        this.exemploPlaca = exemploPlaca;
    }

    // Getters e Setters
    public String getTipoErro() {
        return tipoErro;
    }

    public void setTipoErro(String tipoErro) {
        this.tipoErro = tipoErro;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Long getFrequencia() {
        return frequencia;
    }

    public void setFrequencia(Long frequencia) {
        this.frequencia = frequencia;
    }

    public BigDecimal getConfiancaMedia() {
        return confiancaMedia;
    }

    public void setConfiancaMedia(BigDecimal confiancaMedia) {
        this.confiancaMedia = confiancaMedia;
    }

    public String getExemploPlaca() {
        return exemploPlaca;
    }

    public void setExemploPlaca(String exemploPlaca) {
        this.exemploPlaca = exemploPlaca;
    }

    @Override
    public String toString() {
        return "ErroOcrDto{" +
                "tipoErro='" + tipoErro + '\'' +
                ", descricao='" + descricao + '\'' +
                ", frequencia=" + frequencia +
                ", confiancaMedia=" + confiancaMedia +
                ", exemploPlaca='" + exemploPlaca + '\'' +
                '}';
    }
}






