// main\java\br\com\fiap\mottu\model\relacionamento\ContatoPatio.java
package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Contato;
import br.com.fiap.mottu.model.Patio;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_CONTATOPATIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ContatoPatio {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private ContatoPatioId id;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("patioId")
    @JoinColumn(name = "TB_PATIO_ID_PATIO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Patio patio;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("contatoId")
    @JoinColumn(name = "TB_CONTATO_ID_CONTATO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Contato contato;

    public ContatoPatio(Patio patio, Contato contato) {
        this.patio = patio;
        this.contato = contato;
        this.id = new ContatoPatioId(patio.getIdPatio(), contato.getIdContato());
    }
}