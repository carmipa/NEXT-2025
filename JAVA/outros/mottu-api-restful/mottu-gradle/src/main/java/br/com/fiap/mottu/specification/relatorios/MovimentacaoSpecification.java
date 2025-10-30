package br.com.fiap.mottu.specification.relatorios;

import br.com.fiap.mottu.filter.relatorios.MovimentacaoFilter;
import br.com.fiap.mottu.model.LogMovimentacao;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;


/**
 * Specification para filtros de movimentação
 */
public class MovimentacaoSpecification {

    /**
     * Cria specification baseada no filtro de movimentação
     */
    public static Specification<LogMovimentacao> withMovimentacaoFilter(MovimentacaoFilter filter) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (filter == null) {
                return predicate;
            }

            // Filtro por ID do pátio
            if (filter.getPatioId() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("patio").get("idPatio"), filter.getPatioId()));
            }

            // Filtro por nome do pátio
            if (StringUtils.hasText(filter.getNomePatio())) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("patio").get("nomePatio")),
                        "%" + filter.getNomePatio().toLowerCase() + "%"));
            }

            // Filtro por ID do veículo
            if (filter.getVeiculoId() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("veiculo").get("idVeiculo"), filter.getVeiculoId()));
            }

            // Filtro por placa do veículo
            if (StringUtils.hasText(filter.getPlacaVeiculo())) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("veiculo").get("placa")),
                        "%" + filter.getPlacaVeiculo().toLowerCase() + "%"));
            }

            // Filtro por tipo de movimentação
            if (filter.getTipoMovimentacao() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("tipoMovimentacao"), filter.getTipoMovimentacao()));
            }

            // Filtro por data
            if (filter.getDataInicio() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.greaterThanOrEqualTo(root.get("dataHoraMovimentacao"), 
                        filter.getDataInicio().atStartOfDay()));
            }

            if (filter.getDataFim() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.lessThanOrEqualTo(root.get("dataHoraMovimentacao"), 
                        filter.getDataFim().atTime(23, 59, 59)));
            }

            // Filtro por data/hora
            if (filter.getDataHoraInicio() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.greaterThanOrEqualTo(root.get("dataHoraMovimentacao"), filter.getDataHoraInicio()));
            }

            if (filter.getDataHoraFim() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.lessThanOrEqualTo(root.get("dataHoraMovimentacao"), filter.getDataHoraFim()));
            }

            // Filtro por horário
            if (StringUtils.hasText(filter.getHorarioInicio())) {
                String[] horarioParts = filter.getHorarioInicio().split(":");
                int hora = Integer.parseInt(horarioParts[0]);
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.greaterThanOrEqualTo(
                        criteriaBuilder.function("HOUR", Integer.class, root.get("dataHoraMovimentacao")), hora));
            }

            if (StringUtils.hasText(filter.getHorarioFim())) {
                String[] horarioParts = filter.getHorarioFim().split(":");
                int hora = Integer.parseInt(horarioParts[0]);
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.lessThanOrEqualTo(
                        criteriaBuilder.function("HOUR", Integer.class, root.get("dataHoraMovimentacao")), hora));
            }

            // Filtro por dia da semana
            if (StringUtils.hasText(filter.getDiaSemana())) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(
                        criteriaBuilder.function("DAYOFWEEK", Integer.class, root.get("dataHoraMovimentacao")), 
                        getDayOfWeekNumber(filter.getDiaSemana())));
            }

            return predicate;
        };
    }

    /**
     * Cria specification para ordenação
     */
    public static Specification<LogMovimentacao> withOrdering(MovimentacaoFilter filter) {
        return (root, query, criteriaBuilder) -> {
            if (query != null) {
                if (filter != null && StringUtils.hasText(filter.getOrdenacao())) {
                    String direcao = StringUtils.hasText(filter.getDirecaoOrdenacao()) 
                        ? filter.getDirecaoOrdenacao().toUpperCase() : "ASC";
                    
                    Path<?> orderPath = root.get(filter.getOrdenacao());
                    
                    if ("DESC".equals(direcao)) {
                        query.orderBy(criteriaBuilder.desc(orderPath));
                    } else {
                        query.orderBy(criteriaBuilder.asc(orderPath));
                    }
                } else {
                    // Ordenação padrão por data/hora decrescente
                    query.orderBy(criteriaBuilder.desc(root.get("dataHoraMovimentacao")));
                }
            }
            
            return criteriaBuilder.conjunction();
        };
    }

    /**
     * Converte nome do dia da semana para número
     */
    private static int getDayOfWeekNumber(String diaSemana) {
        return switch (diaSemana.toUpperCase()) {
            case "SUNDAY", "DOMINGO" -> 1;
            case "MONDAY", "SEGUNDA" -> 2;
            case "TUESDAY", "TERCA" -> 3;
            case "WEDNESDAY", "QUARTA" -> 4;
            case "THURSDAY", "QUINTA" -> 5;
            case "FRIDAY", "SEXTA" -> 6;
            case "SATURDAY", "SABADO" -> 7;
            default -> 1;
        };
    }
}
