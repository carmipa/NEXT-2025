package br.com.fiap.mottu.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Utilitários para paginação
 */
public class PageableUtil {

    /**
     * Cria Pageable a partir de parâmetros do DataTable
     */
    public static Pageable createPageable(Integer start, Integer length, String sortColumn, String sortDirection) {
        int page = start != null ? start / (length != null ? length : 10) : 0;
        int size = length != null ? length : 10;
        
        Sort sort = Sort.unsorted();
        if (StringUtils.hasText(sortColumn) && StringUtils.hasText(sortDirection)) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            sort = Sort.by(direction, sortColumn);
        }
        
        return PageRequest.of(page, size, sort);
    }

    /**
     * Cria Pageable com ordenação padrão
     */
    public static Pageable createPageable(Integer start, Integer length) {
        return createPageable(start, length, null, null);
    }

    /**
     * Cria Pageable com ordenação por data decrescente
     */
    public static Pageable createPageableWithDefaultSort(Integer start, Integer length, String dateColumn) {
        return createPageable(start, length, dateColumn, "desc");
    }

    /**
     * Cria múltiplas ordenações
     */
    public static Pageable createPageableWithMultipleSort(Integer start, Integer length, List<SortOrder> sortOrders) {
        int page = start != null ? start / (length != null ? length : 10) : 0;
        int size = length != null ? length : 10;
        
        if (sortOrders == null || sortOrders.isEmpty()) {
            return PageRequest.of(page, size);
        }
        
        List<Sort.Order> orders = new ArrayList<>();
        for (SortOrder sortOrder : sortOrders) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder.getDirection()) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            orders.add(new Sort.Order(direction, sortOrder.getProperty()));
        }
        
        return PageRequest.of(page, size, Sort.by(orders));
    }

    /**
     * Classe para ordenação múltipla
     */
    public static class SortOrder {
        private String property;
        private String direction;

        public SortOrder(String property, String direction) {
            this.property = property;
            this.direction = direction;
        }

        public String getProperty() {
            return property;
        }

        public void setProperty(String property) {
            this.property = property;
        }

        public String getDirection() {
            return direction;
        }

        public void setDirection(String direction) {
            this.direction = direction;
        }
    }
}
