// Caminho do arquivo: br\com\fiap\mottu\specification\BoxSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.BoxFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Box;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class BoxSpecification {

    public static Specification<Box> withFilters(BoxFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.nome() != null && !filter.nome().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nome")), "%" + filter.nome().toLowerCase() + "%"));
            }
            if (filter.status() != null && !filter.status().isBlank()) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (filter.dataEntradaInicio() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataEntrada"), filter.dataEntradaInicio()));
            }
            if (filter.dataEntradaFim() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataEntrada"), filter.dataEntradaFim()));
            }
            if (filter.dataSaidaInicio() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataSaida"), filter.dataSaidaInicio()));
            }
            if (filter.dataSaidaFim() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataSaida"), filter.dataSaidaFim()));
            }
            if (filter.observacao() != null && !filter.observacao().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("observacao")), "%" + filter.observacao().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}