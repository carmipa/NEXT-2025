// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\EnderecoPatioRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.EnderecoPatio;
import br.com.fiap.mottu.model.relacionamento.EnderecoPatioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EnderecoPatioRepository extends JpaRepository<EnderecoPatio, EnderecoPatioId>, JpaSpecificationExecutor<EnderecoPatio> {
    // Adicione métodos de busca específicos se precisar
}