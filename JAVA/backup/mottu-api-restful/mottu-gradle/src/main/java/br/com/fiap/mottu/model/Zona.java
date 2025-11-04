package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_ZONA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_zona")
    @SequenceGenerator(name = "seq_zona", sequenceName = "SEQ_TB_ZONA", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_ZONA")
    @EqualsAndHashCode.Include
    private Long idZona;

    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;

    @Column(name = "STATUS", nullable = false, length = 1)
    private String status;

    @Column(name = "OBSERVACAO", length = 100)
    private String observacao;

    // Relacionamento com Pátio (N:1) - chave composta (ID_PATIO, STATUS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "TB_PATIO_ID_PATIO", referencedColumnName = "ID_PATIO", nullable = false),
        @JoinColumn(name = "TB_PATIO_STATUS", referencedColumnName = "STATUS", nullable = false)
    })
    @ToString.Exclude
    private Patio patio;

    // Zona não tem relacionamento direto com Box neste modelo

    // Relacionamento com Veículos (N:N através de VeiculoZona)
    @OneToMany(mappedBy = "zona", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoZona> veiculoZonas = new HashSet<>();

}