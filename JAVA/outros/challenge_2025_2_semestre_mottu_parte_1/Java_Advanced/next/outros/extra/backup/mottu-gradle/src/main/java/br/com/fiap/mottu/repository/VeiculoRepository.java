package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, Long>, JpaSpecificationExecutor<Veiculo> {

    // ====== SEUS MÉTODOS ORIGINAIS (mantidos) ======
    Optional<Veiculo> findByPlaca(String placa);
    Optional<Veiculo> findByRenavam(String renavam);
    Optional<Veiculo> findByChassi(String chassi);
    Optional<Veiculo> findByTagBleId(String tagBleId); // NOVO MÉTODO

    List<Veiculo> findByModeloContainingIgnoreCase(String modelo);
    List<Veiculo> findByFabricanteContainingIgnoreCase(String fabricante);
    List<Veiculo> findByAno(Integer ano); // <-- corrigido: removido o 'A' que quebrava a compilação
    List<Veiculo> findByAnoBetween(Integer startAno, Integer endAno);
    List<Veiculo> findByCombustivelContainingIgnoreCase(String combustivel);

    // ====== ADIÇÕES MÍNIMAS (para o fluxo de OCR/estacionamento) ======
    /**
     * Match exato ignorando caixa. Evita depender do formato de caixa que o OCR/normalização devolver.
     */
    Optional<Veiculo> findByPlacaIgnoreCase(String placa);

    /**
     * Útil para validações rápidas de existência (opcional).
     */
    boolean existsByPlacaIgnoreCase(String placa);

    /**
     * Lista todas as placas em UPPERCASE — usada pelo fuzzy match após normalização Mercosul.
     */
    @Query("select upper(v.placa) from Veiculo v")
    List<String> listarPlacas();
}
