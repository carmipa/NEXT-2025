// Caminho do arquivo: br\com\fiap\mottu\repository\EnderecoRepository.java
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long>, JpaSpecificationExecutor<Endereco> {
    // Métodos de pesquisa avançada (derivados):
    Optional<Endereco> findByCep(String cep);
    List<Endereco> findByCidadeContainingIgnoreCase(String cidade);
    List<Endereco> findByEstado(String estado);
    List<Endereco> findByLogradouroContainingIgnoreCase(String logradouro);
}