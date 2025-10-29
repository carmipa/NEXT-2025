package br.com.fiap.mottu.service.relatorios;

import br.com.fiap.mottu.dto.relatorio.PerformancePatioDto;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PerformanceService {

    private static final Logger log = LoggerFactory.getLogger(PerformanceService.class);
    private final PatioRepository patioRepository;
    private final BoxRepository boxRepository;
    private final LogMovimentacaoRepository logMovimentacaoRepository;

    public PerformanceService(PatioRepository patioRepository, 
                             BoxRepository boxRepository,
                             LogMovimentacaoRepository logMovimentacaoRepository) {
        this.patioRepository = patioRepository;
        this.boxRepository = boxRepository;
        this.logMovimentacaoRepository = logMovimentacaoRepository;
    }

    /**
     * Obtém performance de todos os pátios
     */
    public List<PerformancePatioDto> getPerformancePatios() {
        log.info("Gerando relatório de performance dos pátios");
        
        List<Patio> patios = patioRepository.findAll();
        
        return patios.stream()
                .map(this::calcularPerformancePatio)
                .collect(Collectors.toList());
    }

    /**
     * Obtém performance de um pátio específico
     */
    public PerformancePatioDto getPerformancePatio(Long patioId) {
        log.info("Gerando relatório de performance para pátio ID: {}", patioId);
        
        Patio patio = patioRepository.findById(patioId)
                .orElseThrow(() -> new RuntimeException("Pátio não encontrado: " + patioId));
        
        return calcularPerformancePatio(patio);
    }

    /**
     * Calcula a performance de um pátio
     */
    private PerformancePatioDto calcularPerformancePatio(Patio patio) {
        List<Box> boxes = boxRepository.findByPatio(patio);
        List<LogMovimentacao> movimentacoes = logMovimentacaoRepository.findByPatioIdPatioOrderByDataHoraMovimentacaoDesc(patio.getIdPatio());
        
        int totalBoxes = boxes.size();
        int boxesOcupados = (int) boxes.stream().filter(Box::isOcupado).count();
        double taxaOcupacao = totalBoxes > 0 ? (double) boxesOcupados / totalBoxes * 100 : 0.0;
        
        // Calcular tempo médio de estacionamento
        double tempoMedioEstacionamento = calcularTempoMedioEstacionamento(movimentacoes);
        
        // Calcular ranking (simplificado) - removido pois não é usado no DTO
        // int ranking = calcularRanking(patio, taxaOcupacao);
        
        return PerformancePatioDto.builder()
                .patioId(patio.getIdPatio())
                .nomePatio(patio.getNomePatio())
                .taxaOcupacaoMedia(taxaOcupacao)
                .tempoMedioEstacionamento(tempoMedioEstacionamento)
                .totalMovimentacoes((long) movimentacoes.size())
                .build();
    }

    /**
     * Calcula tempo médio de estacionamento
     */
    private double calcularTempoMedioEstacionamento(List<LogMovimentacao> movimentacoes) {
        if (movimentacoes.isEmpty()) return 0.0;
        
        // Simplificado: calcular baseado em movimentações de entrada e saída
        long totalMinutos = movimentacoes.stream()
                .filter(mov -> mov.getTipoMovimentacao() == LogMovimentacao.TipoMovimentacao.SAIDA)
                .mapToLong(mov -> {
                    // Buscar entrada correspondente
                    LocalDateTime entrada = mov.getDataHoraMovimentacao().minusHours(2); // Simplificado
                    return ChronoUnit.MINUTES.between(entrada, mov.getDataHoraMovimentacao());
                })
                .sum();
        
        return movimentacoes.size() > 0 ? (double) totalMinutos / movimentacoes.size() : 0.0;
    }

    // Método removido temporariamente - não está sendo usado
    // private int calcularRanking(Patio patio, double taxaOcupacao) {
    //     if (taxaOcupacao >= 90) return 1;
    //     if (taxaOcupacao >= 70) return 2;
    //     if (taxaOcupacao >= 50) return 3;
    //     return 4;
    // }

    /**
     * Obtém tempo médio de estacionamento global
     */
    public Double getTempoMedioEstacionamentoGlobal() {
        log.info("Calculando tempo médio de estacionamento global");
        
        List<LogMovimentacao> todasMovimentacoes = logMovimentacaoRepository.findAll();
        return calcularTempoMedioEstacionamento(todasMovimentacoes);
    }
}
