// Caminho do arquivo: br\com\fiap\mottu\model\relacionamento\VeiculoBoxId.java
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
public class VeiculoBoxId implements Serializable {

    @Column(name = "TB_VEICULO_ID_VEICULO", nullable = false)
    private Long veiculoId;

    @Column(name = "TB_BOX_ID_BOX", nullable = false)
    private Long boxId;
}