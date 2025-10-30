// Caminho do arquivo: br\com\fiap\mottu\repository\ContatoRepository.java
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Contato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ContatoRepository extends JpaRepository<Contato, Long>, JpaSpecificationExecutor<Contato> {
    // Você pode adicionar métodos de busca por email, telefone, etc.
    Optional<Contato> findByEmail(String email);
    List<Contato> findByCelularContaining(String celular); // Exemplo de busca parcial por celular
    List<Contato> findByDddAndTelefone1(Integer ddd, String telefone1); // Exemplo de combinação
}