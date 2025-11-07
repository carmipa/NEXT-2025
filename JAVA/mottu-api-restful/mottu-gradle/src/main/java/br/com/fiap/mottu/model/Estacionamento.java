package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entidade que representa um estacionamento de veículo.
 * Centraliza as informações de estacionamento, substituindo a necessidade de múltiplos JOINs.
 * 
 * @author Sistema MOTTU
 * @since 2025-11-03
 */
@Entity
@Table(name = "TB_ESTACIONAMENTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class Estacionamento {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_estacionamento")
    @SequenceGenerator(name = "seq_estacionamento", sequenceName = "SEQ_TB_ESTACIONAMENTO", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_ESTACIONAMENTO")
    @EqualsAndHashCode.Include
    private Long idEstacionamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_VEICULO_ID_VEICULO", nullable = false)
    @ToString.Exclude
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_BOX_ID_BOX", nullable = false)
    @ToString.Exclude
    private Box box;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_PATIO_ID_PATIO", nullable = false)
    @ToString.Exclude
    private Patio patio;

    @Column(name = "ESTA_ESTACIONADO", nullable = false)
    @Builder.Default
    private Boolean estaEstacionado = true; // 1=Sim, 0=Não

    @Column(name = "DATA_ENTRADA", nullable = false)
    private LocalDateTime dataEntrada;

    @Column(name = "DATA_SAIDA")
    private LocalDateTime dataSaida;

    @LastModifiedDate
    @Column(name = "DATA_ULTIMA_ATUALIZACAO", nullable = false)
    private LocalDateTime dataUltimaAtualizacao;

    @Column(name = "OBSERVACOES", length = 500)
    private String observacoes;

    // ================== MÉTODOS DE CONVENIÊNCIA ==================

    /**
     * Verifica se o estacionamento está ativo (veículo está estacionado)
     */
    public boolean isAtivo() {
        return Boolean.TRUE.equals(this.estaEstacionado);
    }

    /**
     * Verifica se o estacionamento está inativo (veículo já saiu)
     */
    public boolean isInativo() {
        return Boolean.FALSE.equals(this.estaEstacionado);
    }

    /**
     * Marca o estacionamento como ativo (entrada)
     */
    public void ativar() {
        this.estaEstacionado = true;
        this.dataEntrada = LocalDateTime.now();
        this.dataSaida = null;
        this.dataUltimaAtualizacao = LocalDateTime.now();
    }

    /**
     * Marca o estacionamento como inativo (saída)
     */
    public void desativar() {
        this.estaEstacionado = false;
        this.dataSaida = LocalDateTime.now();
        this.dataUltimaAtualizacao = LocalDateTime.now();
    }

    /**
     * Calcula o tempo de estacionamento em minutos
     * @return tempo em minutos, ou null se ainda está estacionado
     */
    public Long calcularTempoEstacionamentoMinutos() {
        if (dataSaida != null && dataEntrada != null) {
            return java.time.Duration.between(dataEntrada, dataSaida).toMinutes();
        }
        return null;
    }

    /**
     * Calcula o tempo de estacionamento atual em minutos (se ainda estiver ativo)
     * @return tempo em minutos desde a entrada, ou null se já saiu
     */
    public Long calcularTempoEstacionamentoAtualMinutos() {
        if (isAtivo() && dataEntrada != null) {
            return java.time.Duration.between(dataEntrada, LocalDateTime.now()).toMinutes();
        }
        return null;
    }
}








