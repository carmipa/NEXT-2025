package br.com.fiap.mottu.repository.relacionamento;

import br.com.fiap.mottu.model.relacionamento.PatioBox;
import br.com.fiap.mottu.model.relacionamento.PatioBoxId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PatioBoxRepository extends JpaRepository<PatioBox, PatioBoxId>, JpaSpecificationExecutor<PatioBox> {
    // Métodos customizados podem ser adicionados aqui se necessário
}