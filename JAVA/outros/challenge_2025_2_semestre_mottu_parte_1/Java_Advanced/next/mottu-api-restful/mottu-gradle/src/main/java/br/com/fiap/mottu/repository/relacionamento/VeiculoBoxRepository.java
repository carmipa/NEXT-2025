package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.VeiculoBox;
import br.com.fiap.mottu.model.relacionamento.VeiculoBoxId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeiculoBoxRepository extends JpaRepository<VeiculoBox, VeiculoBoxId> {
    
    @Query("SELECT vb FROM VeiculoBox vb WHERE vb.box.idBox = :boxId")
    List<VeiculoBox> findByBoxId(@Param("boxId") Long boxId);
    
    @Query("SELECT vb FROM VeiculoBox vb WHERE vb.veiculo.idVeiculo = :veiculoId")
    List<VeiculoBox> findByVeiculoId(@Param("veiculoId") Long veiculoId);
    
    @Query("SELECT COUNT(vb) FROM VeiculoBox vb WHERE vb.box.idBox = :boxId")
    Long countByBoxIdBox(@Param("boxId") Long boxId);
    
    @Query("SELECT COUNT(vb) FROM VeiculoBox vb WHERE vb.veiculo.idVeiculo = :veiculoId")
    Long countByVeiculoIdVeiculo(@Param("veiculoId") Long veiculoId);
    
    boolean existsByVeiculoIdVeiculoAndBoxIdBox(Long veiculoId, Long boxId);
}