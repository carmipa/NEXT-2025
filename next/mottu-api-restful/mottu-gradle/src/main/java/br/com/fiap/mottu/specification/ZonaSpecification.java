// Caminho do arquivo: br\com\fiap\mottu\specification\ZonaSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.ZonaFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Zona;
import br.com.fiap.mottu.model.Box;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ZonaSpecification {

    public static Specification<Zona> withFilters(ZonaFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.nome() != null && !filter.nome().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nome")), "%" + filter.nome().toLowerCase() + "%"));
            }
            if (filter.status() != null && !filter.status().isBlank()) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (filter.observacao() != null && !filter.observacao().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("observacao")), "%" + filter.observacao().toLowerCase() + "%"));
            }

            // Filtro por relacionamento OneToMany (Boxes da Zona)
            if (filter.boxNome() != null && !filter.boxNome().isBlank()) {
                Join<Zona, Box> boxJoin = root.join("boxes");
                predicates.add(cb.like(cb.lower(boxJoin.get("nome")), "%" + filter.boxNome().toLowerCase() + "%"));
                query.distinct(true);
            }

            // Filtro por pátio via FK da própria Zona
            if (filter.patioId() != null) {
                predicates.add(cb.equal(root.get("patio").get("idPatio"), filter.patioId()));
            }

            query.distinct(true); // Evitar duplicação de resultados

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}