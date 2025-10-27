package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.CnhFilter;
import br.com.fiap.mottu.model.Cnh;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Especificações JPA para consultas dinâmicas de CNH
 */
public class CnhSpecification {

    /**
     * Cria especificação baseada nos filtros fornecidos
     * @param filter filtros de busca
     * @return Specification para CNH
     */
    public static Specification<Cnh> withFilters(CnhFilter filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro por número de registro
            if (StringUtils.hasText(filter.getCleanNumeroRegistro())) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("numeroRegistro")),
                    "%" + filter.getCleanNumeroRegistro().toLowerCase() + "%"
                ));
            }

            // Filtro por categoria
            if (StringUtils.hasText(filter.getCleanCategoria())) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.upper(root.get("categoria")),
                    filter.getCleanCategoria()
                ));
            }

            // Filtro por ID do cliente
            if (filter.getClienteId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("cliente").get("idCliente"),
                    filter.getClienteId()
                ));
            }

            // Filtro por nome do cliente
            if (StringUtils.hasText(filter.getCleanClienteNome())) {
                Join<Cnh, Object> clienteJoin = root.join("cliente");
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(
                        criteriaBuilder.concat(
                            criteriaBuilder.concat(clienteJoin.get("nome"), " "),
                            clienteJoin.get("sobrenome")
                        )
                    ),
                    "%" + filter.getCleanClienteNome().toLowerCase() + "%"
                ));
            }

            // Filtro por CPF do cliente
            if (StringUtils.hasText(filter.getCleanClienteCpf())) {
                Join<Cnh, Object> clienteJoin = root.join("cliente");
                predicates.add(criteriaBuilder.equal(
                    clienteJoin.get("cpf"),
                    filter.getCleanClienteCpf()
                ));
            }

            // Filtro por data de emissão (início)
            if (filter.getDataEmissaoInicio() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("dataEmissao"),
                    filter.getDataEmissaoInicio()
                ));
            }

            // Filtro por data de emissão (fim)
            if (filter.getDataEmissaoFim() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("dataEmissao"),
                    filter.getDataEmissaoFim()
                ));
            }

            // Filtro por data de validade (início)
            if (filter.getDataValidadeInicio() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("dataValidade"),
                    filter.getDataValidadeInicio()
                ));
            }

            // Filtro por data de validade (fim)
            if (filter.getDataValidadeFim() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("dataValidade"),
                    filter.getDataValidadeFim()
                ));
            }

            // Filtro por CNH vencida
            if (filter.getVencida() != null) {
                LocalDate hoje = LocalDate.now();
                if (filter.getVencida()) {
                    predicates.add(criteriaBuilder.lessThan(root.get("dataValidade"), hoje));
                } else {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dataValidade"), hoje));
                }
            }

            // Filtro por CNH próxima do vencimento (30 dias)
            if (filter.getProximaVencimento() != null) {
                LocalDate hoje = LocalDate.now();
                LocalDate proximoVencimento = hoje.plusDays(30);
                if (filter.getProximaVencimento()) {
                    predicates.add(criteriaBuilder.and(
                        criteriaBuilder.greaterThanOrEqualTo(root.get("dataValidade"), hoje),
                        criteriaBuilder.lessThanOrEqualTo(root.get("dataValidade"), proximoVencimento)
                    ));
                } else {
                    predicates.add(criteriaBuilder.or(
                        criteriaBuilder.lessThan(root.get("dataValidade"), hoje),
                        criteriaBuilder.greaterThan(root.get("dataValidade"), proximoVencimento)
                    ));
                }
            }

            // Filtro por CNH que permite dirigir motos
            if (filter.getPermiteMotos() != null) {
                if (filter.getPermiteMotos()) {
                    predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(root.get("categoria"), "A%"),
                        criteriaBuilder.like(root.get("categoria"), "%A%")
                    ));
                } else {
                    predicates.add(criteriaBuilder.and(
                        criteriaBuilder.notLike(root.get("categoria"), "A%"),
                        criteriaBuilder.notLike(root.get("categoria"), "%A%")
                    ));
                }
            }

            // Filtro por CNH que permite dirigir carros
            if (filter.getPermiteCarros() != null) {
                if (filter.getPermiteCarros()) {
                    predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(root.get("categoria"), "B%"),
                        criteriaBuilder.like(root.get("categoria"), "%B%")
                    ));
                } else {
                    predicates.add(criteriaBuilder.and(
                        criteriaBuilder.notLike(root.get("categoria"), "B%"),
                        criteriaBuilder.notLike(root.get("categoria"), "%B%")
                    ));
                }
            }

            // Busca global (DataTable)
            if (StringUtils.hasText(filter.getCleanSearch())) {
                String searchTerm = "%" + filter.getCleanSearch().toLowerCase() + "%";
                
                Predicate numeroRegistroPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("numeroRegistro")), searchTerm);
                
                Predicate categoriaPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("categoria")), searchTerm);
                
                Join<Cnh, Object> clienteJoin = root.join("cliente");
                Predicate nomeClientePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(
                        criteriaBuilder.concat(
                            criteriaBuilder.concat(clienteJoin.get("nome"), " "),
                            clienteJoin.get("sobrenome")
                        )
                    ), searchTerm);
                
                Predicate cpfClientePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(clienteJoin.get("cpf")), searchTerm);

                predicates.add(criteriaBuilder.or(
                    numeroRegistroPredicate,
                    categoriaPredicate,
                    nomeClientePredicate,
                    cpfClientePredicate
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Especificação para buscar CNHs vencidas
     * @return Specification para CNHs vencidas
     */
    public static Specification<Cnh> isVencida() {
        return (root, query, criteriaBuilder) -> {
            LocalDate hoje = LocalDate.now();
            return criteriaBuilder.lessThan(root.get("dataValidade"), hoje);
        };
    }

    /**
     * Especificação para buscar CNHs próximas do vencimento
     * @return Specification para CNHs próximas do vencimento
     */
    public static Specification<Cnh> isProximaVencimento() {
        return (root, query, criteriaBuilder) -> {
            LocalDate hoje = LocalDate.now();
            LocalDate proximoVencimento = hoje.plusDays(30);
            return criteriaBuilder.and(
                criteriaBuilder.greaterThanOrEqualTo(root.get("dataValidade"), hoje),
                criteriaBuilder.lessThanOrEqualTo(root.get("dataValidade"), proximoVencimento)
            );
        };
    }

    /**
     * Especificação para buscar CNHs que permitem dirigir motos
     * @return Specification para CNHs que permitem dirigir motos
     */
    public static Specification<Cnh> permiteDirigirMotos() {
        return (root, query, criteriaBuilder) -> {
            return criteriaBuilder.or(
                criteriaBuilder.like(root.get("categoria"), "A%"),
                criteriaBuilder.like(root.get("categoria"), "%A%")
            );
        };
    }

    /**
     * Especificação para buscar CNHs que permitem dirigir carros
     * @return Specification para CNHs que permitem dirigir carros
     */
    public static Specification<Cnh> permiteDirigirCarros() {
        return (root, query, criteriaBuilder) -> {
            return criteriaBuilder.or(
                criteriaBuilder.like(root.get("categoria"), "B%"),
                criteriaBuilder.like(root.get("categoria"), "%B%")
            );
        };
    }

    /**
     * Especificação para buscar CNH por número de registro
     * @param numeroRegistro número de registro
     * @return Specification para CNH por número de registro
     */
    public static Specification<Cnh> byNumeroRegistro(String numeroRegistro) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(numeroRegistro)) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("numeroRegistro"), numeroRegistro);
        };
    }

    /**
     * Especificação para buscar CNH por categoria
     * @param categoria categoria da CNH
     * @return Specification para CNH por categoria
     */
    public static Specification<Cnh> byCategoria(String categoria) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(categoria)) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.upper(root.get("categoria")),
                categoria.toUpperCase()
            );
        };
    }

    /**
     * Especificação para buscar CNH por cliente
     * @param clienteId ID do cliente
     * @return Specification para CNH por cliente
     */
    public static Specification<Cnh> byCliente(Long clienteId) {
        return (root, query, criteriaBuilder) -> {
            if (clienteId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                root.get("cliente").get("idCliente"),
                clienteId
            );
        };
    }
}
