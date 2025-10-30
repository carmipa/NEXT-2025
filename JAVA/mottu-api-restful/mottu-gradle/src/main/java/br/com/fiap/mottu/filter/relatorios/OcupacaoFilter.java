package br.com.fiap.mottu.filter.relatorios;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Filtro para relatórios de ocupação
 */
public class OcupacaoFilter {
    
    private Long patioId;
    private String nomePatio;
    private String statusPatio;
    private Double taxaOcupacaoMin;
    private Double taxaOcupacaoMax;
    private Integer totalBoxesMin;
    private Integer totalBoxesMax;
    private Integer boxesOcupadosMin;
    private Integer boxesOcupadosMax;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String ordenacao;
    private String direcaoOrdenacao;
    
    // Construtores
    public OcupacaoFilter() {}
    
    public OcupacaoFilter(Long patioId, String nomePatio, String statusPatio) {
        this.patioId = patioId;
        this.nomePatio = nomePatio;
        this.statusPatio = statusPatio;
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
    
    public Integer getTotalBoxesMin() {
        return totalBoxesMin;
    }
    
    public void setTotalBoxesMin(Integer totalBoxesMin) {
        this.totalBoxesMin = totalBoxesMin;
    }
    
    public Integer getTotalBoxesMax() {
        return totalBoxesMax;
    }
    
    public void setTotalBoxesMax(Integer totalBoxesMax) {
        this.totalBoxesMax = totalBoxesMax;
    }
    
    public Integer getBoxesOcupadosMin() {
        return boxesOcupadosMin;
    }
    
    public void setBoxesOcupadosMin(Integer boxesOcupadosMin) {
        this.boxesOcupadosMin = boxesOcupadosMin;
    }
    
    public Integer getBoxesOcupadosMax() {
        return boxesOcupadosMax;
    }
    
    public void setBoxesOcupadosMax(Integer boxesOcupadosMax) {
        this.boxesOcupadosMax = boxesOcupadosMax;
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
    
    /**
     * Verifica se o filtro tem critérios de ocupação
     */
    public boolean hasOcupacaoCriteria() {
        return taxaOcupacaoMin != null || taxaOcupacaoMax != null ||
               totalBoxesMin != null || totalBoxesMax != null ||
               boxesOcupadosMin != null || boxesOcupadosMax != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de data
     */
    public boolean hasDataCriteria() {
        return dataInicio != null || dataFim != null ||
               dataHoraInicio != null || dataHoraFim != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de pátio
     */
    public boolean hasPatioCriteria() {
        return patioId != null || nomePatio != null || statusPatio != null;
    }
    
    /**
     * Verifica se o filtro tem algum critério
     */
    public boolean hasAnyCriteria() {
        return hasOcupacaoCriteria() || hasDataCriteria() || hasPatioCriteria();
    }
}
