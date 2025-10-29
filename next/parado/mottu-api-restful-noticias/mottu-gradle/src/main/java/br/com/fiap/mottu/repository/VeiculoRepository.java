package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Busca a última tag BLE usada para geração automática da próxima.
     * Retorna a tag com maior número sequencial (ex: TAG001, TAG002, etc.)
     */
    @Query("SELECT DISTINCT v FROM Veiculo v " +
           "LEFT JOIN FETCH v.veiculoBoxes vb " +
           "LEFT JOIN FETCH vb.box b " +
           "LEFT JOIN FETCH b.patio p " +
           "WHERE v.id = :veiculoId")
    Optional<Veiculo> findByIdWithAssociations(@Param("veiculoId") Long veiculoId);
    @Query("select v.tagBleId from Veiculo v where v.tagBleId is not null and v.tagBleId like 'TAG%' order by cast(substring(v.tagBleId, 4) as int) desc")
    List<String> findLastTagBleIds();
}
