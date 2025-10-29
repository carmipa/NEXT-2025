package br.com.fiap.mottu.filter.relatorios;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Filtro para relatórios de performance
 */
public class PerformanceFilter {
    
    private Long patioId;
    private String nomePatio;
    private String statusPatio;
    private Double taxaOcupacaoMin;
    private Double taxaOcupacaoMax;
    private Double tempoMedioEstacionamentoMin;
    private Double tempoMedioEstacionamentoMax;
    private Integer rankingMin;
    private Integer rankingMax;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String periodoComparacao; // DIARIO, SEMANAL, MENSAL, ANUAL
    private String tipoMetrica; // OCUPACAO, TEMPO_ESTACIONAMENTO, EFICIENCIA
    private String ordenacao;
    private String direcaoOrdenacao;
    private Integer limite;
    private Integer offset;
    
    // Construtores
    public PerformanceFilter() {}
    
    public PerformanceFilter(Long patioId) {
        this.patioId = patioId;
    }
    
    public PerformanceFilter(String tipoMetrica, String periodoComparacao) {
        this.tipoMetrica = tipoMetrica;
        this.periodoComparacao = periodoComparacao;
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
    
    public String getStatusPatio() {
        return statusPatio;
    }
    
    public void setStatusPatio(String statusPatio) {
        this.statusPatio = statusPatio;
    }
    
    public Double getTaxaOcupacaoMin() {
        return taxaOcupacaoMin;
    }
    
    public void setTaxaOcupacaoMin(Double taxaOcupacaoMin) {
        this.taxaOcupacaoMin = taxaOcupacaoMin;
    }
    
    public Double getTaxaOcupacaoMax() {
        return taxaOcupacaoMax;
    }
    
    public void setTaxaOcupacaoMax(Double taxaOcupacaoMax) {
        this.taxaOcupacaoMax = taxaOcupacaoMax;
    }
    
    public Double getTempoMedioEstacionamentoMin() {
        return tempoMedioEstacionamentoMin;
    }
    
    public void setTempoMedioEstacionamentoMin(Double tempoMedioEstacionamentoMin) {
        this.tempoMedioEstacionamentoMin = tempoMedioEstacionamentoMin;
    }
    
    public Double getTempoMedioEstacionamentoMax() {
        return tempoMedioEstacionamentoMax;
    }
    
    public void setTempoMedioEstacionamentoMax(Double tempoMedioEstacionamentoMax) {
        this.tempoMedioEstacionamentoMax = tempoMedioEstacionamentoMax;
    }
    
    public Integer getRankingMin() {
        return rankingMin;
    }
    
    public void setRankingMin(Integer rankingMin) {
        this.rankingMin = rankingMin;
    }
    
    public Integer getRankingMax() {
        return rankingMax;
    }
    
    public void setRankingMax(Integer rankingMax) {
        this.rankingMax = rankingMax;
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
    
    public String getPeriodoComparacao() {
        return periodoComparacao;
    }
    
    public void setPeriodoComparacao(String periodoComparacao) {
        this.periodoComparacao = periodoComparacao;
    }
    
    public String getTipoMetrica() {
        return tipoMetrica;
    }
    
    public void setTipoMetrica(String tipoMetrica) {
        this.tipoMetrica = tipoMetrica;
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
        return patioId != null || nomePatio != null || statusPatio != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de performance
     */
    public boolean hasPerformanceCriteria() {
        return taxaOcupacaoMin != null || taxaOcupacaoMax != null ||
               tempoMedioEstacionamentoMin != null || tempoMedioEstacionamentoMax != null ||
               rankingMin != null || rankingMax != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de data
     */
    public boolean hasDataCriteria() {
        return dataInicio != null || dataFim != null ||
               dataHoraInicio != null || dataHoraFim != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de análise
     */
    public boolean hasAnaliseCriteria() {
        return tipoMetrica != null || periodoComparacao != null;
    }
    
    /**
     * Verifica se o filtro tem algum critério
     */
    public boolean hasAnyCriteria() {
        return hasPatioCriteria() || hasPerformanceCriteria() || 
               hasDataCriteria() || hasAnaliseCriteria();
    }
}
