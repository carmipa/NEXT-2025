// main\java\br\com\fiap\mottu\model\relacionamento\VeiculoBox.java
package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Veiculo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_VEICULOBOX")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class VeiculoBox {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private VeiculoBoxId id;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("veiculoId")
    @JoinColumn(name = "TB_VEICULO_ID_VEICULO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Veiculo veiculo;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("boxId")
    @JoinColumn(name = "TB_BOX_ID_BOX", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Box box;

    public VeiculoBox(Veiculo veiculo, Box box) {
        this.veiculo = veiculo;
        this.box = box;
        this.id = new VeiculoBoxId(veiculo.getIdVeiculo(), box.getIdBox());
    }
}