// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\VeiculoZonaRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.VeiculoZona;
import br.com.fiap.mottu.model.relacionamento.VeiculoZonaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface VeiculoZonaRepository extends JpaRepository<VeiculoZona, VeiculoZonaId>, JpaSpecificationExecutor<VeiculoZona> {
    // Adicione métodos de busca específicos se precisar
}