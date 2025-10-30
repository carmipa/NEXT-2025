// Caminho do arquivo: br\com\fiap\mottu\dto\box\BoxResponseDto.java
package br.com.fiap.mottu.dto.box;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link br.com.fiap.mottu.model.Box}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoxResponseDto implements Serializable {
    private Long idBox;
    private String nome;
    private String status;
    private LocalDateTime dataEntrada;
    private LocalDateTime dataSaida;
    private String observacao;
    private Long patioId;
    private String patioStatus;
    private PatioInfo patio;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatioInfo implements Serializable {
        private Long idPatio;
        private String nomePatio;
    }
}