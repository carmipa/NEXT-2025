// Caminho do arquivo: br\com\fiap\mottu\specification\ZonaSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.ZonaFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Zona;
import br.com.fiap.mottu.model.relacionamento.ZonaBox;
import br.com.fiap.mottu.model.relacionamento.ZonaPatio;
import br.com.fiap.mottu.model.relacionamento.VeiculoZona;
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

            // Filtro por relacionamento ManyToMany (ZonaBox)
            if (filter.boxNome() != null && !filter.boxNome().isBlank()) {
                Join<Zona, ZonaBox> zonaBoxJoin = root.join("zonaBoxes");
                predicates.add(cb.like(cb.lower(zonaBoxJoin.get("box").get("nome")), "%" + filter.boxNome().toLowerCase() + "%"));
            }

            // Filtro por relacionamento ManyToMany (VeiculoZona)
            if (filter.veiculoPlaca() != null && !filter.veiculoPlaca().isBlank()) {
                Join<Zona, VeiculoZona> veiculoZonaJoin = root.join("veiculoZonas");
                predicates.add(cb.equal(veiculoZonaJoin.get("veiculo").get("placa"), filter.veiculoPlaca()));
            }

            // Filtro por relacionamento ManyToMany (ZonaPatio)
            if (filter.patioNome() != null && !filter.patioNome().isBlank()) {
                Join<Zona, ZonaPatio> zonaPatioJoin = root.join("zonaPatios");
                predicates.add(cb.like(cb.lower(zonaPatioJoin.get("patio").get("nomePatio")), "%" + filter.patioNome().toLowerCase() + "%"));
            }

            query.distinct(true); // Evitar duplicação de resultados

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}