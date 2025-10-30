package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_LOG_MOVIMENTACAO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class LogMovimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_log_movimentacao")
    @SequenceGenerator(name = "seq_log_movimentacao", sequenceName = "SEQ_TB_LOG_MOVIMENTACAO", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_LOG_MOVIMENTACAO")
    @EqualsAndHashCode.Include
    private Long idLogMovimentacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_VEICULO_ID_VEICULO", nullable = false)
    @ToString.Exclude
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_BOX_ID_BOX", nullable = false)
    @ToString.Exclude
    private Box box;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_MOVIMENTACAO", nullable = false, length = 20)
    private TipoMovimentacao tipoMovimentacao;

    @CreatedDate
    @Column(name = "DATA_HORA_MOVIMENTACAO", nullable = false, updatable = false)
    private LocalDateTime dataHoraMovimentacao;

    @Column(name = "TEMPO_ESTACIONAMENTO_MINUTOS")
    private Long tempoEstacionamentoMinutos;

    @Column(name = "OBSERVACOES", length = 500)
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_PATIO_ID_PATIO", nullable = false)
    @ToString.Exclude
    private Patio patio;

    // Métodos de conveniência
    public boolean isEntrada() {
        return TipoMovimentacao.ENTRADA.equals(this.tipoMovimentacao);
    }

    public boolean isSaida() {
        return TipoMovimentacao.SAIDA.equals(this.tipoMovimentacao);
    }

    public enum TipoMovimentacao {
        ENTRADA, SAIDA
    }
}
