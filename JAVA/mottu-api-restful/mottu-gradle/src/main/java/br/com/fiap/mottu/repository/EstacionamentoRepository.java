package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Estacionamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para operações de Estacionamento
 * Inclui suporte a paginação, specifications e queries customizadas
 */
@Repository
public interface EstacionamentoRepository extends JpaRepository<Estacionamento, Long>, JpaSpecificationExecutor<Estacionamento> {

    /**
     * Busca estacionamento por ID com todas as associações carregadas
     */
    @Override
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Optional<Estacionamento> findById(Long id);

    // ================== BUSCAS POR STATUS ==================

    /**
     * Busca estacionamentos ativos (veículos estacionados no momento)
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByEstaEstacionadoTrue(Pageable pageable);

    /**
     * Busca estacionamentos inativos (histórico)
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByEstaEstacionadoFalse(Pageable pageable);

    /**
     * Lista todos os estacionamentos ativos (para SSE)
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    List<Estacionamento> findByEstaEstacionadoTrueOrderByDataUltimaAtualizacaoDesc();

    // ================== BUSCAS POR VEÍCULO ==================

    /**
     * Busca estacionamento ativo de um veículo
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Optional<Estacionamento> findByVeiculoIdVeiculoAndEstaEstacionadoTrue(Long veiculoId);
    
    /**
     * Busca TODOS os estacionamentos ativos de um veículo (pode haver múltiplos por bug)
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    List<Estacionamento> findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(Long veiculoId);

    /**
     * Busca estacionamento ativo por placa
     */
    @Query("SELECT e FROM Estacionamento e " +
           "JOIN e.veiculo v " +
           "WHERE UPPER(v.placa) = UPPER(:placa) AND e.estaEstacionado = true")
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Optional<Estacionamento> findByPlacaAndEstaEstacionadoTrue(@Param("placa") String placa);

    /**
     * Histórico de estacionamentos de um veículo
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByVeiculoIdVeiculoOrderByDataEntradaDesc(Long veiculoId, Pageable pageable);

    /**
     * Histórico de estacionamentos por placa
     */
    @Query("SELECT e FROM Estacionamento e " +
           "JOIN e.veiculo v " +
           "WHERE UPPER(v.placa) = UPPER(:placa) " +
           "ORDER BY e.dataEntrada DESC")
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByPlacaOrderByDataEntradaDesc(@Param("placa") String placa, Pageable pageable);

    // ================== BUSCAS POR BOX ==================

    /**
     * Busca estacionamento ativo em um box
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Optional<Estacionamento> findByBoxIdBoxAndEstaEstacionadoTrue(Long boxId);

    /**
     * Verifica se um box está ocupado
     */
    boolean existsByBoxIdBoxAndEstaEstacionadoTrue(Long boxId);

    /**
     * Histórico de estacionamentos em um box
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByBoxIdBoxOrderByDataEntradaDesc(Long boxId, Pageable pageable);

    // ================== BUSCAS POR PÁTIO ==================

    /**
     * Busca estacionamentos ativos em um pátio
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByPatioIdPatioAndEstaEstacionadoTrue(Long patioId, Pageable pageable);

    /**
     * Lista todos os estacionamentos ativos em um pátio (para SSE)
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    List<Estacionamento> findByPatioIdPatioAndEstaEstacionadoTrueOrderByDataUltimaAtualizacaoDesc(Long patioId);

    /**
     * Conta veículos estacionados em um pátio
     */
    long countByPatioIdPatioAndEstaEstacionadoTrue(Long patioId);

    /**
     * Histórico de estacionamentos em um pátio
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByPatioIdPatioOrderByDataEntradaDesc(Long patioId, Pageable pageable);

    // ================== BUSCAS POR DATA ==================

    /**
     * Busca estacionamentos ativos por período de entrada
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByDataEntradaBetweenAndEstaEstacionadoTrue(
            LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    /**
     * Busca estacionamentos por período de entrada (histórico)
     */
    @EntityGraph(attributePaths = {"veiculo", "box", "patio"})
    Page<Estacionamento> findByDataEntradaBetween(
            LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    // ================== QUERIES CUSTOMIZADAS ==================

    /**
     * Busca estacionamentos ativos com informações completas (otimizado para SSE)
     */
    @Query("SELECT e FROM Estacionamento e " +
           "WHERE e.estaEstacionado = true " +
           "ORDER BY e.dataUltimaAtualizacao DESC")
    @EntityGraph(attributePaths = {"veiculo", "box", "box.patio", "patio"})
    List<Estacionamento> findAllAtivosCompleto();

    /**
     * Estatísticas de ocupação por pátio
     */
    @Query(value = """
        SELECT 
            p.ID_PATIO as idPatio,
            p.NOME_PATIO as nomePatio,
            COUNT(DISTINCT CASE WHEN e.ESTA_ESTACIONADO = 1 THEN e.ID_ESTACIONAMENTO END) as veiculosEstacionados,
            COUNT(DISTINCT b.ID_BOX) as totalBoxes,
            COUNT(DISTINCT CASE WHEN b.STATUS = 'L' THEN b.ID_BOX END) as boxesLivres,
            COUNT(DISTINCT CASE WHEN b.STATUS = 'O' THEN b.ID_BOX END) as boxesOcupados
        FROM TB_PATIO p
        LEFT JOIN TB_BOX b ON p.ID_PATIO = b.TB_PATIO_ID_PATIO
        LEFT JOIN TB_ESTACIONAMENTO e ON b.ID_BOX = e.TB_BOX_ID_BOX
        WHERE p.ID_PATIO = :patioId
        GROUP BY p.ID_PATIO, p.NOME_PATIO
        """, nativeQuery = true)
    Object[] findEstatisticasOcupacaoPorPatio(@Param("patioId") Long patioId);

    /**
     * Conta total de estacionamentos ativos
     */
    long countByEstaEstacionadoTrue();

    /**
     * Verifica se um veículo está estacionado
     */
    boolean existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(Long veiculoId);

    /**
     * Verifica se um veículo está estacionado por placa
     */
    @Query("SELECT COUNT(e) > 0 FROM Estacionamento e " +
           "JOIN e.veiculo v " +
           "WHERE UPPER(v.placa) = UPPER(:placa) AND e.estaEstacionado = true")
    boolean existsByPlacaAndEstaEstacionadoTrue(@Param("placa") String placa);
}

