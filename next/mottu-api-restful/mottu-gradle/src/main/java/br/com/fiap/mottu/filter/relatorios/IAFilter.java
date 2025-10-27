package br.com.fiap.mottu.filter.relatorios;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Filtro para relatórios de IA e previsões
 */
public class IAFilter {
    
    private Long patioId;
    private String nomePatio;
    private String tipoIA; // PREVISAO, INSIGHTS, ANALISE_PREDITIVA
    private Double confiancaMin;
    private Double confiancaMax;
    private Double previsaoMin;
    private Double previsaoMax;
    private String tendencia; // ALTA, BAIXA, ESTAVEL
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String horizontePrevisao; // 1H, 2H, 4H, 8H, 24H
    private String algoritmoIA; // REGRESSAO_LINEAR, REDE_NEURAL, ARIMA
    private String ordenacao;
    private String direcaoOrdenacao;
    private Integer limite;
    private Integer offset;
    
    // Construtores
    public IAFilter() {}
    
    public IAFilter(String tipoIA) {
        this.tipoIA = tipoIA;
    }
    
    public IAFilter(Long patioId, String tipoIA, String horizontePrevisao) {
        this.patioId = patioId;
        this.tipoIA = tipoIA;
        this.horizontePrevisao = horizontePrevisao;
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
    
    public String getTipoIA() {
        return tipoIA;
    }
    
    public void setTipoIA(String tipoIA) {
        this.tipoIA = tipoIA;
    }
    
    public Double getConfiancaMin() {
        return confiancaMin;
    }
    
    public void setConfiancaMin(Double confiancaMin) {
        this.confiancaMin = confiancaMin;
    }
    
    public Double getConfiancaMax() {
        return confiancaMax;
    }
    
    public void setConfiancaMax(Double confiancaMax) {
        this.confiancaMax = confiancaMax;
    }
    
    public Double getPrevisaoMin() {
        return previsaoMin;
    }
    
    public void setPrevisaoMin(Double previsaoMin) {
        this.previsaoMin = previsaoMin;
    }
    
    public Double getPrevisaoMax() {
        return previsaoMax;
    }
    
    public void setPrevisaoMax(Double previsaoMax) {
        this.previsaoMax = previsaoMax;
    }
    
    public String getTendencia() {
        return tendencia;
    }
    
    public void setTendencia(String tendencia) {
        this.tendencia = tendencia;
    }
    
    public LocalDate getDataInicio() {
        return dataInicio;
    }
    
    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }
    
    public LocalDate getDataFim() {
        return dataFim;
    }
    
    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }
    
    public LocalDateTime getDataHoraInicio() {
        return dataHoraInicio;
    }
    
    public void setDataHoraInicio(LocalDateTime dataHoraInicio) {
        this.dataHoraInicio = dataHoraInicio;
    }
    
    public LocalDateTime getDataHoraFim() {
        return dataHoraFim;
    }
    
    public void setDataHoraFim(LocalDateTime dataHoraFim) {
        this.dataHoraFim = dataHoraFim;
    }
    
    public String getHorizontePrevisao() {
        return horizontePrevisao;
    }
    
    public void setHorizontePrevisao(String horizontePrevisao) {
        this.horizontePrevisao = horizontePrevisao;
    }
    
    public String getAlgoritmoIA() {
        return algoritmoIA;
    }
    
    public void setAlgoritmoIA(String algoritmoIA) {
        this.algoritmoIA = algoritmoIA;
    }
    
    public String getOrdenacao() {
        return ordenacao;
    }
    
    public void setOrdenacao(String ordenacao) {
        this.ordenacao = ordenacao;
    }
    
    public String getDirecaoOrdenacao() {
        return direcaoOrdenacao;
    }
    
    public void setDirecaoOrdenacao(String direcaoOrdenacao) {
        this.direcaoOrdenacao = direcaoOrdenacao;
    }
    
    public Integer getLimite() {
        return limite;
    }
    
    public void setLimite(Integer limite) {
        this.limite = limite;
    }
    
    public Integer getOffset() {
        return offset;
    }
    
    public void setOffset(Integer offset) {
        this.offset = offset;
    }
    
    /**
     * Verifica se o filtro tem critérios de pátio
     */
    public boolean hasPatioCriteria() {
        return patioId != null || nomePatio != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de IA
     */
    public boolean hasIACriteria() {
        return tipoIA != null || algoritmoIA != null || horizontePrevisao != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de previsão
     */
    public boolean hasPrevisaoCriteria() {
        return confiancaMin != null || confiancaMax != null ||
               previsaoMin != null || previsaoMax != null || tendencia != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de data
     */
    public boolean hasDataCriteria() {
        return dataInicio != null || dataFim != null ||
               dataHoraInicio != null || dataHoraFim != null;
    }
    
    /**
     * Verifica se o filtro tem algum critério
     */
    public boolean hasAnyCriteria() {
        return hasPatioCriteria() || hasIACriteria() || 
               hasPrevisaoCriteria() || hasDataCriteria();
    }
}
