package br.com.fiap.mottu.dto.relatorio;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalTime;

@Schema(description = "Horário mais frequente de uso do pátio")
public class HorarioFrequenteDto {

    @Schema(description = "Horário de início", example = "08:00:00")
    private LocalTime horarioInicio;

    @Schema(description = "Horário de fim", example = "09:00:00")
    private LocalTime horarioFim;

    @Schema(description = "Frequência de uso neste horário (%)", example = "85.5")
    private BigDecimal frequencia;

    @Schema(description = "Número de ocorrências neste horário", example = "42")
    private Integer ocorrencias;

    @Schema(description = "Dia da semana mais comum", example = "SEGUNDA")
    private String diaSemanaComum;

    // Construtor padrão
    public HorarioFrequenteDto() {}

    // Construtor completo
    public HorarioFrequenteDto(LocalTime horarioInicio, LocalTime horarioFim, 
                              BigDecimal frequencia, Integer ocorrencias, String diaSemanaComum) {
        this.horarioInicio = horarioInicio;
        this.horarioFim = horarioFim;
        this.frequencia = frequencia;
        this.ocorrencias = ocorrencias;
        this.diaSemanaComum = diaSemanaComum;
    }

    // Getters e Setters
    public LocalTime getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(LocalTime horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public LocalTime getHorarioFim() {
        return horarioFim;
    }

    public void setHorarioFim(LocalTime horarioFim) {
        this.horarioFim = horarioFim;
    }

    public BigDecimal getFrequencia() {
        return frequencia;
    }

    public void setFrequencia(BigDecimal frequencia) {
        this.frequencia = frequencia;
    }

    public Integer getOcorrencias() {
        return ocorrencias;
    }

    public void setOcorrencias(Integer ocorrencias) {
        this.ocorrencias = ocorrencias;
    }

    public String getDiaSemanaComum() {
        return diaSemanaComum;
    }

    public void setDiaSemanaComum(String diaSemanaComum) {
        this.diaSemanaComum = diaSemanaComum;
    }

    @Override
    public String toString() {
        return "HorarioFrequenteDto{" +
                "horarioInicio=" + horarioInicio +
                ", horarioFim=" + horarioFim +
                ", frequencia=" + frequencia +
                ", ocorrencias=" + ocorrencias +
                ", diaSemanaComum='" + diaSemanaComum + '\'' +
                '}';
    }
}


