package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Coordenadas da placa detectada na imagem")
public class CoordenadasPlacaDto {

    @Schema(description = "Coordenada X do canto superior esquerdo", example = "100")
    private Integer x;

    @Schema(description = "Coordenada Y do canto superior esquerdo", example = "150")
    private Integer y;

    @Schema(description = "Largura da placa em pixels", example = "200")
    private Integer largura;

    @Schema(description = "Altura da placa em pixels", example = "80")
    private Integer altura;

    // Construtor padrão
    public CoordenadasPlacaDto() {}

    // Construtor completo
    public CoordenadasPlacaDto(Integer x, Integer y, Integer largura, Integer altura) {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
    }

    // Getters e Setters
    public Integer getX() {
        return x;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(Integer y) {
        this.y = y;
    }

    public Integer getLargura() {
        return largura;
    }

    public void setLargura(Integer largura) {
        this.largura = largura;
    }

    public Integer getAltura() {
        return altura;
    }

    public void setAltura(Integer altura) {
        this.altura = altura;
    }

    @Override
    public String toString() {
        return "CoordenadasPlacaDto{" +
                "x=" + x +
                ", y=" + y +
                ", largura=" + largura +
                ", altura=" + altura +
                '}';
    }
}


