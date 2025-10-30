// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\VeiculoBoxRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.VeiculoBox;
import br.com.fiap.mottu.model.relacionamento.VeiculoBoxId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface VeiculoBoxRepository extends JpaRepository<VeiculoBox, VeiculoBoxId>, JpaSpecificationExecutor<VeiculoBox> {
    // Adicione métodos de busca específicos se precisar
}