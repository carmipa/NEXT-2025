// Caminho do arquivo: br\com\fiap\mottu\specification\ContatoSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.ContatoFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Contato;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ContatoSpecification {

    public static Specification<Contato> withFilters(ContatoFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.email() != null && !filter.email().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + filter.email().toLowerCase() + "%"));
            }
            if (filter.ddd() != null) {
                predicates.add(cb.equal(root.get("ddd"), filter.ddd()));
            }
            if (filter.ddi() != null) {
                predicates.add(cb.equal(root.get("ddi"), filter.ddi()));
            }
            if (filter.telefone1() != null && !filter.telefone1().isBlank()) {
                predicates.add(cb.like(root.get("telefone1"), "%" + filter.telefone1() + "%"));
            }
            if (filter.celular() != null && !filter.celular().isBlank()) {
                predicates.add(cb.like(root.get("celular"), "%" + filter.celular() + "%"));
            }
            if (filter.observacao() != null && !filter.observacao().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("observacao")), "%" + filter.observacao().toLowerCase() + "%"));
            }

            // Filtro por relacionamento OneToMany (Cliente)
            if (filter.clienteNome() != null && !filter.clienteNome().isBlank()) {
                Join<Contato, br.com.fiap.mottu.model.Cliente> clienteJoin = root.join("clienteContatos"); // Mapeia para o nome da coleção em Contato
                predicates.add(cb.like(cb.lower(clienteJoin.get("nome")), "%" + filter.clienteNome().toLowerCase() + "%"));
            }

            query.distinct(true); // Evitar duplicação de resultados

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}