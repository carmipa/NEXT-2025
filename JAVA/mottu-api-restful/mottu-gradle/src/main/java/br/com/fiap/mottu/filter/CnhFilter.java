package br.com.fiap.mottu.filter;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

/**
 * Filtro para busca de CNHs com suporte a DataTable e Pageable
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CnhFilter {

    // Filtros básicos
    private String numeroRegistro;
    private String categoria;
    private Long clienteId;
    private String clienteNome;
    private String clienteCpf;

    // Filtros de data
    private LocalDate dataEmissaoInicio;
    private LocalDate dataEmissaoFim;
    private LocalDate dataValidadeInicio;
    private LocalDate dataValidadeFim;

    // Filtros de status
    private Boolean vencida;
    private Boolean proximaVencimento;
    private Boolean permiteMotos;
    private Boolean permiteCarros;

    // Filtros de DataTable
    private String search; // Busca global
    private Integer start; // Índice inicial
    private Integer length; // Quantidade de registros
    private String orderColumn; // Coluna para ordenação
    private String orderDirection; // Direção da ordenação (asc/desc)

    // Filtros de paginação
    private Integer page;
    private Integer size;
    private String sort;

    /**
     * Verifica se há filtros de busca aplicados
     * @return true se há filtros, false caso contrário
     */
    public boolean hasFilters() {
        return numeroRegistro != null || categoria != null || clienteId != null ||
               clienteNome != null || clienteCpf != null ||
               dataEmissaoInicio != null || dataEmissaoFim != null ||
               dataValidadeInicio != null || dataValidadeFim != null ||
               vencida != null || proximaVencimento != null ||
               permiteMotos != null || permiteCarros != null ||
               (search != null && !search.trim().isEmpty());
    }

    /**
     * Verifica se há filtros de data de emissão
     * @return true se há filtros de data de emissão
     */
    public boolean hasDataEmissaoFilter() {
        return dataEmissaoInicio != null || dataEmissaoFim != null;
    }

    /**
     * Verifica se há filtros de data de validade
     * @return true se há filtros de data de validade
     */
    public boolean hasDataValidadeFilter() {
        return dataValidadeInicio != null || dataValidadeFim != null;
    }

    /**
     * Verifica se há filtros de cliente
     * @return true se há filtros de cliente
     */
    public boolean hasClienteFilter() {
        return clienteId != null || clienteNome != null || clienteCpf != null;
    }

    /**
     * Verifica se há filtros de status
     * @return true se há filtros de status
     */
    public boolean hasStatusFilter() {
        return vencida != null || proximaVencimento != null ||
               permiteMotos != null || permiteCarros != null;
    }

    /**
     * Verifica se é uma busca global (DataTable)
     * @return true se é busca global
     */
    public boolean isGlobalSearch() {
        return search != null && !search.trim().isEmpty();
    }

    /**
     * Verifica se é uma busca paginada
     * @return true se é busca paginada
     */
    public boolean isPaginated() {
        return page != null && size != null;
    }

    /**
     * Verifica se é uma busca DataTable
     * @return true se é busca DataTable
     */
    public boolean isDataTable() {
        return start != null && length != null;
    }

    /**
     * Obtém o termo de busca limpo (sem espaços)
     * @return termo de busca limpo
     */
    public String getCleanSearch() {
        return search != null ? search.trim() : null;
    }

    /**
     * Obtém o número de registro limpo (sem espaços)
     * @return número de registro limpo
     */
    public String getCleanNumeroRegistro() {
        return numeroRegistro != null ? numeroRegistro.trim() : null;
    }

    /**
     * Obtém a categoria limpa (sem espaços e em maiúsculo)
     * @return categoria limpa
     */
    public String getCleanCategoria() {
        return categoria != null ? categoria.trim().toUpperCase() : null;
    }

    /**
     * Obtém o nome do cliente limpo (sem espaços)
     * @return nome do cliente limpo
     */
    public String getCleanClienteNome() {
        return clienteNome != null ? clienteNome.trim() : null;
    }

    /**
     * Obtém o CPF do cliente limpo (apenas números)
     * @return CPF do cliente limpo
     */
    public String getCleanClienteCpf() {
        return clienteCpf != null ? clienteCpf.replaceAll("[^0-9]", "") : null;
    }
}




