package br.com.fiap.mottu.filter.relatorios;

import br.com.fiap.mottu.model.LogMovimentacao;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Filtro para relatórios de movimentação
 */
public class MovimentacaoFilter {
    
    private Long patioId;
    private String nomePatio;
    private Long veiculoId;
    private String placaVeiculo;
    private LogMovimentacao.TipoMovimentacao tipoMovimentacao;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String horarioInicio;
    private String horarioFim;
    private String diaSemana;
    private String ordenacao;
    private String direcaoOrdenacao;
    private Integer limite;
    private Integer offset;
    
    // Construtores
    public MovimentacaoFilter() {}
    
    public MovimentacaoFilter(LocalDate dataInicio, LocalDate dataFim) {
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }
    
    public MovimentacaoFilter(Long patioId, LogMovimentacao.TipoMovimentacao tipoMovimentacao) {
        this.patioId = patioId;
        this.tipoMovimentacao = tipoMovimentacao;
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
    
    public Long getVeiculoId() {
        return veiculoId;
    }
    
    public void setVeiculoId(Long veiculoId) {
        this.veiculoId = veiculoId;
    }
    
    public String getPlacaVeiculo() {
        return placaVeiculo;
    }
    
    public void setPlacaVeiculo(String placaVeiculo) {
        this.placaVeiculo = placaVeiculo;
    }
    
    public LogMovimentacao.TipoMovimentacao getTipoMovimentacao() {
        return tipoMovimentacao;
    }
    
    public void setTipoMovimentacao(LogMovimentacao.TipoMovimentacao tipoMovimentacao) {
        this.tipoMovimentacao = tipoMovimentacao;
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
    
    public String getHorarioInicio() {
        return horarioInicio;
    }
    
    public void setHorarioInicio(String horarioInicio) {
        this.horarioInicio = horarioInicio;
    }
    
    public String getHorarioFim() {
        return horarioFim;
    }
    
    public void setHorarioFim(String horarioFim) {
        this.horarioFim = horarioFim;
    }
    
    public String getDiaSemana() {
        return diaSemana;
    }
    
    public void setDiaSemana(String diaSemana) {
        this.diaSemana = diaSemana;
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
     * Verifica se o filtro tem critérios de veículo
     */
    public boolean hasVeiculoCriteria() {
        return veiculoId != null || placaVeiculo != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de pátio
     */
    public boolean hasPatioCriteria() {
        return patioId != null || nomePatio != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de data
     */
    public boolean hasDataCriteria() {
        return dataInicio != null || dataFim != null ||
               dataHoraInicio != null || dataHoraFim != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de horário
     */
    public boolean hasHorarioCriteria() {
        return horarioInicio != null || horarioFim != null || diaSemana != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de movimentação
     */
    public boolean hasMovimentacaoCriteria() {
        return tipoMovimentacao != null;
    }
    
    /**
     * Verifica se o filtro tem algum critério
     */
    public boolean hasAnyCriteria() {
        return hasVeiculoCriteria() || hasPatioCriteria() || 
               hasDataCriteria() || hasHorarioCriteria() || hasMovimentacaoCriteria();
    }
}
