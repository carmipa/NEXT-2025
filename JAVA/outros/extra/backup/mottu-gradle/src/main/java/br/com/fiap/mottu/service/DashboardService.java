package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.dto.dashboard.ResumoOcupacaoDto;
import br.com.fiap.mottu.repository.DashboardStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final DashboardStatsRepository repo;

    public DashboardService(DashboardStatsRepository repo) {
        this.repo = repo;
    }

    public ResumoOcupacaoDto getResumoAtual() {
        long total  = repo.countBoxes();
        long ocup   = repo.countBoxesOcupados();
        long livres = repo.countBoxesLivres(); // ou total - ocup
        return new ResumoOcupacaoDto(total, ocup, livres);
    }

    public List<OcupacaoDiaDto> getOcupacaoPorDia(LocalDate ini, LocalDate fim) {
        return repo.ocupacaoPorDia(ini, fim);
    }
}
