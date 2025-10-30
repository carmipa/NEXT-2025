// Caminho do arquivo: br\com\fiap\mottu\specification\VeiculoSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.VeiculoFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.model.relacionamento.ClienteVeiculo;
import br.com.fiap.mottu.model.relacionamento.VeiculoBox;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatio;
import br.com.fiap.mottu.model.relacionamento.VeiculoZona;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class VeiculoSpecification {

    public static Specification<Veiculo> withFilters(VeiculoFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.placa() != null && !filter.placa().isBlank()) {
                predicates.add(cb.equal(root.get("placa"), filter.placa()));
            }
            if (filter.renavam() != null && !filter.renavam().isBlank()) {
                predicates.add(cb.equal(root.get("renavam"), filter.renavam()));
            }
            if (filter.chassi() != null && !filter.chassi().isBlank()) {
                predicates.add(cb.equal(root.get("chassi"), filter.chassi()));
            }
            if (filter.fabricante() != null && !filter.fabricante().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("fabricante")), "%" + filter.fabricante().toLowerCase() + "%"));
            }
            if (filter.modelo() != null && !filter.modelo().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("modelo")), "%" + filter.modelo().toLowerCase() + "%"));
            }
            if (filter.motor() != null && !filter.motor().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("motor")), "%" + filter.motor().toLowerCase() + "%"));
            }
            if (filter.ano() != null) {
                predicates.add(cb.equal(root.get("ano"), filter.ano()));
            }
            if (filter.combustivel() != null && !filter.combustivel().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("combustivel")), "%" + filter.combustivel().toLowerCase() + "%"));
            }

            // Filtro por relacionamento ManyToMany (ClienteVeiculo)
            if (filter.clienteCpf() != null && !filter.clienteCpf().isBlank()) {
                Join<Veiculo, ClienteVeiculo> clienteVeiculoJoin = root.join("clienteVeiculos");
                predicates.add(cb.equal(clienteVeiculoJoin.get("cliente").get("cpf"), filter.clienteCpf()));
            }

            // Filtro por relacionamento ManyToMany (VeiculoBox)
            if (filter.boxNome() != null && !filter.boxNome().isBlank()) {
                Join<Veiculo, VeiculoBox> veiculoBoxJoin = root.join("veiculoBoxes");
                predicates.add(cb.like(cb.lower(veiculoBoxJoin.get("box").get("nome")), "%" + filter.boxNome().toLowerCase() + "%"));
            }

            // Filtro por relacionamento ManyToMany (VeiculoPatio)
            if (filter.patioNome() != null && !filter.patioNome().isBlank()) {
                Join<Veiculo, VeiculoPatio> veiculoPatioJoin = root.join("veiculoPatios");
                predicates.add(cb.like(cb.lower(veiculoPatioJoin.get("patio").get("nomePatio")), "%" + filter.patioNome().toLowerCase() + "%"));
            }

            // Filtro por relacionamento ManyToMany (VeiculoZona)
            if (filter.zonaNome() != null && !filter.zonaNome().isBlank()) {
                Join<Veiculo, VeiculoZona> veiculoZonaJoin = root.join("veiculoZonas");
                predicates.add(cb.like(cb.lower(veiculoZonaJoin.get("zona").get("nome")), "%" + filter.zonaNome().toLowerCase() + "%"));
            }

            query.distinct(true); // Evitar duplicação de resultados

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}