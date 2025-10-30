// Caminho do arquivo: br\com\fiap\mottu\repository\relacionamento\ContatoPatioRepository.java
package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.ContatoPatio;
import br.com.fiap.mottu.model.relacionamento.ContatoPatioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ContatoPatioRepository extends JpaRepository<ContatoPatio, ContatoPatioId>, JpaSpecificationExecutor<ContatoPatio> {
    // Adicione métodos de busca específicos se precisar
}