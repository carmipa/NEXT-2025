// main\java\br\com\fiap\mottu\model\relacionamento\ZonaPatio.java
package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Zona;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_ZONAPATIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ZonaPatio {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private ZonaPatioId id;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("patioId")
    @JoinColumn(name = "TB_PATIO_ID_PATIO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Patio patio;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("zonaId")
    @JoinColumn(name = "TB_ZONA_ID_ZONA", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Zona zona;

    public ZonaPatio(Patio patio, Zona zona) {
        this.patio = patio;
        this.zona = zona;
        this.id = new ZonaPatioId(patio.getIdPatio(), zona.getIdZona());
    }
}