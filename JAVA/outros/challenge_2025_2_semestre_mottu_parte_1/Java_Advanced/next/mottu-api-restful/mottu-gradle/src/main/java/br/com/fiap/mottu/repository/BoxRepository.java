package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Box;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BoxRepository extends JpaRepository<Box, Long>, JpaSpecificationExecutor<Box> {
    
    List<Box> findByNomeContainingIgnoreCase(String nome);
    
    Optional<Box> findByNomeIgnoreCase(String nome);
    
    boolean existsByNomeIgnoreCase(String nome);
    
    boolean existsByNomeIgnoreCaseAndPatioIdPatio(String nome, Long patioId);
    
    List<Box> findByPatioIdPatio(Long patioId);
    
    Page<Box> findByPatioIdPatio(Long patioId, Pageable pageable);
    
    List<Box> findByStatus(String status);
    
    @Query("SELECT b FROM Box b WHERE b.patio.idPatio = :patioId AND b.nome = :nome")
    Optional<Box> findByPatioIdAndNome(@Param("patioId") Long patioId, @Param("nome") String nome);
    
    @Query("SELECT COUNT(b) FROM Box b WHERE b.patio.idPatio = :patioId")
    Long countByPatioIdPatio(@Param("patioId") Long patioId);
    
    @Query("SELECT COUNT(b) FROM Box b WHERE b.patio.idPatio = :patioId AND b.status = :status")
    Long countByPatioIdPatioAndStatus(@Param("patioId") Long patioId, @Param("status") String status);
    
    @Query("SELECT b FROM Box b LEFT JOIN FETCH b.patio WHERE b.idBox = :idBox")
    Optional<Box> findByIdWithPatio(@Param("idBox") Long idBox);
    
    @Query("SELECT b FROM Box b WHERE b.patio.idPatio = :patioId AND b.dataEntrada BETWEEN :inicio AND :fim")
    Set<Box> findByPatioIdPatioAndDataEntradaBetween(@Param("patioId") Long patioId, 
                                                     @Param("inicio") LocalDateTime inicio, 
                                                     @Param("fim") LocalDateTime fim);
    
    @Query("SELECT b FROM Box b WHERE b.patio.idPatio = :patioId AND b.dataEntrada IS NOT NULL AND b.dataSaida IS NULL")
    List<Box> findOcupadosByPatioId(@Param("patioId") Long patioId);
    
    @Query("SELECT b FROM Box b WHERE b.patio.idPatio = :patioId AND (b.dataEntrada IS NULL OR b.dataSaida IS NOT NULL)")
    List<Box> findDisponiveisByPatioId(@Param("patioId") Long patioId);
}