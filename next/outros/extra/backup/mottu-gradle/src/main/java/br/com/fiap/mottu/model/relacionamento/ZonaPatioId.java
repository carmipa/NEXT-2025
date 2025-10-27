// Caminho do arquivo: br\com\fiap\mottu\model\relacionamento\ZonaPatioId.java
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
public class ZonaPatioId implements Serializable {

    @Column(name = "TB_PATIO_ID_PATIO", nullable = false)
    private Long patioId;

    @Column(name = "TB_ZONA_ID_ZONA", nullable = false)
    private Long zonaId;
}