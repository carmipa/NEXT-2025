// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\ZonaPatioRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.ZonaPatio;
import br.com.fiap.mottu.model.relacionamento.ZonaPatioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ZonaPatioRepository extends JpaRepository<ZonaPatio, ZonaPatioId>, JpaSpecificationExecutor<ZonaPatio> {
    // Adicione métodos de busca específicos se precisar
}