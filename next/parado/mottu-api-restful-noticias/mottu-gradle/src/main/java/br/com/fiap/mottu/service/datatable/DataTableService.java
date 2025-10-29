package br.com.fiap.mottu.service.datatable;

import br.com.fiap.mottu.dto.datatable.DataTableRequest;
import br.com.fiap.mottu.dto.datatable.DataTableResponse;
import br.com.fiap.mottu.util.PageableUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;

/**
 * Serviço base para DataTable
 */
@Service
public class DataTableService {

    /**
     * Processa request do DataTable e retorna response paginada
     */
    public <T, R> DataTableResponse<R> processDataTableRequest(
            DataTableRequest request,
            JpaRepository<T, Long> repository,
            JpaSpecificationExecutor<T> specificationExecutor,
            Specification<T> specification,
            Function<T, R> mapper) {

        try {
            // Criar Pageable
            Pageable pageable = PageableUtil.createPageable(
                request.getStart(),
                request.getLength(),
                getSortColumn(request),
                getSortDirection(request)
            );

            // Buscar dados paginados
            Page<T> page = specificationExecutor.findAll(specification, pageable);

            // Mapear dados
            List<R> data = page.getContent().stream()
                    .map(mapper)
                    .toList();

            // Retornar response
            return DataTableResponse.success(
                request.getDraw(),
                page.getTotalElements(),
                page.getTotalElements(),
                data
            );

        } catch (Exception e) {
            return DataTableResponse.error(
                request.getDraw(),
                "Erro ao processar dados: " + e.getMessage()
            );
        }
    }

    /**
     * Processa request do DataTable sem specification
     */
    public <T, R> DataTableResponse<R> processDataTableRequest(
            DataTableRequest request,
            JpaRepository<T, Long> repository,
            Function<T, R> mapper) {

        try {
            // Criar Pageable
            Pageable pageable = PageableUtil.createPageable(
                request.getStart(),
                request.getLength(),
                getSortColumn(request),
                getSortDirection(request)
            );

            // Buscar dados paginados
            Page<T> page = repository.findAll(pageable);

            // Mapear dados
            List<R> data = page.getContent().stream()
                    .map(mapper)
                    .toList();

            // Retornar response
            return DataTableResponse.success(
                request.getDraw(),
                page.getTotalElements(),
                page.getTotalElements(),
                data
            );

        } catch (Exception e) {
            return DataTableResponse.error(
                request.getDraw(),
                "Erro ao processar dados: " + e.getMessage()
            );
        }
    }

    /**
     * Obtém coluna de ordenação do request
     */
    private String getSortColumn(DataTableRequest request) {
        if (request.getColumns() != null && 
            request.getOrderColumn() != null && 
            request.getOrderColumn() < request.getColumns().size()) {
            return request.getColumns().get(request.getOrderColumn()).getData();
        }
        return null;
    }

    /**
     * Obtém direção de ordenação do request
     */
    private String getSortDirection(DataTableRequest request) {
        return request.getOrderDirection() != null ? request.getOrderDirection() : "asc";
    }
}
