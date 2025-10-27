package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Rastreamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface RastreamentoRepository extends JpaRepository<Rastreamento, Long>, JpaSpecificationExecutor<Rastreamento> {
    Optional<Rastreamento> findById(Long idRastreamento);
    // Já disponível

    // Remova os métodos abaixo:
    // List<Rastreamento> findByIpsContainingIgnoreCase(String ips);
    // List<Rastreamento> findByGprsContainingIgnoreCase(String gprs);
    // Optional<Rastreamento> findByIpsIgnoreCase(String ips);
    // Optional<Rastreamento> findByGprsIgnoreCase(String gprs);
    // boolean existsByIpsIgnoreCase(String ips);
    // boolean existsByGprsIgnoreCase(String gprs);

    // Você pode adicionar métodos de busca por coordenadas específicas, se precisar
    // Por exemplo:
    // Optional<Rastreamento> findByIpsXAndIpsYAndIpsZ(Double ipsX, Double ipsY, Double ipsZ);
    // List<Rastreamento> findByGprsLatitudeBetweenAndGprsLongitudeBetween(Double minLat, Double maxLat, Double minLong, Double maxLong);
}