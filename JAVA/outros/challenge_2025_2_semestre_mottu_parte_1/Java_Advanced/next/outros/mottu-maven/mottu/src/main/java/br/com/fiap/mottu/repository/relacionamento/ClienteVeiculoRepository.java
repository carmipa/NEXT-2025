// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\ClienteVeiculoRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.ClienteVeiculo;
import br.com.fiap.mottu.model.relacionamento.ClienteVeiculoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteVeiculoRepository extends JpaRepository<ClienteVeiculo, ClienteVeiculoId>, JpaSpecificationExecutor<ClienteVeiculo> {
    // Métodos customizados podem ser úteis aqui
    List<ClienteVeiculo> findById_ClienteId(Long clienteId);
    List<ClienteVeiculo> findById_VeiculoId(Long veiculoId);
}