package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_NOTIFICACAO")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_NOTIFICACAO")
    @SequenceGenerator(name = "SEQ_NOTIFICACAO", sequenceName = "SEQ_NOTIFICACAO", allocationSize = 1)
    @Column(name = "ID_NOTIFICACAO")
    private Long idNotificacao;
    
    @Column(name = "TITULO", nullable = false, length = 200)
    private String titulo;
    
    @Column(name = "MENSAGEM", nullable = false, length = 1000)
    private String mensagem;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO", nullable = false)
    private TipoNotificacao tipo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "PRIORIDADE", nullable = false)
    private PrioridadeNotificacao prioridade;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORIA", nullable = false)
    private CategoriaNotificacao categoria;
    
    @Column(name = "LIDA", nullable = false)
    @Builder.Default
    private Boolean lida = false;
    
    @Column(name = "DATA_HORA_CRIACAO", nullable = false)
    private LocalDateTime dataHoraCriacao;
    
    @Column(name = "DATA_HORA_LEITURA")
    private LocalDateTime dataHoraLeitura;
    
    @Column(name = "DADOS_EXTRAS", length = 2000)
    private String dadosExtras; // JSON para dados adicionais
    
    @Column(name = "URL_REDIRECIONAMENTO", length = 500)
    private String urlRedirecionamento; // URL para redirecionar quando clicar na notificação
    
    // Relacionamentos opcionais
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_PATIO_ID_PATIO")
    private Patio patio;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_BOX_ID_BOX")
    private Box box;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_VEICULO_ID_VEICULO")
    private Veiculo veiculo;
    
    public enum TipoNotificacao {
        INFO, WARNING, ERROR, SUCCESS
    }
    
    public enum PrioridadeNotificacao {
        BAIXA, MEDIA, ALTA, CRITICA
    }
    
    public enum CategoriaNotificacao {
        OCUPACAO, MOVIMENTACAO, SISTEMA, MANUTENCAO, SEGURANCA
    }
    
    @PrePersist
    protected void onCreate() {
        if (dataHoraCriacao == null) {
            dataHoraCriacao = LocalDateTime.now();
        }
    }
}