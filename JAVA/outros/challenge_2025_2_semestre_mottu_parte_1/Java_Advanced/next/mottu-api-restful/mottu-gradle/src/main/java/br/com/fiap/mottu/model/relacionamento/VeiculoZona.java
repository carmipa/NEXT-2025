// main\java\br\com\fiap\mottu\model\relacionamento\VeiculoZona.java
package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.model.Zona;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_VEICULOZONA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class VeiculoZona {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private VeiculoZonaId id;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("veiculoId")
    @JoinColumn(name = "TB_VEICULO_ID_VEICULO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Veiculo veiculo;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("zonaId")
    @JoinColumn(name = "TB_ZONA_ID_ZONA", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Zona zona;

    public VeiculoZona(Veiculo veiculo, Zona zona) {
        this.veiculo = veiculo;
        this.zona = zona;
        this.id = new VeiculoZonaId(veiculo.getIdVeiculo(), zona.getIdZona());
    }
}