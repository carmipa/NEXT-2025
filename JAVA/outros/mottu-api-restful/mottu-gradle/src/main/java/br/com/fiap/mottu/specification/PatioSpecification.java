// Caminho do arquivo: br\com\fiap\mottu\specification\PatioSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.PatioFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatio;
import br.com.fiap.mottu.model.relacionamento.EnderecoPatio;
import br.com.fiap.mottu.model.relacionamento.ContatoPatio;
import br.com.fiap.mottu.model.Zona;
import br.com.fiap.mottu.model.Box;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PatioSpecification {

    public static Specification<Patio> withFilters(PatioFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.nomePatio() != null && !filter.nomePatio().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nomePatio")), "%" + filter.nomePatio().toLowerCase() + "%"));
            }
            if (filter.dataCadastroInicio() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataCadastro"), filter.dataCadastroInicio()));
            }
            if (filter.dataCadastroFim() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataCadastro"), filter.dataCadastroFim()));
            }
            if (filter.observacao() != null && !filter.observacao().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("observacao")), "%" + filter.observacao().toLowerCase() + "%"));
            }

            // Filtro por relacionamento ManyToMany (VeiculoPatio)
            if (filter.veiculoPlaca() != null && !filter.veiculoPlaca().isBlank()) {
                Join<Patio, VeiculoPatio> veiculoPatioJoin = root.join("veiculoPatios");
                predicates.add(cb.equal(veiculoPatioJoin.get("veiculo").get("placa"), filter.veiculoPlaca()));
            }

            // Filtro por relacionamento ManyToMany (EnderecoPatio)
            if (filter.enderecoCidade() != null && !filter.enderecoCidade().isBlank()) {
                Join<Patio, EnderecoPatio> enderecoPatioJoin = root.join("enderecoPatios");
                predicates.add(cb.like(cb.lower(enderecoPatioJoin.get("endereco").get("cidade")), "%" + filter.enderecoCidade().toLowerCase() + "%"));
            }

            // Filtro por relacionamento ManyToMany (ContatoPatio)
            if (filter.contatoEmail() != null && !filter.contatoEmail().isBlank()) {
                Join<Patio, ContatoPatio> contatoPatioJoin = root.join("contatoPatios");
                predicates.add(cb.like(cb.lower(contatoPatioJoin.get("contato").get("email")), "%" + filter.contatoEmail().toLowerCase() + "%"));
            }

            // Filtro por relacionamento OneToMany (Zona)
            if (filter.zonaNome() != null && !filter.zonaNome().isBlank()) {
                Join<Patio, Zona> zonaJoin = root.join("zonas");
                predicates.add(cb.like(cb.lower(zonaJoin.get("nome")), "%" + filter.zonaNome().toLowerCase() + "%"));
                query.distinct(true);
            }

            // Filtro por Box via Zona
            if (filter.boxNome() != null && !filter.boxNome().isBlank()) {
                Join<Patio, Zona> zonaJoin = root.join("zonas");
                Join<Zona, Box> boxJoin = zonaJoin.join("boxes");
                predicates.add(cb.like(cb.lower(boxJoin.get("nome")), "%" + filter.boxNome().toLowerCase() + "%"));
                query.distinct(true);
            }

            query.distinct(true); // Evitar duplicação de resultados

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}