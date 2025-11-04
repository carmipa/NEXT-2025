package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.dashboard.OcupacaoDiaDto;
import br.com.fiap.mottu.dto.dashboard.ResumoOcupacaoDto;
import br.com.fiap.mottu.repository.DashboardStatsRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.ClienteRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class DashboardService {

    private final DashboardStatsRepository repo;
    private final VeiculoRepository veiculoRepository;
    private final ClienteRepository clienteRepository;
    private final EstacionamentoRepository estacionamentoRepository; // Adicionado para usar TB_ESTACIONAMENTO

    public DashboardService(DashboardStatsRepository repo, VeiculoRepository veiculoRepository, 
                           ClienteRepository clienteRepository, EstacionamentoRepository estacionamentoRepository) {
        this.repo = repo;
        this.veiculoRepository = veiculoRepository;
        this.clienteRepository = clienteRepository;
        this.estacionamentoRepository = estacionamentoRepository;
    }

    public ResumoOcupacaoDto getResumoAtual() {
        log.info("Gerando resumo de ocupação atual usando TB_ESTACIONAMENTO - DADOS REAIS");
        
        long total = repo.countBoxes();
        // Usar TB_ESTACIONAMENTO para contar boxes realmente ocupados
        long ocup = estacionamentoRepository.countByEstaEstacionadoTrue();
        long livres = total - ocup; // Boxes livres = total - ocupados
        
        log.debug("Resumo: {} boxes ocupados de {} total ({} livres)", ocup, total, livres);
        
        return new ResumoOcupacaoDto(total, ocup, livres);
    }

    public List<OcupacaoDiaDto> getOcupacaoPorDia(LocalDate ini, LocalDate fim) {
        log.info("Gerando ocupação por dia usando TB_ESTACIONAMENTO - DADOS REAIS ({} até {})", ini, fim);
        
        // Usar dados reais atuais do TB_ESTACIONAMENTO
        long ocupadosAtuais = estacionamentoRepository.countByEstaEstacionadoTrue();
        long totalBoxes = repo.countBoxes();
        long livresAtuais = totalBoxes - ocupadosAtuais;
        
        log.debug("Dados atuais: {} ocupados, {} livres de {} total", ocupadosAtuais, livresAtuais, totalBoxes);
        
        List<OcupacaoDiaDto> serie = new ArrayList<>();
        LocalDate data = ini;
        
        // Para cada dia no período, retornar os dados reais atuais
        // NOTA: Para histórico completo, seria necessário um sistema de log/snapshot diário
        // Por enquanto, retornamos os dados atuais para todos os dias do período
        while (!data.isAfter(fim)) {
            // Usar dados reais do sistema (sem variação artificial)
            serie.add(new OcupacaoDiaDto(data, ocupadosAtuais, livresAtuais));
            data = data.plusDays(1);
        }
        
        log.info("Gerados {} registros de ocupação para o período", serie.size());
        
        return serie;
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
