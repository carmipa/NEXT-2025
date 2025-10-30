package br.com.fiap.mottu.filter.relatorios;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Filtro para relatórios de análise comportamental
 */
public class ComportamentalFilter {
    
    private Long patioId;
    private String nomePatio;
    private String tipoAnalise; // HORARIOS_PICO, PADROES_SEMANAIS, FREQUENCIA_USO
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String horarioInicio;
    private String horarioFim;
    private String diaSemana;
    private String categoriaVeiculo;
    private String fabricanteVeiculo;
    private Integer idadeMinima;
    private Integer idadeMaxima;
    private String sexoCliente;
    private String ordenacao;
    private String direcaoOrdenacao;
    private Integer limite;
    private Integer offset;
    
    // Construtores
    public ComportamentalFilter() {}
    
    public ComportamentalFilter(String tipoAnalise) {
        this.tipoAnalise = tipoAnalise;
    }
    
    public ComportamentalFilter(LocalDate dataInicio, LocalDate dataFim, String tipoAnalise) {
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.tipoAnalise = tipoAnalise;
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
    
    public String getTipoAnalise() {
        return tipoAnalise;
    }
    
    public void setTipoAnalise(String tipoAnalise) {
        this.tipoAnalise = tipoAnalise;
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
    
    public String getCategoriaVeiculo() {
        return categoriaVeiculo;
    }
    
    public void setCategoriaVeiculo(String categoriaVeiculo) {
        this.categoriaVeiculo = categoriaVeiculo;
    }
    
    public String getFabricanteVeiculo() {
        return fabricanteVeiculo;
    }
    
    public void setFabricanteVeiculo(String fabricanteVeiculo) {
        this.fabricanteVeiculo = fabricanteVeiculo;
    }
    
    public Integer getIdadeMinima() {
        return idadeMinima;
    }
    
    public void setIdadeMinima(Integer idadeMinima) {
        this.idadeMinima = idadeMinima;
    }
    
    public Integer getIdadeMaxima() {
        return idadeMaxima;
    }
    
    public void setIdadeMaxima(Integer idadeMaxima) {
        this.idadeMaxima = idadeMaxima;
    }
    
    public String getSexoCliente() {
        return sexoCliente;
    }
    
    public void setSexoCliente(String sexoCliente) {
        this.sexoCliente = sexoCliente;
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
     * Verifica se o filtro tem critérios de veículo
     */
    public boolean hasVeiculoCriteria() {
        return categoriaVeiculo != null || fabricanteVeiculo != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de cliente
     */
    public boolean hasClienteCriteria() {
        return idadeMinima != null || idadeMaxima != null || sexoCliente != null;
    }
    
    /**
     * Verifica se o filtro tem critérios de análise
     */
    public boolean hasAnaliseCriteria() {
        return tipoAnalise != null;
    }
    
    /**
     * Verifica se o filtro tem algum critério
     */
    public boolean hasAnyCriteria() {
        return hasPatioCriteria() || hasDataCriteria() || hasHorarioCriteria() ||
               hasVeiculoCriteria() || hasClienteCriteria() || hasAnaliseCriteria();
    }
}
