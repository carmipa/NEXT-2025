// Caminho do arquivo: br\com\fiap\mottu\repository\VeiculoRepository.java
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, Long>, JpaSpecificationExecutor<Veiculo> {
    // Métodos de pesquisa avançada (derivados):
    // Veiculo: placa, id, renavam, chassi, modelo, fabricante, ano, combustivel
    Optional<Veiculo> findByPlaca(String placa);
    Optional<Veiculo> findById(Long idVeiculo); // Já disponível, mas explicitando
    Optional<Veiculo> findByRenavam(String renavam);
    Optional<Veiculo> findByChassi(String chassi);
    List<Veiculo> findByModeloContainingIgnoreCase(String modelo);
    List<Veiculo> findByFabricanteContainingIgnoreCase(String fabricante);
    List<Veiculo> findByAno(Integer ano); // Busca exata por ano
    List<Veiculo> findByAnoBetween(Integer startAno, Integer endAno); // Busca por intervalo de ano
    List<Veiculo> findByCombustivelContainingIgnoreCase(String combustivel);
}