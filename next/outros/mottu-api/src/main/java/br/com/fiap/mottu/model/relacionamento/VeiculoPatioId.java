// Caminho do arquivo: br\com\fiap\mottu\model\relacionamento\VeiculoPatioId.java
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
public class VeiculoPatioId implements Serializable {

    @Column(name = "TB_VEICULO_ID_VEICULO", nullable = false)
    private Long veiculoId;

    @Column(name = "TB_PATIO_ID_PATIO", nullable = false)
    private Long patioId;
}