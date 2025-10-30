package br.com.fiap.mottu.dto.relatorio.manutencao;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@Schema(description = "Resumo de manutenção")
public class ManutencaoResumoDto implements Serializable {
    private long pendentes;
    private long emAndamento;
    private long concluidas;

    public long getPendentes() { return pendentes; }
    public void setPendentes(long pendentes) { this.pendentes = pendentes; }
    public long getEmAndamento() { return emAndamento; }
    public void setEmAndamento(long emAndamento) { this.emAndamento = emAndamento; }
    public long getConcluidas() { return concluidas; }
    public void setConcluidas(long concluidas) { this.concluidas = concluidas; }
}


