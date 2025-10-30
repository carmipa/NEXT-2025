package br.com.fiap.mottu.service.dashboard;

import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class MetricasService {

    private static final Logger log = LoggerFactory.getLogger(MetricasService.class);
    private final PatioRepository patioRepository;
    private final BoxRepository boxRepository;
    private final LogMovimentacaoRepository logMovimentacaoRepository;

    public MetricasService(PatioRepository patioRepository, 
                          BoxRepository boxRepository,
                          LogMovimentacaoRepository logMovimentacaoRepository) {
        this.patioRepository = patioRepository;
        this.boxRepository = boxRepository;
        this.logMovimentacaoRepository = logMovimentacaoRepository;
    }

    /**
     * Obtém métricas gerais do sistema
     */
    public Map<String, Object> getMetricasGerais() {
        log.info("Gerando métricas gerais do sistema");
        
        // Contar pátios
        long totalPatios = patioRepository.count();
        
        // Contar boxes
        long totalBoxes = boxRepository.count();
        long boxesOcupados = boxRepository.countByStatus("O");
        long boxesLivres = totalBoxes - boxesOcupados;
        
        // Contar movimentações hoje
        LocalDateTime inicioHoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimHoje = LocalDateTime.now();
        long movimentacoesHoje = logMovimentacaoRepository.countByDataHoraMovimentacaoBetween(inicioHoje, fimHoje);
        
        // Calcular taxa de ocupação geral
        double taxaOcupacaoGeral = totalBoxes > 0 ? (double) boxesOcupados / totalBoxes * 100 : 0.0;
        
        Map<String, Object> metricas = new HashMap<>();
        metricas.put("totalPatios", totalPatios);
        metricas.put("totalBoxes", totalBoxes);
        metricas.put("boxesOcupados", boxesOcupados);
        metricas.put("boxesLivres", boxesLivres);
        metricas.put("taxaOcupacaoGeral", Math.round(taxaOcupacaoGeral * 100) / 100.0);
        metricas.put("movimentacoesHoje", movimentacoesHoje);
        metricas.put("timestamp", LocalDateTime.now());
        
        log.info("Métricas gerais geradas com sucesso");
        return metricas;
    }

    /**
     * Obtém métricas de performance
     */
    public Map<String, Object> getMetricasPerformance() {
        log.info("Gerando métricas de performance");
        
        // Calcular tempo médio de estacionamento
        List<LogMovimentacao> movimentacoes = logMovimentacaoRepository.findAll();
        double tempoMedioEstacionamento = calcularTempoMedioEstacionamento(movimentacoes);
        
        // Calcular eficiência do sistema
        long totalMovimentacoes = logMovimentacaoRepository.count();
        long entradas = logMovimentacaoRepository.countByTipoMovimentacao(LogMovimentacao.TipoMovimentacao.ENTRADA);
        long saidas = logMovimentacaoRepository.countByTipoMovimentacao(LogMovimentacao.TipoMovimentacao.SAIDA);
        
        double eficiencia = totalMovimentacoes > 0 ? (double) (entradas + saidas) / totalMovimentacoes * 100 : 0.0;
        
        Map<String, Object> metricas = new HashMap<>();
        metricas.put("tempoMedioEstacionamento", Math.round(tempoMedioEstacionamento * 100) / 100.0);
        metricas.put("eficienciaSistema", Math.round(eficiencia * 100) / 100.0);
        metricas.put("totalMovimentacoes", totalMovimentacoes);
        metricas.put("entradas", entradas);
        metricas.put("saidas", saidas);
        metricas.put("timestamp", LocalDateTime.now());
        
        log.info("Métricas de performance geradas com sucesso");
        return metricas;
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
                    // Buscar entrada correspondente (simplificado)
                    LocalDateTime entrada = mov.getDataHoraMovimentacao().minusHours(2);
                    return ChronoUnit.MINUTES.between(entrada, mov.getDataHoraMovimentacao());
                })
                .sum();
        
        return movimentacoes.size() > 0 ? (double) totalMinutos / movimentacoes.size() : 0.0;
    }
}
