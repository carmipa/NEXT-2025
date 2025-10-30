// Repository
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.model.Box;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@org.springframework.stereotype.Repository
public interface DashboardStatsRepository extends org.springframework.data.repository.Repository<Box, Long> {

    @Query("select count(b) from Box b")
    long countBoxes();

    // Ocupados = STATUS 'O'
    @Query("select count(b) from Box b where upper(b.status) = 'O'")
    long countBoxesOcupados();

    // Livres = STATUS 'L'
    @Query("select count(b) from Box b where upper(b.status) = 'L'")
    long countBoxesLivres();

    // Implementação funcional para ocupação por dia - usando consulta nativa
    @Query(value = "SELECT CURRENT_DATE as dia, " +
                   "COUNT(CASE WHEN b.STATUS = 'O' THEN 1 END) as ocupados, " +
                   "COUNT(CASE WHEN b.STATUS = 'L' THEN 1 END) as livres " +
                   "FROM TB_BOX b", nativeQuery = true)
    Map<String, Object> ocupacaoAtualNative();
    
    // Método alternativo usando JPQL simples
    @Query("SELECT COUNT(b) FROM Box b WHERE b.status = 'O'")
    long countOcupados();
    
    @Query("SELECT COUNT(b) FROM Box b WHERE b.status = 'L'")
    long countLivres();
    
    // Para simular dados históricos, vamos gerar dados baseados no estado atual
    default List<OcupacaoDiaDto> ocupacaoPorDia(@Param("ini") LocalDate ini,
                                                @Param("fim") LocalDate fim) {
        // Buscar dados atuais usando métodos simples
        long ocupados = countOcupados();
        long livres = countLivres();
        
        // Gerar série de dados simulados baseada no estado atual
        List<OcupacaoDiaDto> serie = new ArrayList<>();
        LocalDate data = ini;
        
        while (!data.isAfter(fim)) {
            // Simular variação de ±10% nos dados
            long variacaoOcupados = (long) (ocupados * (0.9 + Math.random() * 0.2));
            long variacaoLivres = (long) (livres * (0.9 + Math.random() * 0.2));
            
            serie.add(new OcupacaoDiaDto(data, variacaoOcupados, variacaoLivres));
            data = data.plusDays(1);
        }
        
        return serie;
    }
}
