// Caminho do arquivo: br\com\fiap\mottu\model\relacionamento\ZonaBoxId.java
package br.com.fiap.mottu.model.relacionamento;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ZonaBoxId implements Serializable {

    @Column(name = "TB_ZONA_ID_ZONA", nullable = false)
    private Long zonaId;

    @Column(name = "TB_BOX_ID_BOX", nullable = false)
    private Long boxId;
}