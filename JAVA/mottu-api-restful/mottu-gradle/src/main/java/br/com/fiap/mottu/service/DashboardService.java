package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.dto.dashboard.ResumoOcupacaoDto;
import br.com.fiap.mottu.repository.DashboardStatsRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
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
        // Implementação simplificada que usa dados atuais com variação baseada no dia da semana
        long ocupados = repo.countOcupados();
        long livres = repo.countLivres();
        
        List<OcupacaoDiaDto> serie = new ArrayList<>();
        LocalDate data = ini;
        
        while (!data.isAfter(fim)) {
            // Usar dados atuais com pequena variação baseada no dia da semana
            double fatorDia = calcularFatorDiaSemana(data);
            long variacaoOcupados = (long) (ocupados * fatorDia);
            long variacaoLivres = (long) (livres * (2.0 - fatorDia));
            
            serie.add(new OcupacaoDiaDto(data, variacaoOcupados, variacaoLivres));
            data = data.plusDays(1);
        }
        
        return serie;
    }
    
    // Calcular fator baseado no dia da semana (dados mais realistas)
    private double calcularFatorDiaSemana(LocalDate data) {
        java.time.DayOfWeek diaSemana = data.getDayOfWeek();
        switch (diaSemana) {
            case MONDAY:
            case TUESDAY:
            case WEDNESDAY:
            case THURSDAY:
            case FRIDAY:
                return 1.2; // Dias úteis - maior ocupação
            case SATURDAY:
                return 0.8; // Sábado - ocupação média
            case SUNDAY:
                return 0.6; // Domingo - menor ocupação
            default:
                return 1.0;
        }
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
