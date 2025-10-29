package br.com.fiap.mottu.specification.noticia;

import br.com.fiap.mottu.filter.noticia.NoticiaFilter;
import br.com.fiap.mottu.model.noticia.Noticia;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class NoticiaSpecification {

    public static Specification<Noticia> createSpecification(NoticiaFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getTitulo() != null && !filter.getTitulo().isEmpty()) {
                predicates.add(cb.like(cb.lower(cb.function("JSON_VALUE", String.class, root.get("dadosJson"), cb.literal("$.titulo"))), "%" + filter.getTitulo().toLowerCase() + "%"));
            }
            if (filter.getResumo() != null && !filter.getResumo().isEmpty()) {
                predicates.add(cb.like(cb.lower(cb.function("JSON_VALUE", String.class, root.get("dadosJson"), cb.literal("$.resumo"))), "%" + filter.getResumo().toLowerCase() + "%"));
            }
            if (filter.getFonte() != null && !filter.getFonte().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("fonte")), "%" + filter.getFonte().toLowerCase() + "%"));
            }
            if (filter.getAutor() != null && !filter.getAutor().isEmpty()) {
                predicates.add(cb.like(cb.lower(cb.function("JSON_VALUE", String.class, root.get("dadosJson"), cb.literal("$.autor"))), "%" + filter.getAutor().toLowerCase() + "%"));
            }
            if (filter.getCategoria() != null && !filter.getCategoria().isEmpty()) {
                predicates.add(cb.equal(root.get("categoria"), filter.getCategoria()));
            }
            if (filter.getSentimento() != null && !filter.getSentimento().isEmpty()) {
                predicates.add(cb.equal(root.get("sentimento"), filter.getSentimento()));
            }
            if (filter.getDataCapturaInicio() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataCaptura"), filter.getDataCapturaInicio()));
            }
            if (filter.getDataCapturaFim() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataCaptura"), filter.getDataCapturaFim()));
            }
            if (filter.getRelevanciaMinima() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("relevancia"), filter.getRelevanciaMinima()));
            }
            if (filter.getVisualizacoesMinimas() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("visualizacoes"), filter.getVisualizacoesMinimas()));
            }
            if (filter.getAtivo() != null) {
                predicates.add(cb.equal(root.get("ativo"), filter.getAtivo()));
            }
            if (filter.getPalavraChave() != null && !filter.getPalavraChave().isEmpty()) {
                String likePattern = "%" + filter.getPalavraChave().toLowerCase() + "%";
                Predicate tituloLike = cb.like(cb.lower(cb.function("JSON_VALUE", String.class, root.get("dadosJson"), cb.literal("$.titulo"))), likePattern);
                Predicate resumoLike = cb.like(cb.lower(cb.function("JSON_VALUE", String.class, root.get("dadosJson"), cb.literal("$.resumo"))), likePattern);
                Predicate conteudoLike = cb.like(cb.lower(cb.function("JSON_VALUE", String.class, root.get("dadosJson"), cb.literal("$.conteudo"))), likePattern);
                predicates.add(cb.or(tituloLike, resumoLike, conteudoLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
