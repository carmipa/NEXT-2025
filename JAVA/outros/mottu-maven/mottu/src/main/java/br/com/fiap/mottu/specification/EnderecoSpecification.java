// Caminho do arquivo: br\com\fiap\mottu\specification\EnderecoSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.EnderecoFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Endereco;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class EnderecoSpecification {

    public static Specification<Endereco> withFilters(EnderecoFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.cep() != null && !filter.cep().isBlank()) {
                predicates.add(cb.equal(root.get("cep"), filter.cep()));
            }
            if (filter.numero() != null) {
                predicates.add(cb.equal(root.get("numero"), filter.numero()));
            }
            if (filter.logradouro() != null && !filter.logradouro().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("logradouro")), "%" + filter.logradouro().toLowerCase() + "%"));
            }
            if (filter.bairro() != null && !filter.bairro().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("bairro")), "%" + filter.bairro().toLowerCase() + "%"));
            }
            if (filter.cidade() != null && !filter.cidade().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("cidade")), "%" + filter.cidade().toLowerCase() + "%"));
            }
            if (filter.estado() != null && !filter.estado().isBlank()) {
                predicates.add(cb.equal(root.get("estado"), filter.estado()));
            }
            if (filter.pais() != null && !filter.pais().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("pais")), "%" + filter.pais().toLowerCase() + "%"));
            }
            if (filter.observacao() != null && !filter.observacao().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("observacao")), "%" + filter.observacao().toLowerCase() + "%"));
            }

            // Filtro por relacionamento OneToMany (Cliente)
            if (filter.clienteNome() != null && !filter.clienteNome().isBlank()) {
                Join<Endereco, br.com.fiap.mottu.model.Cliente> clienteJoin = root.join("clienteEnderecos"); // Mapeia para o nome da coleção em Endereco
                predicates.add(cb.like(cb.lower(clienteJoin.get("nome")), "%" + filter.clienteNome().toLowerCase() + "%"));
            }

            query.distinct(true); // Evitar duplicação de resultados

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}