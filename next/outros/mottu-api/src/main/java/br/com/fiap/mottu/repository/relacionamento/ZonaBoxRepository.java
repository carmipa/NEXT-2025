// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\ZonaBoxRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.ZonaBox;
import br.com.fiap.mottu.model.relacionamento.ZonaBoxId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ZonaBoxRepository extends JpaRepository<ZonaBox, ZonaBoxId>, JpaSpecificationExecutor<ZonaBox> {
    // Adicione métodos de busca específicos se precisar
}