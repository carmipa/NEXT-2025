// Caminho: src/main/java/br/com/fiap/mottu/model/Box.java
package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_BOX")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class Box {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_box")
    @SequenceGenerator(name = "seq_box", sequenceName = "SEQ_TB_BOX", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_BOX")
    @EqualsAndHashCode.Include
    private Long idBox;

    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;

    @Column(name = "STATUS", nullable = false, length = 1)
    private String status;

    @Column(name = "OBSERVACAO", length = 100)
    private String observacao;

    @Column(name = "DATA_ENTRADA")
    private LocalDateTime dataEntrada;

    @Column(name = "DATA_SAIDA")
    private LocalDateTime dataSaida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_PATIO_ID_PATIO", referencedColumnName = "ID_PATIO", nullable = false)
    @ToString.Exclude
    private Patio patio;

    @OneToMany(mappedBy = "box", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoBox> veiculoBoxes = new HashSet<>();

    // ================== INÍCIO DA CORREÇÃO ==================
    // Métodos de conveniência que centralizam a lógica de negócio do Box.

    /**
     * Verifica se o box está ocupado.
     * Padronizado para usar o status 'O'.
     */
    public boolean isOcupado() {
        return "O".equalsIgnoreCase(this.status);
    }

    /**
     * Verifica se o box está disponível (livre).
     * Padronizado para usar o status 'L'.
     */
    public boolean isDisponivel() {
        return "L".equalsIgnoreCase(this.status);
    }

    /**
     * Modifica o estado do Box para OCUPADO.
     * Define a data de entrada e limpa a data de saída.
     */
    public void ocupar() {
        this.dataEntrada = LocalDateTime.now();
        this.dataSaida = null; // Um box ocupado não tem data de saída
        this.status = "O";     // 'O' de Ocupado
    }

    /**
     * Modifica o estado do Box para LIVRE.
     * Define a data de saída.
     */
    public void liberar() {
        this.dataSaida = LocalDateTime.now();
        this.status = "L";     // 'L' de Livre
    }
    // =================== FIM DA CORREÇÃO ====================
}