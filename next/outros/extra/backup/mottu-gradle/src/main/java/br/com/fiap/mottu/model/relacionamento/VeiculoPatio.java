// main\java\br\com\fiap\mottu\model\relacionamento\VeiculoPatio.java
package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_VEICULOPATIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class VeiculoPatio {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private VeiculoPatioId id;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("veiculoId")
    @JoinColumn(name = "TB_VEICULO_ID_VEICULO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Veiculo veiculo;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("patioId")
    @JoinColumn(name = "TB_PATIO_ID_PATIO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Patio patio;

    public VeiculoPatio(Veiculo veiculo, Patio patio) {
        this.veiculo = veiculo;
        this.patio = patio;
        this.id = new VeiculoPatioId(veiculo.getIdVeiculo(), patio.getIdPatio());
    }
}