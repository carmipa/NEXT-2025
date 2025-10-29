// Caminho do arquivo: br\com\fiap\mottu\model\relacionamento\VeiculoZonaId.java
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
public class VeiculoZonaId implements Serializable {

    @Column(name = "TB_VEICULO_ID_VEICULO", nullable = false)
    private Long veiculoId;

    @Column(name = "TB_ZONA_ID_ZONA", nullable = false)
    private Long zonaId;
}