package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Box;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_PATIOBOX")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // NOVO: Adicione esta anotação para que Lombok gere um construtor com todos os campos.
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PatioBox {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private PatioBoxId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("patioId") // Mapeia o campo 'patioId' da chave composta
    @JoinColumn(name = "TB_PATIO_ID_PATIO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude
    private Patio patio;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("boxId") // Mapeia o campo 'boxId' da chave composta
    @JoinColumn(name = "TB_BOX_ID_BOX", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude
    private Box box;

    // Construtor para facilitar a criação da associação (este construtor é mantido, Lombok gerará o @AllArgsConstructor também)
    public PatioBox(Patio patio, Box box) {
        this.patio = patio;
        this.box = box;
        // Garanta que getIdBox() existe na sua classe Box ou use o nome correto do getter do ID do Box
        this.id = new PatioBoxId(patio.getIdPatio(), box.getIdBox());
    }
}