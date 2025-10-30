// Caminho do arquivo: br\com\fiap\mottu\repository\ZonaRepository.java
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long>, JpaSpecificationExecutor<Zona> {
    Optional<Zona> findById(Long idZona); // Já disponível, mas explicitando
    List<Zona> findByNomeContainingIgnoreCase(String nome); // Mantido para buscas parciais
    Optional<Zona> findByNomeIgnoreCase(String nome); // ADICIONADO para checagem de duplicidade exata
    boolean existsByNomeIgnoreCase(String nome); // ADICIONADO como alternativa
    List<Zona> findByDataEntradaBetween(LocalDate startDate, LocalDate endDate);
    List<Zona> findByDataSaidaBetween(LocalDate startDate, LocalDate endDate);
}