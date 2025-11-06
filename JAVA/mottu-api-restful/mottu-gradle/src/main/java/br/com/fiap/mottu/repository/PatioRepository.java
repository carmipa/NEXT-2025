// Caminho: src/main/java/br/com/fiap/mottu/repository/PatioRepository.java
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Patio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatioRepository extends JpaRepository<Patio, Long>, JpaSpecificationExecutor<Patio> {

    // CORREÇÃO: Adicionada a anotação @EntityGraph
    // Isso força o JPA a carregar as entidades 'contato' e 'endereco' na mesma consulta,
    // resolvendo o problema de dados ausentes no frontend.
    @Override
    @EntityGraph(attributePaths = {"contato", "endereco"})
    Page<Patio> findAll(Pageable pageable);

    @Query("SELECT p FROM Patio p WHERE p.idPatio = :idPatio")
    Optional<Patio> findByIdPatio(@Param("idPatio") Long idPatio);

    List<Patio> findByNomePatioContainingIgnoreCase(String nomePatio);

    Optional<Patio> findByNomePatioIgnoreCase(String nomePatio);

    boolean existsByNomePatioIgnoreCase(String nomePatio);

    List<Patio> findByDataCadastroBetween(LocalDate startDate, LocalDate endDate);

    List<Patio> findByStatus(String status);

    @Query("SELECT p FROM Patio p LEFT JOIN FETCH p.zonas WHERE p.idPatio = :idPatio")
    Optional<Patio> findByIdWithZonas(@Param("idPatio") Long idPatio);

    @Query("SELECT p FROM Patio p LEFT JOIN FETCH p.contato LEFT JOIN FETCH p.endereco WHERE p.idPatio = :idPatio")
    Optional<Patio> findByIdWithContatoAndEndereco(@Param("idPatio") Long idPatio);
    
    // Atualizar apenas o status do pátio sem tocar nos relacionamentos
    @Modifying
    @Query("UPDATE Patio p SET p.status = :status WHERE p.idPatio = :idPatio")
    int updateStatus(@Param("idPatio") Long idPatio, @Param("status") String status);
    
    // Método para obter ocupação atual dos pátios
    @Query(value = """
        SELECT p.NOME_PATIO as nomePatio,
               COUNT(b.ID_BOX) as totalBoxes,
               COUNT(CASE WHEN b.STATUS = 'O' THEN 1 END) as boxesOcupados
        FROM TB_PATIO p
        LEFT JOIN TB_BOX b ON p.ID_PATIO = b.PATIO_ID
        GROUP BY p.ID_PATIO, p.NOME_PATIO
        """, nativeQuery = true)
    List<Object[]> findOcupacaoAtual();
}