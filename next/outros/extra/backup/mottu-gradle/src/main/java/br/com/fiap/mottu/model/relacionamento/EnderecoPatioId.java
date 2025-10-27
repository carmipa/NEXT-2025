// Caminho do arquivo: br\com\fiap\mottu\model\relacionamento\EnderecoPatioId.java
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
public class EnderecoPatioId implements Serializable {

    @Column(name = "TB_ENDERECO_ID_ENDERECO", nullable = false)
    private Long enderecoId;

    @Column(name = "TB_PATIO_ID_PATIO", nullable = false)
    private Long patioId;
}