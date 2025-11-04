// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\VeiculoPatioRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.VeiculoPatio;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VeiculoPatioRepository extends JpaRepository<VeiculoPatio, VeiculoPatioId>, JpaSpecificationExecutor<VeiculoPatio> {
    
    @Query("SELECT COUNT(vp) FROM VeiculoPatio vp WHERE vp.patio.idPatio = :patioId")
    long countByPatioIdPatio(@Param("patioId") Long patioId);
}