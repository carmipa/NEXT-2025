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
                // Busca acento-insensível usando TRANSLATE no Oracle
                jakarta.persistence.criteria.Path<String> nomePath = root.get("nome");
                jakarta.persistence.criteria.Expression<String> translatedField = cb.function(
                        "TRANSLATE",
                        String.class,
                        cb.lower(nomePath),
                        cb.literal("ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇçÑñ"),
                        cb.literal("AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn")
                );
                jakarta.persistence.criteria.Expression<String> translatedParam = cb.function(
                        "TRANSLATE",
                        String.class,
                        cb.literal("%" + filter.nome().toLowerCase() + "%"),
                        cb.literal("ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇçÑñ"),
                        cb.literal("AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn")
                );
                predicates.add(cb.like(translatedField, translatedParam));
            }
            if (filter.status() != null && !filter.status().isBlank()) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            // datas de Box são transient no modelo atual (script Oracle não possui essas colunas)
            if (filter.observacao() != null && !filter.observacao().isBlank()) {
                jakarta.persistence.criteria.Path<String> obsPath = root.get("observacao");
                jakarta.persistence.criteria.Expression<String> translatedField = cb.function(
                        "TRANSLATE",
                        String.class,
                        cb.lower(obsPath),
                        cb.literal("ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇçÑñ"),
                        cb.literal("AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn")
                );
                jakarta.persistence.criteria.Expression<String> translatedParam = cb.function(
                        "TRANSLATE",
                        String.class,
                        cb.literal("%" + filter.observacao().toLowerCase() + "%"),
                        cb.literal("ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇçÑñ"),
                        cb.literal("AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn")
                );
                predicates.add(cb.like(translatedField, translatedParam));
            }

            // filtro por pátio via FK direta
            if (filter.patioId() != null) {
                predicates.add(cb.equal(root.get("patio").get("idPatio"), filter.patioId()));
            }

            // filtro por nome do pátio (join direto Box -> Patio)
            if (filter.patioNome() != null && !filter.patioNome().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("patio").get("nomePatio")), "%" + filter.patioNome().toLowerCase() + "%"));
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