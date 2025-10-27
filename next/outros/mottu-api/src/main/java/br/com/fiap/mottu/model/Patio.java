package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_PATIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido 'exclude = {...}'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Patio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PATIO")
    @EqualsAndHashCode.Include
    private Long idPatio;

    @Column(name = "NOME_PATIO", nullable = false, length = 50)
    private String nomePatio;

    @Column(name = "DATA_ENTRADA", nullable = false)
    private LocalDate dataEntrada;

    @Column(name = "DATA_SAIDA", nullable = false)
    private LocalDate dataSaida;

    @Column(name = "OBSERVACAO", length = 100)
    private String observacao;

    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ContatoPatio> contatoPatios = new HashSet<>();

    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.EnderecoPatio> enderecoPatios = new HashSet<>();

    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoPatio> veiculoPatios = new HashSet<>();

    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ZonaPatio> zonaPatios = new HashSet<>();

    // Relacionamento inverso para PatioBox
    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Esta anotação já exclui o campo do toString
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.PatioBox> patioBoxes = new HashSet<>();
}