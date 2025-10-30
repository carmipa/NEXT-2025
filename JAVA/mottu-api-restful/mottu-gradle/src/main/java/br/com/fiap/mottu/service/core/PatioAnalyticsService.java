package br.com.fiap.mottu.service.core;

import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class PatioAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(PatioAnalyticsService.class);
    private final PatioRepository patioRepository;
    private final BoxRepository boxRepository;

    public PatioAnalyticsService(PatioRepository patioRepository, BoxRepository boxRepository) {
        this.patioRepository = patioRepository;
        this.boxRepository = boxRepository;
    }

    /**
     * Obtém analytics de pátios
     */
    public Map<String, Object> getAnalyticsPatios() {
        log.info("Gerando analytics de pátios");
        
        List<Patio> patios = patioRepository.findAll();
        
        // Calcular métricas por pátio
        List<Map<String, Object>> metricasPatios = patios.stream()
                .map(this::calcularMetricasPatio)
                .toList();
        
        // Calcular métricas gerais
        long totalPatios = patios.size();
        long totalBoxes = boxRepository.count();
        long boxesOcupados = boxRepository.countByStatus("O");
        double taxaOcupacaoGeral = totalBoxes > 0 ? (double) boxesOcupados / totalBoxes * 100 : 0.0;
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalPatios", totalPatios);
        analytics.put("totalBoxes", totalBoxes);
        analytics.put("boxesOcupados", boxesOcupados);
        analytics.put("taxaOcupacaoGeral", Math.round(taxaOcupacaoGeral * 100) / 100.0);
        analytics.put("metricasPatios", metricasPatios);
        analytics.put("timestamp", LocalDateTime.now());
        
        log.info("Analytics de pátios gerados com sucesso");
        return analytics;
    }

    /**
     * Calcula métricas de um pátio específico
     */
    private Map<String, Object> calcularMetricasPatio(Patio patio) {
        List<Box> boxes = boxRepository.findByPatio(patio);
        
        int totalBoxes = boxes.size();
        int boxesOcupados = (int) boxes.stream().filter(Box::isOcupado).count();
        double taxaOcupacao = totalBoxes > 0 ? (double) boxesOcupados / totalBoxes * 100 : 0.0;
        
        Map<String, Object> metricas = new HashMap<>();
        metricas.put("patioId", patio.getIdPatio());
        metricas.put("nomePatio", patio.getNomePatio());
        metricas.put("totalBoxes", totalBoxes);
        metricas.put("boxesOcupados", boxesOcupados);
        metricas.put("boxesLivres", totalBoxes - boxesOcupados);
        metricas.put("taxaOcupacao", Math.round(taxaOcupacao * 100) / 100.0);
        metricas.put("status", patio.getStatus());
        
        return metricas;
    }
}
