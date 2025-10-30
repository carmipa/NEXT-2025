// Caminho do arquivo: br\com\fiap\mottu\dto\zona\ZonaResponseDto.java
package br.com.fiap.mottu.dto.zona;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link br.com.fiap.mottu.model.Zona}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZonaResponseDto implements Serializable {
    private Long idZona;
    private String nome;
    private String status;
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