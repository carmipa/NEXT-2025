package br.com.fiap.mottu.repository.noticia;

import br.com.fiap.mottu.model.noticia.Noticia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoticiaRepository extends JpaRepository<Noticia, Long>, JpaSpecificationExecutor<Noticia> {
    
    /**
     * Busca notícias com filtros simples
     */
    @Query("SELECT n FROM Noticia n WHERE " +
           "(:categoria IS NULL OR n.categoria = :categoria) AND " +
           "(:sentimento IS NULL OR n.sentimento = :sentimento) AND " +
           "(:fonte IS NULL OR n.fonte = :fonte) AND " +
           "n.ativo = true " +
           "ORDER BY n.dataCaptura DESC")
    Page<Noticia> findByFilters(
        @Param("categoria") String categoria,
        @Param("sentimento") String sentimento,
        @Param("fonte") String fonte,
        @Param("busca") String busca,
        Pageable pageable
    );
    
    /**
     * Verifica se já existe notícia com a mesma URL
     */
    @Query("SELECT COUNT(n) > 0 FROM Noticia n WHERE CAST(JSON_VALUE(n.dadosJson, '$.urlOrigem') AS STRING) = :urlOrigem")
    boolean existsByUrlOrigem(@Param("urlOrigem") String urlOrigem);
    
    /**
     * Conta notícias capturadas após uma data específica
     */
    long countByDataCapturaAfter(LocalDateTime dateTime);
    
    /**
     * Busca fonte mais ativa
     */
    @Query("SELECT n.fonte, COUNT(n) FROM Noticia n WHERE n.ativo = true GROUP BY n.fonte ORDER BY COUNT(n) DESC")
    List<Object[]> findFonteMaisAtiva(Pageable pageable);
    
    /**
     * Busca categoria mais comum
     */
    @Query("SELECT n.categoria, COUNT(n) FROM Noticia n WHERE n.ativo = true GROUP BY n.categoria ORDER BY COUNT(n) DESC")
    List<Object[]> findCategoriaMaisComum(Pageable pageable);
    
    /**
     * Conta notícias por fonte específica
     */
    long countByFonte(String fonte);
    
    /**
     * Busca notícias por fonte
     */
    List<Noticia> findByFonteOrderByDataCapturaDesc(String fonte);
    
    /**
     * Busca notícias por categoria
     */
    List<Noticia> findByCategoriaOrderByDataCapturaDesc(String categoria);
    
    /**
     * Busca notícias por sentimento
     */
    List<Noticia> findBySentimentoOrderByDataCapturaDesc(String sentimento);
    
    /**
     * Busca notícias mais relevantes
     */
    @Query("SELECT n FROM Noticia n WHERE n.ativo = true ORDER BY n.relevancia DESC, n.dataCaptura DESC")
    List<Noticia> findMaisRelevantes(Pageable pageable);
    
    /**
     * Busca notícias mais visualizadas
     */
    @Query("SELECT n FROM Noticia n WHERE n.ativo = true ORDER BY n.visualizacoes DESC, n.dataCaptura DESC")
    List<Noticia> findMaisVisualizadas(Pageable pageable);
}