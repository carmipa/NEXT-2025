// main\java\br\com\fiap\mottu\model\relacionamento\EnderecoPatio.java
package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Endereco;
import br.com.fiap.mottu.model.Patio;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_ENDERECIOPATIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EnderecoPatio {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private EnderecoPatioId id;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("enderecoId")
    @JoinColumn(name = "TB_ENDERECO_ID_ENDERECO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Endereco endereco;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("patioId")
    @JoinColumn(name = "TB_PATIO_ID_PATIO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Patio patio;

    public EnderecoPatio(Endereco endereco, Patio patio) {
        this.endereco = endereco;
        this.patio = patio;
        this.id = new EnderecoPatioId(endereco.getIdEndereco(), patio.getIdPatio());
    }
}