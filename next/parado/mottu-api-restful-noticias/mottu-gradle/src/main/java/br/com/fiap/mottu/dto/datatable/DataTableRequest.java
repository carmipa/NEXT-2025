package br.com.fiap.mottu.dto.datatable;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request para DataTable")
public class DataTableRequest {

    @Schema(description = "Página atual (baseada em 0)", example = "0")
    private Integer draw;

    @Schema(description = "Índice do primeiro registro", example = "0")
    private Integer start;

    @Schema(description = "Número de registros por página", example = "10")
    private Integer length;

    @Schema(description = "Termo de busca global", example = "Mottu")
    private String searchValue;

    @Schema(description = "Se a busca é regex", example = "false")
    private Boolean searchRegex;

    @Schema(description = "Coluna de ordenação", example = "0")
    private Integer orderColumn;

    @Schema(description = "Direção da ordenação", example = "asc")
    private String orderDirection;

    @Schema(description = "Colunas da tabela")
    private List<DataTableColumn> columns;

    @Schema(description = "Parâmetros adicionais")
    private Map<String, Object> additionalParams;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Coluna do DataTable")
    public static class DataTableColumn {
        
        @Schema(description = "Nome da coluna", example = "nomePatio")
        private String data;

        @Schema(description = "Nome da coluna", example = "Nome do Pátio")
        private String name;

        @Schema(description = "Se a coluna é pesquisável", example = "true")
        private Boolean searchable;

        @Schema(description = "Se a coluna é ordenável", example = "true")
        private Boolean orderable;

        @Schema(description = "Valor de busca da coluna", example = "")
        private String searchValue;

        @Schema(description = "Se a busca da coluna é regex", example = "false")
        private Boolean searchRegex;
    }
}
