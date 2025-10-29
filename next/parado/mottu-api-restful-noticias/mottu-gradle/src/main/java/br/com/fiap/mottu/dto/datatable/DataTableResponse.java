package br.com.fiap.mottu.dto.datatable;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response para DataTable")
public class DataTableResponse<T> {

    @Schema(description = "Número do draw (echo do request)", example = "1")
    private Integer draw;

    @Schema(description = "Total de registros (sem filtros)", example = "100")
    private Long recordsTotal;

    @Schema(description = "Total de registros (com filtros)", example = "50")
    private Long recordsFiltered;

    @Schema(description = "Dados da tabela")
    private List<T> data;

    @Schema(description = "Mensagem de erro (se houver)")
    private String error;

    @Schema(description = "Tempo de processamento em ms", example = "150")
    private Long processingTime;

    /**
     * Cria uma resposta de sucesso
     */
    public static <T> DataTableResponse<T> success(Integer draw, Long recordsTotal, Long recordsFiltered, List<T> data) {
        return DataTableResponse.<T>builder()
                .draw(draw)
                .recordsTotal(recordsTotal)
                .recordsFiltered(recordsFiltered)
                .data(data)
                .build();
    }

    /**
     * Cria uma resposta de erro
     */
    public static <T> DataTableResponse<T> error(Integer draw, String errorMessage) {
        return DataTableResponse.<T>builder()
                .draw(draw)
                .recordsTotal(0L)
                .recordsFiltered(0L)
                .data(List.of())
                .error(errorMessage)
                .build();
    }
}
