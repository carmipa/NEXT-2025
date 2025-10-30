// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\VeiculoRastreamentoRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento;
import br.com.fiap.mottu.model.relacionamento.VeiculoRastreamentoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface VeiculoRastreamentoRepository extends JpaRepository<VeiculoRastreamento, VeiculoRastreamentoId>, JpaSpecificationExecutor<VeiculoRastreamento> {
    // Adicione métodos de busca específicos se precisar
}