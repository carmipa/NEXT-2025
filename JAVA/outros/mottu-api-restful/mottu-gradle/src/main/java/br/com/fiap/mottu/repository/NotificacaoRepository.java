package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Notificacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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
}