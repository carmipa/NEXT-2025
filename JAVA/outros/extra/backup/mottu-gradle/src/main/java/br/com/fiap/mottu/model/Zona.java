// main\java\br\com\fiap\mottu\model\Zona.java
package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_ZONA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ZONA")
    @EqualsAndHashCode.Include
    private Long idZona;
    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;
    @Column(name = "DATA_ENTRADA", nullable = false)
    private LocalDate dataEntrada;
    @Column(name = "DATA_SAIDA", nullable = false)
    private LocalDate dataSaida;
    @Column(name = "OBSERVACAO", length = 100)
    private String observacao;

    @OneToMany(mappedBy = "zona", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // MANTER esta anotação no campo
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoZona> veiculoZonas = new HashSet<>();
    @OneToMany(mappedBy = "zona", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // MANTER esta anotação no campo
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ZonaBox> zonaBoxes = new HashSet<>();
    @OneToMany(mappedBy = "zona", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // MANTER esta anotação no campo
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ZonaPatio> zonaPatios = new HashSet<>();
}