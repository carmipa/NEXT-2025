package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Relatório de análise comportamental de veículos")
public class AnaliseComportamentalDto {

    @Schema(description = "ID do veículo", example = "1")
    private Long veiculoId;

    @Schema(description = "Placa do veículo", example = "ABC1234")
    private String placa;

    @Schema(description = "Padrão comportamental identificado", example = "CLIENTE_FREQUENTE")
    private String padraoComportamental;

    @Schema(description = "Lista de horários mais frequentes de uso")
    private List<HorarioFrequenteDto> horariosFrequentes;

    @Schema(description = "Tempo médio de estacionamento em minutos", example = "120")
    private BigDecimal tempoMedioEstacionamento;

    @Schema(description = "Previsão da próxima visita", example = "2025-01-16T08:30:00")
    private LocalDateTime previsaoProximaVisita;

    @Schema(description = "Probabilidade da previsão (0-1)", example = "0.85")
    private BigDecimal probabilidadePrevisao;

    @Schema(description = "Número total de visitas", example = "45")
    private Integer totalVisitas;

    @Schema(description = "Dias da semana mais frequentes", example = "['SEGUNDA', 'QUARTA', 'SEXTA']")
    private List<String> diasSemanaFrequentes;

    @Schema(description = "Pátio preferido", example = "Pátio Centro")
    private String patioPreferido;

    @Schema(description = "Box preferido", example = "BOX-15")
    private String boxPreferido;

    @Schema(description = "Valor do cliente (frequência x tempo)", example = "ALTO")
    private String valorCliente; // "ALTO", "MEDIO", "BAIXO"

    @Schema(description = "Recomendações personalizadas")
    private List<String> recomendacoes;

    @Schema(description = "Data da última análise", example = "2025-01-15T10:00:00")
    private LocalDateTime dataUltimaAnalise;

    // Construtor padrão
    public AnaliseComportamentalDto() {}

    // Construtor completo
    public AnaliseComportamentalDto(Long veiculoId, String placa, String padraoComportamental,
                                   List<HorarioFrequenteDto> horariosFrequentes, BigDecimal tempoMedioEstacionamento,
                                   LocalDateTime previsaoProximaVisita, BigDecimal probabilidadePrevisao,
                                   Integer totalVisitas, List<String> diasSemanaFrequentes,
                                   String patioPreferido, String boxPreferido, String valorCliente,
                                   List<String> recomendacoes, LocalDateTime dataUltimaAnalise) {
        this.veiculoId = veiculoId;
        this.placa = placa;
        this.padraoComportamental = padraoComportamental;
        this.horariosFrequentes = horariosFrequentes;
        this.tempoMedioEstacionamento = tempoMedioEstacionamento;
        this.previsaoProximaVisita = previsaoProximaVisita;
        this.probabilidadePrevisao = probabilidadePrevisao;
        this.totalVisitas = totalVisitas;
        this.diasSemanaFrequentes = diasSemanaFrequentes;
        this.patioPreferido = patioPreferido;
        this.boxPreferido = boxPreferido;
        this.valorCliente = valorCliente;
        this.recomendacoes = recomendacoes;
        this.dataUltimaAnalise = dataUltimaAnalise;
    }

    // Getters e Setters
    public Long getVeiculoId() {
        return veiculoId;
    }

    public void setVeiculoId(Long veiculoId) {
        this.veiculoId = veiculoId;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getPadraoComportamental() {
        return padraoComportamental;
    }

    public void setPadraoComportamental(String padraoComportamental) {
        this.padraoComportamental = padraoComportamental;
    }

    public List<HorarioFrequenteDto> getHorariosFrequentes() {
        return horariosFrequentes;
    }

    public void setHorariosFrequentes(List<HorarioFrequenteDto> horariosFrequentes) {
        this.horariosFrequentes = horariosFrequentes;
    }

    public BigDecimal getTempoMedioEstacionamento() {
        return tempoMedioEstacionamento;
    }

    public void setTempoMedioEstacionamento(BigDecimal tempoMedioEstacionamento) {
        this.tempoMedioEstacionamento = tempoMedioEstacionamento;
    }

    public LocalDateTime getPrevisaoProximaVisita() {
        return previsaoProximaVisita;
    }

    public void setPrevisaoProximaVisita(LocalDateTime previsaoProximaVisita) {
        this.previsaoProximaVisita = previsaoProximaVisita;
    }

    public BigDecimal getProbabilidadePrevisao() {
        return probabilidadePrevisao;
    }

    public void setProbabilidadePrevisao(BigDecimal probabilidadePrevisao) {
        this.probabilidadePrevisao = probabilidadePrevisao;
    }

    public Integer getTotalVisitas() {
        return totalVisitas;
    }

    public void setTotalVisitas(Integer totalVisitas) {
        this.totalVisitas = totalVisitas;
    }

    public List<String> getDiasSemanaFrequentes() {
        return diasSemanaFrequentes;
    }

    public void setDiasSemanaFrequentes(List<String> diasSemanaFrequentes) {
        this.diasSemanaFrequentes = diasSemanaFrequentes;
    }

    public String getPatioPreferido() {
        return patioPreferido;
    }

    public void setPatioPreferido(String patioPreferido) {
        this.patioPreferido = patioPreferido;
    }

    public String getBoxPreferido() {
        return boxPreferido;
    }

    public void setBoxPreferido(String boxPreferido) {
        this.boxPreferido = boxPreferido;
    }

    public String getValorCliente() {
        return valorCliente;
    }

    public void setValorCliente(String valorCliente) {
        this.valorCliente = valorCliente;
    }

    public List<String> getRecomendacoes() {
        return recomendacoes;
    }

    public void setRecomendacoes(List<String> recomendacoes) {
        this.recomendacoes = recomendacoes;
    }

    public LocalDateTime getDataUltimaAnalise() {
        return dataUltimaAnalise;
    }

    public void setDataUltimaAnalise(LocalDateTime dataUltimaAnalise) {
        this.dataUltimaAnalise = dataUltimaAnalise;
    }

    @Override
    public String toString() {
        return "AnaliseComportamentalDto{" +
                "veiculoId=" + veiculoId +
                ", placa='" + placa + '\'' +
                ", padraoComportamental='" + padraoComportamental + '\'' +
                ", tempoMedioEstacionamento=" + tempoMedioEstacionamento +
                ", totalVisitas=" + totalVisitas +
                ", valorCliente='" + valorCliente + '\'' +
                '}';
    }
}


