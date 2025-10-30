package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.VeiculoZona;
import br.com.fiap.mottu.model.relacionamento.VeiculoZonaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface VeiculoZonaRepository extends JpaRepository<VeiculoZona, VeiculoZonaId> {
    
    @Query("SELECT vz FROM VeiculoZona vz WHERE vz.zona.idZona = :zonaId")
    List<VeiculoZona> findByZonaId(@Param("zonaId") Long zonaId);
    
    @Query("SELECT vz FROM VeiculoZona vz WHERE vz.veiculo.idVeiculo = :veiculoId")
    List<VeiculoZona> findByVeiculoId(@Param("veiculoId") Long veiculoId);
    
    @Query("SELECT COUNT(vz) FROM VeiculoZona vz WHERE vz.zona.idZona = :zonaId")
    Long countByZonaIdZona(@Param("zonaId") Long zonaId);
    
    @Query("SELECT COUNT(vz) FROM VeiculoZona vz WHERE vz.veiculo.idVeiculo = :veiculoId")
    Long countByVeiculoIdVeiculo(@Param("veiculoId") Long veiculoId);
    
    boolean existsByVeiculoIdVeiculoAndZonaIdZona(Long veiculoId, Long zonaId);
}