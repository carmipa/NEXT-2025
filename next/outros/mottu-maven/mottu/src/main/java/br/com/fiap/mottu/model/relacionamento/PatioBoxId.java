package br.com.fiap.mottu.model.relacionamento;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode // Essencial para PKs compostas
public class PatioBoxId implements Serializable {

    @Column(name = "TB_PATIO_ID_PATIO", nullable = false)
    private Long patioId;

    @Column(name = "TB_BOX_ID_BOX", nullable = false)
    private Long boxId;
}