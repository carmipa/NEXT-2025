package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.EstacionamentoFilter;
import br.com.fiap.mottu.model.Estacionamento;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Especificações JPA para consultas dinâmicas de Estacionamento
 * Usado em conjunto com EstacionamentoFilter para queries flexíveis
 */
public class EstacionamentoSpecification {

    /**
     * Cria especificação baseada nos filtros fornecidos
     * @param filter filtros de busca
     * @return Specification para Estacionamento
     */
    public static Specification<Estacionamento> withFilters(EstacionamentoFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ================== FILTROS POR VEÍCULO ==================
            if (filter.veiculoId() != null) {
                predicates.add(cb.equal(root.get("veiculo").get("idVeiculo"), filter.veiculoId()));
            }

            if (StringUtils.hasText(filter.getCleanPlaca())) {
                Join<Estacionamento, br.com.fiap.mottu.model.Veiculo> veiculoJoin = root.join("veiculo");
                predicates.add(cb.equal(
                    cb.upper(veiculoJoin.get("placa")),
                    filter.getCleanPlaca()
                ));
            }

            if (StringUtils.hasText(filter.modelo())) {
                Join<Estacionamento, br.com.fiap.mottu.model.Veiculo> veiculoJoin = root.join("veiculo");
                predicates.add(cb.like(
                    cb.lower(veiculoJoin.get("modelo")),
                    "%" + filter.modelo().toLowerCase() + "%"
                ));
            }

            if (StringUtils.hasText(filter.fabricante())) {
                Join<Estacionamento, br.com.fiap.mottu.model.Veiculo> veiculoJoin = root.join("veiculo");
                predicates.add(cb.like(
                    cb.lower(veiculoJoin.get("fabricante")),
                    "%" + filter.fabricante().toLowerCase() + "%"
                ));
            }

            // ================== FILTROS POR BOX ==================
            if (filter.boxId() != null) {
                predicates.add(cb.equal(root.get("box").get("idBox"), filter.boxId()));
            }

            if (StringUtils.hasText(filter.getCleanBoxNome())) {
                Join<Estacionamento, br.com.fiap.mottu.model.Box> boxJoin = root.join("box");
                // Busca acento-insensível usando TRANSLATE no Oracle
                jakarta.persistence.criteria.Expression<String> translatedField = cb.function(
                        "TRANSLATE",
                        String.class,
                        cb.lower(boxJoin.get("nome")),
                        cb.literal("ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇçÑñ"),
                        cb.literal("AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn")
                );
                jakarta.persistence.criteria.Expression<String> translatedParam = cb.function(
                        "TRANSLATE",
                        String.class,
                        cb.literal("%" + filter.getCleanBoxNome().toLowerCase() + "%"),
                        cb.literal("ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇçÑñ"),
                        cb.literal("AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn")
                );
                predicates.add(cb.like(translatedField, translatedParam));
            }

            if (StringUtils.hasText(filter.boxStatus())) {
                Join<Estacionamento, br.com.fiap.mottu.model.Box> boxJoin = root.join("box");
                predicates.add(cb.equal(cb.upper(boxJoin.get("status")), filter.boxStatus().toUpperCase()));
            }

            // ================== FILTROS POR PÁTIO ==================
            if (filter.patioId() != null) {
                predicates.add(cb.equal(root.get("patio").get("idPatio"), filter.patioId()));
            }

            if (StringUtils.hasText(filter.getCleanPatioNome())) {
                Join<Estacionamento, br.com.fiap.mottu.model.Patio> patioJoin = root.join("patio");
                predicates.add(cb.like(
                    cb.lower(patioJoin.get("nomePatio")),
                    "%" + filter.getCleanPatioNome().toLowerCase() + "%"
                ));
            }

            // ================== FILTROS POR STATUS ==================
            if (filter.estaEstacionado() != null) {
                predicates.add(cb.equal(root.get("estaEstacionado"), filter.estaEstacionado()));
            }

            // ================== FILTROS POR DATA ==================
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

            // ================== FILTROS POR OBSERVAÇÕES ==================
            if (StringUtils.hasText(filter.getCleanObservacoes())) {
                predicates.add(cb.like(
                    cb.lower(root.get("observacoes")),
                    "%" + filter.getCleanObservacoes().toLowerCase() + "%"
                ));
            }

            // ================== FILTROS POR TEMPO ==================
            // Nota: Filtros de tempo mínimo/máximo seriam calculados em tempo de execução
            // ou via query nativa, pois dependem de cálculo de diferença entre datas

            // ================== RETORNO ==================
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Especificação para buscar apenas estacionamentos ativos
     */
    public static Specification<Estacionamento> isAtivo() {
        return (root, query, cb) -> cb.equal(root.get("estaEstacionado"), true);
    }

    /**
     * Especificação para buscar apenas estacionamentos inativos (histórico)
     */
    public static Specification<Estacionamento> isInativo() {
        return (root, query, cb) -> cb.equal(root.get("estaEstacionado"), false);
    }

    /**
     * Especificação para buscar por veículo
     */
    public static Specification<Estacionamento> byVeiculoId(Long veiculoId) {
        return (root, query, cb) -> cb.equal(root.get("veiculo").get("idVeiculo"), veiculoId);
    }

    /**
     * Especificação para buscar por box
     */
    public static Specification<Estacionamento> byBoxId(Long boxId) {
        return (root, query, cb) -> cb.equal(root.get("box").get("idBox"), boxId);
    }

    /**
     * Especificação para buscar por pátio
     */
    public static Specification<Estacionamento> byPatioId(Long patioId) {
        return (root, query, cb) -> cb.equal(root.get("patio").get("idPatio"), patioId);
    }
}





