// Caminho do arquivo: br\com\fiap\mottu\dto\box\BoxResponseDto.java
package br.com.fiap.mottu.dto.box;

import lombok.Value;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link br.com.fiap.mottu.model.Box}
 */
@Value
public class BoxResponseDto implements Serializable {
    Long idBox;
    String nome;
    String status;
    LocalDate dataEntrada;
    LocalDate dataSaida;
    String observacao;
}