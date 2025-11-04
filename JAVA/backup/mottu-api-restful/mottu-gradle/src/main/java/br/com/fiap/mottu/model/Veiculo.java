package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import br.com.fiap.mottu.model.relacionamento.*;

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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_veiculo")
    @SequenceGenerator(name = "seq_veiculo", sequenceName = "SEQ_TB_VEICULO", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_VEICULO")
    @EqualsAndHashCode.Include
    private Long idVeiculo;

    @Column(name = "PLACA", nullable = false, unique = true, length = 10)
    private String placa;

    @Column(name = "RENAVAM", nullable = false, unique = true, length = 11)
    private String renavam;

    @Column(name = "CHASSI", nullable = false, unique = true, length = 17)
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

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;

    @Column(name = "STATUS_OPERACIONAL", length = 20)
    private String statusOperacional;

    @Column(name = "TAG_BLE_ID", unique = true, length = 50)
    private String tagBleId;

    // Relacionamentos inversos
    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<ClienteVeiculo> clienteVeiculos = new HashSet<>();

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<VeiculoBox> veiculoBoxes = new HashSet<>();

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<VeiculoPatio> veiculoPatios = new HashSet<>();

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<VeiculoRastreamento> veiculoRastreamentos = new HashSet<>();

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<VeiculoZona> veiculoZonas = new HashSet<>();
}
