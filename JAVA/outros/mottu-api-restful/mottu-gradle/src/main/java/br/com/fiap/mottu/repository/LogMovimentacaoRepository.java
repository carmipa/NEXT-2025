package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LogMovimentacaoRepository extends JpaRepository<LogMovimentacao, Long> {

    /**
     * Busca logs de movimentação por veículo
     */
    List<LogMovimentacao> findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(Long veiculoId);
    
    List<LogMovimentacao> findByDataHoraMovimentacaoBetween(LocalDateTime inicio, LocalDateTime fim);
    
    long countByDataHoraMovimentacaoBetween(LocalDateTime inicio, LocalDateTime fim);
    
    long countByTipoMovimentacao(TipoMovimentacao tipoMovimentacao);
    
    // Contar por tipo e período
    Long countByTipoMovimentacaoAndDataHoraMovimentacaoBetween(TipoMovimentacao tipo, LocalDateTime inicio, LocalDateTime fim);

    /**
     * Busca logs de movimentação por pátio
     */
    List<LogMovimentacao> findByPatioIdPatioOrderByDataHoraMovimentacaoDesc(Long patioId);

    /**
     * Busca logs de movimentação por período
     */
    List<LogMovimentacao> findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(
            LocalDateTime dataInicio, LocalDateTime dataFim);

    /**
     * Busca logs de movimentação por tipo (ENTRADA/SAIDA)
     */
    List<LogMovimentacao> findByTipoMovimentacaoOrderByDataHoraMovimentacaoDesc(TipoMovimentacao tipo);

    /**
     * Busca logs de movimentação por pátio e período
     */
    List<LogMovimentacao> findByPatioIdPatioAndDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(
            Long patioId, LocalDateTime dataInicio, LocalDateTime dataFim);

    /**
     * Busca logs de movimentação por tipo e período
     */
    List<LogMovimentacao> findByTipoMovimentacaoAndDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(
            TipoMovimentacao tipo, LocalDateTime dataInicio, LocalDateTime dataFim);

    /**
     * Conta movimentações por tipo em um período
     */
    @Query("SELECT COUNT(l) FROM LogMovimentacao l WHERE l.tipoMovimentacao = :tipo AND l.dataHoraMovimentacao BETWEEN :inicio AND :fim")
    Long countByTipoMovimentacaoAndPeriodo(@Param("tipo") TipoMovimentacao tipo, 
                                          @Param("inicio") LocalDateTime inicio, 
                                          @Param("fim") LocalDateTime fim);

    /**
     * Conta movimentações por pátio e tipo em um período
     */
    @Query("SELECT COUNT(l) FROM LogMovimentacao l WHERE l.patio.idPatio = :patioId AND l.tipoMovimentacao = :tipo AND l.dataHoraMovimentacao BETWEEN :inicio AND :fim")
    Long countByPatioAndTipoMovimentacaoAndPeriodo(@Param("patioId") Long patioId,
                                                   @Param("tipo") TipoMovimentacao tipo,
                                                   @Param("inicio") LocalDateTime inicio,
                                                   @Param("fim") LocalDateTime fim);

    /**
     * Busca o tempo médio de estacionamento por pátio
     */
    @Query("SELECT AVG(l.tempoEstacionamentoMinutos) FROM LogMovimentacao l WHERE l.patio.idPatio = :patioId AND l.tempoEstacionamentoMinutos IS NOT NULL")
    Double findTempoMedioEstacionamentoPorPatio(@Param("patioId") Long patioId);

    /**
     * Busca o tempo médio de estacionamento global
     */
    @Query("SELECT AVG(l.tempoEstacionamentoMinutos) FROM LogMovimentacao l WHERE l.tempoEstacionamentoMinutos IS NOT NULL")
    Double findTempoMedioEstacionamentoGlobal();

    /**
     * Busca os boxes mais utilizados
     */
    @Query("SELECT l.box.idBox, l.box.nome, COUNT(l) as total FROM LogMovimentacao l GROUP BY l.box.idBox, l.box.nome ORDER BY total DESC")
    List<Object[]> findTopBoxesUtilizados(Pageable pageable);

    /**
     * Busca os veículos mais frequentes
     */
    @Query("SELECT l.veiculo.idVeiculo, l.veiculo.placa, COUNT(l) as total FROM LogMovimentacao l GROUP BY l.veiculo.idVeiculo, l.veiculo.placa ORDER BY total DESC")
    List<Object[]> findTopVeiculosFrequentes(Pageable pageable);

    /**
     * Busca movimentações com paginação
     */
    Page<LogMovimentacao> findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(
            LocalDateTime dataInicio, LocalDateTime dataFim, Pageable pageable);

    /**
     * Busca movimentações por pátio com paginação
     */
    Page<LogMovimentacao> findByPatioIdPatioOrderByDataHoraMovimentacaoDesc(Long patioId, Pageable pageable);

    /**
     * Busca movimentações por veículo com paginação
     */
    Page<LogMovimentacao> findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(Long veiculoId, Pageable pageable);

    /**
     * Busca entrada de um veículo em um box específico
     */
    Optional<LogMovimentacao> findByVeiculoIdVeiculoAndBoxIdBoxAndTipoMovimentacaoOrderByDataHoraMovimentacaoDesc(
            Long veiculoId, Long boxId, TipoMovimentacao tipo);
    
    // Métodos para o NotificacaoService
    Long countByTipoMovimentacaoAndDataHoraMovimentacaoAfter(TipoMovimentacao tipo, LocalDateTime dataHora);
    
    Long countByDataHoraMovimentacaoAfter(LocalDateTime dataHora);
    
    @Query("SELECT l FROM LogMovimentacao l WHERE l.tipoMovimentacao = 'ENTRADA' AND l.dataHoraMovimentacao >= :dataLimite " +
           "AND NOT EXISTS (SELECT l2 FROM LogMovimentacao l2 WHERE l2.veiculo = l.veiculo AND l2.tipoMovimentacao = 'SAIDA' " +
           "AND l2.dataHoraMovimentacao > l.dataHoraMovimentacao)")
    List<LogMovimentacao> findEntradasSemSaidaRecentes(@Param("dataLimite") LocalDateTime dataLimite);
    
    // Método de teste para debug
    @Query("SELECT COUNT(l) FROM LogMovimentacao l")
    Long countAll();
    
    // Consulta nativa para teste
    @Query(value = "SELECT * FROM TB_LOG_MOVIMENTACAO WHERE DATA_HORA_MOVIMENTACAO BETWEEN :inicio AND :fim", nativeQuery = true)
    List<Object[]> findByDataHoraMovimentacaoBetweenNative(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
