package br.com.fiap.mottu.dto.relatorio.analytics;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@Schema(description = "KPIs básicos de analytics")
public class AnalyticsKpiDto implements Serializable {
    private long totalEventos;
    private long usuariosUnicos;
    private double conversaoPercent;

    public long getTotalEventos() { return totalEventos; }
    public void setTotalEventos(long totalEventos) { this.totalEventos = totalEventos; }
    public long getUsuariosUnicos() { return usuariosUnicos; }
    public void setUsuariosUnicos(long usuariosUnicos) { this.usuariosUnicos = usuariosUnicos; }
    public double getConversaoPercent() { return conversaoPercent; }
    public void setConversaoPercent(double conversaoPercent) { this.conversaoPercent = conversaoPercent; }
}


