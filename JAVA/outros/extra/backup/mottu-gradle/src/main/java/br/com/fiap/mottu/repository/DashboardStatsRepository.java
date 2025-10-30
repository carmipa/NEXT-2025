// Repository
package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.model.Box;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@org.springframework.stereotype.Repository
public interface DashboardStatsRepository extends org.springframework.data.repository.Repository<Box, Long> {

    @Query("select count(b) from Box b")
    long countBoxes();

    @Query("select count(b) from Box b where b.status = 'O'")
    long countBoxesOcupados();

    @Query("select count(b) from Box b where b.status = 'L'")
    long countBoxesLivres();

    @Query("""
        select new br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto(
            b.dataEntrada,
            sum(case when b.status = 'O' then 1 else 0 end),
            sum(case when b.status = 'L' then 1 else 0 end)
        )
        from Box b
        where b.dataEntrada between :ini and :fim
        group by b.dataEntrada
        order by b.dataEntrada
    """)
    List<OcupacaoDiaDto> ocupacaoPorDia(@Param("ini") LocalDate ini,
                                        @Param("fim") LocalDate fim);
}
