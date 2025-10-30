package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.RastreamentoFilter;
import br.com.fiap.mottu.model.Rastreamento;
import br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal; // Importe BigDecimal!

public class RastreamentoSpecification {

    public static Specification<Rastreamento> withFilters(RastreamentoFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtros para IPS
            if (filter.ipsX() != null) {
                predicates.add(cb.equal(root.get("ipsX"), filter.ipsX()));
            }
            if (filter.ipsY() != null) {
                predicates.add(cb.equal(root.get("ipsY"), filter.ipsY()));
            }
            if (filter.ipsZ() != null) {
                predicates.add(cb.equal(root.get("ipsZ"), filter.ipsZ()));
            }

            // Filtros para GPRS
            if (filter.gprsLatitude() != null) {
                predicates.add(cb.equal(root.get("gprsLatitude"), filter.gprsLatitude()));
            }
            if (filter.gprsLongitude() != null) {
                predicates.add(cb.equal(root.get("gprsLongitude"), filter.gprsLongitude()));
            }
            if (filter.gprsAltitude() != null) {
                predicates.add(cb.equal(root.get("gprsAltitude"), filter.gprsAltitude()));
            }

            // Filtro por relacionamento ManyToMany (VeiculoRastreamento)
            if (filter.veiculoPlaca() != null && !filter.veiculoPlaca().isBlank()) {
                Join<Rastreamento, VeiculoRastreamento> veiculoRastreamentoJoin = root.join("veiculoRastreamentos");
                predicates.add(cb.equal(veiculoRastreamentoJoin.get("veiculo").get("placa"), filter.veiculoPlaca()));
            }

            query.distinct(true); // Evitar duplicação de resultados

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}