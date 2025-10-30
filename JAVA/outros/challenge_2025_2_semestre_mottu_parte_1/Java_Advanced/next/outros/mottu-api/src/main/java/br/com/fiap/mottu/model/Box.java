package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_BOX")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido 'exclude = {...}'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Box {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_BOX")
    @EqualsAndHashCode.Include
    private Long idBox;

    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;

    @Column(name = "STATUS", nullable = false, length = 1)
    private String status;

    @Column(name = "DATA_ENTRADA", nullable = false)
    private LocalDate dataEntrada;

    @Column(name = "DATA_SAIDA", nullable = false)
    private LocalDate dataSaida;

    @Column(name = "OBSERVACAO", length = 100)
    private String observacao;

    // Relacionamentos inversos para tabelas de junção
    @OneToMany(mappedBy = "box", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoBox> veiculoBoxes = new HashSet<>();

    @OneToMany(mappedBy = "box", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ZonaBox> zonaBoxes = new HashSet<>();

    // Relacionamento inverso para PatioBox
    @OneToMany(mappedBy = "box", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.PatioBox> patioBoxes = new HashSet<>();
}