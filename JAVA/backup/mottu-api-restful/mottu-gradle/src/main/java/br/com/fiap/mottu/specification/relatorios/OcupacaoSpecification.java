package br.com.fiap.mottu.specification.relatorios;

import br.com.fiap.mottu.filter.relatorios.OcupacaoFilter;
import br.com.fiap.mottu.model.Patio;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;


/**
 * Specification para filtros de ocupação
 */
public class OcupacaoSpecification {

    /**
     * Cria specification baseada no filtro de ocupação
     */
    public static Specification<Patio> withOcupacaoFilter(OcupacaoFilter filter) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (filter == null) {
                return predicate;
            }

            // Filtro por ID do pátio
            if (filter.getPatioId() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("idPatio"), filter.getPatioId()));
            }

            // Filtro por nome do pátio
            if (StringUtils.hasText(filter.getNomePatio())) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("nomePatio")),
                        "%" + filter.getNomePatio().toLowerCase() + "%"));
            }

            // Filtro por status do pátio
            if (StringUtils.hasText(filter.getStatusPatio())) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("status"), filter.getStatusPatio()));
            }

            // Filtro por data de cadastro
            if (filter.getDataInicio() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.greaterThanOrEqualTo(root.get("dataCadastro"), filter.getDataInicio()));
            }

            if (filter.getDataFim() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.lessThanOrEqualTo(root.get("dataCadastro"), filter.getDataFim()));
            }

            // Filtro por data/hora de cadastro
            if (filter.getDataHoraInicio() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.greaterThanOrEqualTo(root.get("dataCadastro"), filter.getDataHoraInicio().toLocalDate()));
            }

            if (filter.getDataHoraFim() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.lessThanOrEqualTo(root.get("dataCadastro"), filter.getDataHoraFim().toLocalDate()));
            }

            return predicate;
        };
    }

    /**
     * Cria specification para ordenação
     */
    public static Specification<Patio> withOrdering(OcupacaoFilter filter) {
        return (root, query, criteriaBuilder) -> {
            if (filter != null && StringUtils.hasText(filter.getOrdenacao()) && query != null) {
                String direcao = StringUtils.hasText(filter.getDirecaoOrdenacao()) 
                    ? filter.getDirecaoOrdenacao().toUpperCase() : "ASC";
                
                Path<?> orderPath = root.get(filter.getOrdenacao());
                
                if ("DESC".equals(direcao)) {
                    query.orderBy(criteriaBuilder.desc(orderPath));
                } else {
                    query.orderBy(criteriaBuilder.asc(orderPath));
                }
            }
            
            return criteriaBuilder.conjunction();
        };
    }
}
