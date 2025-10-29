package br.com.fiap.mottu.dto.relatorio.analytics;

import java.io.Serializable;

public class TopBoxDto implements Serializable {
    private Long boxId;
    private String nome;
    private Long total;

    public TopBoxDto() {}
    public TopBoxDto(Long boxId, String nome, Long total) {
        this.boxId = boxId; this.nome = nome; this.total = total;
    }
    public Long getBoxId() { return boxId; }
    public void setBoxId(Long boxId) { this.boxId = boxId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Long getTotal() { return total; }
    public void setTotal(Long total) { this.total = total; }
}


