// main\java\br\com\fiap\mottu\model\Veiculo.java
package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_VEICULO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_VEICULO")
    @EqualsAndHashCode.Include
    private Long idVeiculo;
    @Column(name = "PLACA", nullable = false, unique = true, length = 10)
    private String placa;
    @Column(name = "RENAVAM", nullable = false, unique = true, length = 11) // Linha a ser restaurada para este estado
    private String renavam;
    @Column(name = "CHASSI", nullable = false, unique = true, length = 17) // Linha a ser restaurada para este estado
    private String chassi;
    @Column(name = "FABRICANTE", nullable = false, length = 50)
    private String fabricante;
    @Column(name = "MODELO", nullable = false, length = 60)
    private String modelo;
    @Column(name = "MOTOR", length = 30)
    private String motor;
    @Column(name = "ANO", nullable = false)
    private Integer ano;
    @Column(name = "COMBUSTIVEL", nullable = false, length = 20)
    private String combustivel;
    // Relacionamentos inversos
    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ClienteVeiculo> clienteVeiculos = new HashSet<>();
    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoBox> veiculoBoxes = new HashSet<>();
    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoPatio> veiculoPatios = new HashSet<>();
    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento> veiculoRastreamentos = new HashSet<>();
    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoZona> veiculoZonas = new HashSet<>();
}