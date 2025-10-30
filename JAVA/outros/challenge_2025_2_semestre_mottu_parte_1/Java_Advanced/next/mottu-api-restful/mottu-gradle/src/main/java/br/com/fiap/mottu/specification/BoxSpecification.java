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
            // datas de Box são transient no modelo atual (script Oracle não possui essas colunas)
            if (filter.observacao() != null && !filter.observacao().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("observacao")), "%" + filter.observacao().toLowerCase() + "%"));
            }

            // filtro por pátio via FK direta
            if (filter.patioId() != null) {
                predicates.add(cb.equal(root.get("patio").get("idPatio"), filter.patioId()));
            }

            // filtro por zona - Box não tem zona diretamente, apenas via pátio
            // Se precisar filtrar por zona, seria necessário fazer join com zona através do pátio
            if (filter.zonaId() != null) {
                // Box não tem relação direta com zona, apenas com pátio
                // Este filtro não pode ser aplicado diretamente
                // predicates.add(cb.equal(root.get("zona").get("idZona"), filter.zonaId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}