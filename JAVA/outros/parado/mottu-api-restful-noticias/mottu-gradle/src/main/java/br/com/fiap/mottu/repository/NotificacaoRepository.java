package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Notificacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    
    // Buscar notificações não lidas
    Page<Notificacao> findByLidaFalseOrderByDataHoraCriacaoDesc(Pageable pageable);
    
    // Buscar por prioridade
    Page<Notificacao> findByPrioridadeOrderByDataHoraCriacaoDesc(
        Notificacao.PrioridadeNotificacao prioridade, Pageable pageable);
    
    // Buscar por categoria
    Page<Notificacao> findByCategoriaOrderByDataHoraCriacaoDesc(
        Notificacao.CategoriaNotificacao categoria, Pageable pageable);
    
    // Buscar notificações críticas não lidas
    List<Notificacao> findByPrioridadeAndLidaFalseOrderByDataHoraCriacaoDesc(
        Notificacao.PrioridadeNotificacao prioridade);
    
    // Contar notificações não lidas
    Long countByLidaFalse();
    
    // Contar notificações críticas não lidas
    Long countByPrioridadeAndLidaFalse(Notificacao.PrioridadeNotificacao prioridade);
    
    // Buscar notificações recentes (últimas 24 horas)
    @Query("SELECT n FROM Notificacao n WHERE n.dataHoraCriacao >= :dataInicio ORDER BY n.dataHoraCriacao DESC")
    List<Notificacao> findNotificacoesRecentes(@Param("dataInicio") LocalDateTime dataInicio);
    
    // Buscar notificações por filtros combinados
    @Query("SELECT n FROM Notificacao n WHERE " +
           "(:lida IS NULL OR n.lida = :lida) AND " +
           "(:prioridade IS NULL OR n.prioridade = :prioridade) AND " +
           "(:categoria IS NULL OR n.categoria = :categoria) AND " +
           "(:tipo IS NULL OR n.tipo = :tipo) " +
           "ORDER BY n.dataHoraCriacao DESC")
    Page<Notificacao> findByFiltros(
        @Param("lida") Boolean lida,
        @Param("prioridade") Notificacao.PrioridadeNotificacao prioridade,
        @Param("categoria") Notificacao.CategoriaNotificacao categoria,
        @Param("tipo") Notificacao.TipoNotificacao tipo,
        Pageable pageable);
    
    // Verificar se existe notificação similar recente
    boolean existsByTituloAndDataHoraCriacaoAfter(String titulo, LocalDateTime dataHora);
    
    // Métodos adicionais para analytics
    Long countByLidaTrue();
    Long countByPrioridade(Notificacao.PrioridadeNotificacao prioridade);
    Long countByCategoria(Notificacao.CategoriaNotificacao categoria);
    Long countByDataHoraCriacaoAfter(LocalDateTime dataHora);
    
    // Deletar notificações por patioId (usando SQL nativo pois não há mapeamento JPA bidirecional)
    // Oracle converte identificadores sem aspas para maiúsculas, mas se a tabela foi criada com aspas,
    // precisamos usar aspas duplas para manter o case exato
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM \"RELACAODIRETA\".\"TB_NOTIFICACAO\" WHERE \"tb_patio_id_patio\" = :patioId", nativeQuery = true)
    void deleteByPatioId(@Param("patioId") Long patioId);
    
    // Deletar notificações por boxId (usando SQL nativo)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM \"RELACAODIRETA\".\"TB_NOTIFICACAO\" WHERE \"tb_box_id_box\" = :boxId", nativeQuery = true)
    void deleteByBoxId(@Param("boxId") Long boxId);
    
    // Deletar notificações de todos os boxes de um pátio (otimizado - uma única query)
    // Usando aspas duplas para garantir case-sensitive correto conforme script de migração
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM \"RELACAODIRETA\".\"TB_NOTIFICACAO\" WHERE \"tb_box_id_box\" IN (SELECT \"id_box\" FROM \"RELACAODIRETA\".\"TB_BOX\" WHERE \"tb_patio_id_patio\" = :patioId)", nativeQuery = true)
    void deleteByBoxesDoPatio(@Param("patioId") Long patioId);
}