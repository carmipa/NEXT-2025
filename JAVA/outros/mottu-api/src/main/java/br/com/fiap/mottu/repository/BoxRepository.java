// Caminho do arquivo: br\com\fiap\mottu\repository\BoxRepository.java
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Box;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BoxRepository extends JpaRepository<Box, Long>, JpaSpecificationExecutor<Box> {
    Optional<Box> findById(Long idBox); // Já disponível, mas explicitando
    List<Box> findByNomeContainingIgnoreCase(String nome); // Mantido para buscas parciais se necessário
    Optional<Box> findByNomeIgnoreCase(String nome); // ADICIONADO para checagem de duplicidade exata
    boolean existsByNomeIgnoreCase(String nome); // ADICIONADO como alternativa para checagem de duplicidade
    List<Box> findByDataEntradaBetween(LocalDate startDate, LocalDate endDate);
    List<Box> findByDataSaidaBetween(LocalDate startDate, LocalDate endDate);
}