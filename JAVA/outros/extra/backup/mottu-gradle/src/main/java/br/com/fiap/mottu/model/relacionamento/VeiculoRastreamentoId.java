// Caminho do arquivo: br\com\fiap\mottu\model\relacionamento\VeiculoRastreamentoId.java
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
public class VeiculoRastreamentoId implements Serializable {

    @Column(name = "TB_VEICULO_ID_VEICULO", nullable = false)
    private Long veiculoId;

    @Column(name = "TB_RASTREAMENTO_ID_RASTREAMENTO", nullable = false)
    private Long rastreamentoId;
}