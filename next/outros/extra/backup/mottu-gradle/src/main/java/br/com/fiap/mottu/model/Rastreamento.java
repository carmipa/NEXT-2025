package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_RASTREAMENTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"veiculoRastreamentos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Rastreamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_RASTREAMENTO")
    @EqualsAndHashCode.Include
    private Long idRastreamento;

    @Column(name = "IPS_X", nullable = false, precision = 7, scale = 3)
    private BigDecimal ipsX;

    @Column(name = "IPS_Y", nullable = false, precision = 7, scale = 3)
    private BigDecimal ipsY;

    @Column(name = "IPS_Z", nullable = false, precision = 7, scale = 3)
    private BigDecimal ipsZ;

    @Column(name = "GPRS_LATITUDE", nullable = false, precision = 11, scale = 6)
    private BigDecimal gprsLatitude;

    @Column(name = "GPRS_LONGITUDE", nullable = false, precision = 11, scale = 6)
    private BigDecimal gprsLongitude;

    @Column(name = "GPRS_ALTITUDE", nullable = false, precision = 7, scale = 2)
    private BigDecimal gprsAltitude;

    @CreationTimestamp
    @Column(name = "DATA_HORA_REGISTRO", nullable = false, updatable = false)
    private LocalDateTime dataHoraRegistro;

    @OneToMany(mappedBy = "rastreamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento> veiculoRastreamentos = new HashSet<>();
}
