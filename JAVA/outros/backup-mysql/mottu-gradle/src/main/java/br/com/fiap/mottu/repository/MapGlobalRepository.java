package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.dto.mapglobal.MapGlobalPatioDto;
import br.com.fiap.mottu.model.Patio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para dados do mapa global
 */
@Repository
public interface MapGlobalRepository extends JpaRepository<Patio, Long> {
    
    /**
     * Busca todos os pátios com informações completas para o mapa global
     */
    @Query("""
        SELECT new br.com.fiap.mottu.dto.mapglobal.MapGlobalPatioDto(
            p.idPatio,
            p.nomePatio,
            CONCAT(e.logradouro, ', ', e.numero, ' - ', e.bairro),
            e.cidade,
            e.estado,
            e.cep,
            e.pais,
            COALESCE(COUNT(b.idBox), 0),
            COALESCE(COUNT(CASE WHEN b.status = 'L' THEN 1 END), 0),
            COALESCE(COUNT(CASE WHEN b.status = 'O' THEN 1 END), 0),
            COALESCE(COUNT(CASE WHEN b.status = 'M' THEN 1 END), 0),
            CASE 
                WHEN COUNT(b.idBox) > 0 THEN 
                    (COUNT(CASE WHEN b.status = 'O' THEN 1 END) * 100.0 / COUNT(b.idBox))
                ELSE 0.0 
            END,
            p.status
        )
        FROM Patio p
        LEFT JOIN p.endereco e
        LEFT JOIN p.boxes b
        WHERE p.status = 'A'
        GROUP BY p.idPatio, p.nomePatio, e.logradouro, e.numero, e.bairro, 
                 e.cidade, e.estado, e.cep, e.pais, p.status
        ORDER BY p.nomePatio
        """)
    List<MapGlobalPatioDto> findAllPatiosParaMapa();
    
    /**
     * Busca pátios com paginação para o mapa global
     */
    @Query("""
        SELECT new br.com.fiap.mottu.dto.mapglobal.MapGlobalPatioDto(
            p.idPatio,
            p.nomePatio,
            CONCAT(e.logradouro, ', ', e.numero, ' - ', e.bairro),
            e.cidade,
            e.estado,
            e.cep,
            e.pais,
            COUNT(b.idBox),
            COUNT(CASE WHEN b.status = 'L' THEN 1 END),
            COUNT(CASE WHEN b.status = 'O' THEN 1 END),
            COUNT(CASE WHEN b.status = 'M' THEN 1 END),
            CASE 
                WHEN COUNT(b.idBox) > 0 THEN 
                    (COUNT(CASE WHEN b.status = 'O' THEN 1 END) * 100.0 / COUNT(b.idBox))
                ELSE 0.0 
            END,
            p.status
        )
        FROM Patio p
        LEFT JOIN p.endereco e
        LEFT JOIN p.boxes b
        WHERE p.status = 'A'
        GROUP BY p.idPatio, p.nomePatio, e.logradouro, e.numero, e.bairro, 
                 e.cidade, e.estado, e.cep, e.pais, p.status
        ORDER BY p.nomePatio
        """)
    Page<MapGlobalPatioDto> findAllPatiosParaMapaPaginado(Pageable pageable);
    
    /**
     * Busca pátios por cidade
     */
    @Query("""
        SELECT new br.com.fiap.mottu.dto.mapglobal.MapGlobalPatioDto(
            p.idPatio,
            p.nomePatio,
            CONCAT(e.logradouro, ', ', e.numero, ' - ', e.bairro),
            e.cidade,
            e.estado,
            e.cep,
            e.pais,
            COUNT(b.idBox),
            COUNT(CASE WHEN b.status = 'L' THEN 1 END),
            COUNT(CASE WHEN b.status = 'O' THEN 1 END),
            COUNT(CASE WHEN b.status = 'M' THEN 1 END),
            CASE 
                WHEN COUNT(b.idBox) > 0 THEN 
                    (COUNT(CASE WHEN b.status = 'O' THEN 1 END) * 100.0 / COUNT(b.idBox))
                ELSE 0.0 
            END,
            p.status
        )
        FROM Patio p
        LEFT JOIN p.endereco e
        LEFT JOIN p.boxes b
        WHERE p.status = 'A' AND LOWER(e.cidade) LIKE LOWER(CONCAT('%', :cidade, '%'))
        GROUP BY p.idPatio, p.nomePatio, e.logradouro, e.numero, e.bairro, 
                 e.cidade, e.estado, e.cep, e.pais, p.status
        ORDER BY p.nomePatio
        """)
    List<MapGlobalPatioDto> findPatiosPorCidade(@Param("cidade") String cidade);
}
