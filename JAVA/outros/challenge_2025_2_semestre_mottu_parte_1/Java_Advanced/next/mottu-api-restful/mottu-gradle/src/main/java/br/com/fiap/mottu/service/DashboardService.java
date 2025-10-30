package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.dto.dashboard.ResumoOcupacaoDto;
import br.com.fiap.mottu.repository.DashboardStatsRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final DashboardStatsRepository repo;
    private final VeiculoRepository veiculoRepository;
    private final ClienteRepository clienteRepository;

    public DashboardService(DashboardStatsRepository repo, VeiculoRepository veiculoRepository, ClienteRepository clienteRepository) {
        this.repo = repo;
        this.veiculoRepository = veiculoRepository;
        this.clienteRepository = clienteRepository;
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

    // NOVO: Método para obter total de veículos cadastrados
    public long getTotalVeiculos() {
        return veiculoRepository.count();
    }

    // NOVO: Método para obter total de clientes cadastrados
    public long getTotalClientes() {
        return clienteRepository.count();
    }
}
