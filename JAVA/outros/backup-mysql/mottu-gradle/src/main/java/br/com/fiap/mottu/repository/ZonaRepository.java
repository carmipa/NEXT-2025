package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long>, JpaSpecificationExecutor<Zona> {
    
    List<Zona> findByNomeContainingIgnoreCase(String nome);
    
    Optional<Zona> findByNomeIgnoreCase(String nome);
    
    boolean existsByNomeIgnoreCase(String nome);
    
    boolean existsByNomeIgnoreCaseAndPatioIdPatio(String nome, Long patioId);
    
    List<Zona> findByPatioIdPatio(Long patioId);
    
    Page<Zona> findByPatioIdPatio(Long patioId, Pageable pageable);
    
    List<Zona> findByStatus(String status);
    
    @Query("SELECT z FROM Zona z WHERE z.patio.idPatio = :patioId AND z.nome = :nome")
    Optional<Zona> findByPatioIdAndNome(@Param("patioId") Long patioId, @Param("nome") String nome);
    
    @Query("SELECT COUNT(z) FROM Zona z WHERE z.patio.idPatio = :patioId")
    Long countByPatioIdPatio(@Param("patioId") Long patioId);
    
    @Query("SELECT z FROM Zona z LEFT JOIN FETCH z.patio WHERE z.idZona = :idZona")
    Optional<Zona> findByIdWithPatio(@Param("idZona") Long idZona);
}