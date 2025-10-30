// Caminho do arquivo: br\com\fiap\mottu\repository\ClienteRepository.java
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long>, JpaSpecificationExecutor<Cliente> {
    // Métodos de pesquisa avançada (derivados):
    // Cliente: cpf, id, nome, data de cadastro
    Optional<Cliente> findByCpf(String cpf);
    Optional<Cliente> findById(Long idCliente); // Já disponível, mas explicitando
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
    List<Cliente> findByDataCadastroBetween(LocalDate startDate, LocalDate endDate);

}