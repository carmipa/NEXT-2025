package br.com.fiap.mottu.dto.relatorio.analytics;

import java.io.Serializable;

public class TopVeiculoDto implements Serializable {
    private Long veiculoId;
    private String placa;
    private Long total;

    public TopVeiculoDto() {}
    public TopVeiculoDto(Long veiculoId, String placa, Long total) {
        this.veiculoId = veiculoId; this.placa = placa; this.total = total;
    }
    public Long getVeiculoId() { return veiculoId; }
    public void setVeiculoId(Long veiculoId) { this.veiculoId = veiculoId; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public Long getTotal() { return total; }
    public void setTotal(Long total) { this.total = total; }
}


