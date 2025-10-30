package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Rastreamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RastreamentoRepository extends JpaRepository<Rastreamento, Long>, JpaSpecificationExecutor<Rastreamento> {
    // Métodos de busca customizados podem ser adicionados aqui se necessário. Por exemplo:
    List<Rastreamento> findByDataHoraRegistroBetween(LocalDateTime start, LocalDateTime end);
}
