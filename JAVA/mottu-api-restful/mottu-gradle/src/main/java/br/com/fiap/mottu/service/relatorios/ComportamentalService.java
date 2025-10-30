package br.com.fiap.mottu.service.relatorios;

import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ComportamentalService {

    private static final Logger log = LoggerFactory.getLogger(ComportamentalService.class);
    private final LogMovimentacaoRepository logMovimentacaoRepository;

    public ComportamentalService(LogMovimentacaoRepository logMovimentacaoRepository) {
        this.logMovimentacaoRepository = logMovimentacaoRepository;
    }

    /**
     * Obtém análise comportamental dos clientes
     */
    public Map<String, Object> getAnaliseComportamental() {
        log.info("Gerando análise comportamental");
        
        try {
            // Buscar dados reais de movimentação
            List<LogMovimentacao> movimentacoes = logMovimentacaoRepository.findAll();
            
            // Análise de horários de pico
            Map<String, Integer> horariosPico = new HashMap<>();
            Map<String, Integer> diasSemana = new HashMap<>();
            Map<String, Integer> tiposVeiculo = new HashMap<>();
            
            for (LogMovimentacao mov : movimentacoes) {
                // Horários de pico
                String hora = mov.getDataHoraMovimentacao().getHour() + ":00";
                horariosPico.put(hora, horariosPico.getOrDefault(hora, 0) + 1);
                
                // Dias da semana
                String diaSemana = mov.getDataHoraMovimentacao().getDayOfWeek().toString();
                diasSemana.put(diaSemana, diasSemana.getOrDefault(diaSemana, 0) + 1);
                
                // Tipos de veículo (se disponível)
                if (mov.getVeiculo() != null) {
                    String tipo = mov.getVeiculo().getFabricante();
                    tiposVeiculo.put(tipo, tiposVeiculo.getOrDefault(tipo, 0) + 1);
                }
            }
            
            // Calcular insights
            String horarioPico = horariosPico.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
                
            String diaMaisMovimentado = diasSemana.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
            
            // Gerar recomendações
            List<Map<String, Object>> recomendacoes = new ArrayList<>();
            if (horariosPico.containsKey("08:00") || horariosPico.containsKey("09:00")) {
                recomendacoes.add(Map.of(
                    "tipo", "Horário de Pico",
                    "descricao", "Maior movimento no período da manhã",
                    "acao", "Considere aumentar a capacidade nos horários de pico"
                ));
            }
            
            if (diasSemana.getOrDefault("MONDAY", 0) > diasSemana.getOrDefault("SUNDAY", 0)) {
                recomendacoes.add(Map.of(
                    "tipo", "Padrão Semanal",
                    "descricao", "Maior movimento em dias úteis",
                    "acao", "Otimize recursos para dias de semana"
                ));
            }
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("horariosPico", horariosPico);
            resultado.put("diasSemana", diasSemana);
            resultado.put("tiposVeiculo", tiposVeiculo);
            resultado.put("horarioPico", horarioPico);
            resultado.put("diaMaisMovimentado", diaMaisMovimentado);
            resultado.put("totalMovimentacoes", movimentacoes.size());
            resultado.put("recomendacoes", recomendacoes);
            resultado.put("timestamp", LocalDateTime.now());
            
            log.info("Análise comportamental gerada com sucesso");
            return resultado;
            
        } catch (Exception e) {
            log.error("Erro ao gerar análise comportamental", e);
            throw new RuntimeException("Erro ao gerar análise comportamental", e);
        }
    }
}
