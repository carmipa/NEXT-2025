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

            // Filtro por veículo via relacionamento direto (Patio tem contato e endereco diretos)
            if (filter.veiculoPlaca() != null && !filter.veiculoPlaca().isBlank()) {
                Join<Patio, VeiculoPatio> veiculoPatioJoin = root.join("veiculoPatios");
                predicates.add(cb.equal(veiculoPatioJoin.get("veiculo").get("placa"), filter.veiculoPlaca()));
            }

            // Filtro por cidade do endereço (relacionamento direto)
            if (filter.enderecoCidade() != null && !filter.enderecoCidade().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("endereco").get("cidade")), "%" + filter.enderecoCidade().toLowerCase() + "%"));
            }

            // Filtro por email do contato (relacionamento direto)
            if (filter.contatoEmail() != null && !filter.contatoEmail().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("contato").get("email")), "%" + filter.contatoEmail().toLowerCase() + "%"));
            }

            // Filtro por relacionamento OneToMany (Zona)
            if (filter.zonaNome() != null && !filter.zonaNome().isBlank()) {
                Join<Patio, Zona> zonaJoin = root.join("zonas");
                predicates.add(cb.like(cb.lower(zonaJoin.get("nome")), "%" + filter.zonaNome().toLowerCase() + "%"));
            }

            // Filtro por Box via relação direta Patio -> Boxes
            if (filter.boxNome() != null && !filter.boxNome().isBlank()) {
                Join<Patio, Box> boxJoin = root.join("boxes");
                predicates.add(cb.like(cb.lower(boxJoin.get("nome")), "%" + filter.boxNome().toLowerCase() + "%"));
            }

            // Aplicar distinct apenas se houver joins que possam causar duplicação
            if (filter.zonaNome() != null || filter.boxNome() != null || filter.veiculoPlaca() != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}