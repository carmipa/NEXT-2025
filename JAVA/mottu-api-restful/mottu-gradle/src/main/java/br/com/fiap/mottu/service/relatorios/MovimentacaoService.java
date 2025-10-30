package br.com.fiap.mottu.service.relatorios;

import br.com.fiap.mottu.dto.relatorio.MovimentacaoDiariaDto;
import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MovimentacaoService {

    private static final Logger log = LoggerFactory.getLogger(MovimentacaoService.class);
    private final LogMovimentacaoRepository logMovimentacaoRepository;

    public MovimentacaoService(LogMovimentacaoRepository logMovimentacaoRepository) {
        this.logMovimentacaoRepository = logMovimentacaoRepository;
    }

    /**
     * Obtém movimentação diária por período - DADOS REAIS DO BANCO
     */
    public List<MovimentacaoDiariaDto> getMovimentacaoDiaria(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando relatório de movimentação diária REAL entre {} e {}", dataInicio, dataFim);
        
        // Buscar logs reais do banco de dados
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.atTime(23, 59, 59);
        
        List<LogMovimentacao> movimentacoes = logMovimentacaoRepository
                .findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(inicio, fim);
        
        log.info("Encontradas {} movimentações reais no período", movimentacoes.size());
        
        // Agrupar movimentações por data
        Map<LocalDate, List<LogMovimentacao>> movimentacoesPorData = movimentacoes.stream()
                .collect(Collectors.groupingBy(mov -> mov.getDataHoraMovimentacao().toLocalDate()));
        
        List<MovimentacaoDiariaDto> resultado = new ArrayList<>();
        
        // Processar cada dia no período
        LocalDate data = dataInicio;
        while (!data.isAfter(dataFim)) {
            List<LogMovimentacao> movsDoDia = movimentacoesPorData.getOrDefault(data, new ArrayList<>());
            
            long entradas = movsDoDia.stream()
                    .filter(mov -> mov.getTipoMovimentacao() == LogMovimentacao.TipoMovimentacao.ENTRADA)
                    .count();
            
            long saidas = movsDoDia.stream()
                    .filter(mov -> mov.getTipoMovimentacao() == LogMovimentacao.TipoMovimentacao.SAIDA)
                    .count();
            
            resultado.add(MovimentacaoDiariaDto.builder()
                    .data(data)
                    .entradas((int) entradas)
                    .saidas((int) saidas)
                    .totalMovimentacoes((int) (entradas + saidas))
                    .build());
            
            data = data.plusDays(1);
        }
        
        log.info("Relatório gerado com sucesso. {} dias processados, total de {} movimentações", 
                resultado.size(), movimentacoes.size());
        
        return resultado;
    }

    /**
     * Obtém movimentação por veículo
     */
    public List<MovimentacaoDiariaDto> getMovimentacaoPorVeiculo(Long veiculoId) {
        log.info("Gerando relatório de movimentação para veículo ID: {}", veiculoId);
        
        List<LogMovimentacao> movimentacoes = logMovimentacaoRepository
                .findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(veiculoId);
        
        // Agrupar por data
        Map<LocalDate, List<LogMovimentacao>> movimentacoesPorData = movimentacoes.stream()
                .collect(Collectors.groupingBy(mov -> mov.getDataHoraMovimentacao().toLocalDate()));
        
        return movimentacoesPorData.entrySet().stream()
                .map(entry -> {
                    LocalDate data = entry.getKey();
                    List<LogMovimentacao> movsDoDia = entry.getValue();
                    
                    long entradas = movsDoDia.stream()
                            .filter(mov -> mov.getTipoMovimentacao() == LogMovimentacao.TipoMovimentacao.ENTRADA)
                            .count();
                    
                    long saidas = movsDoDia.stream()
                            .filter(mov -> mov.getTipoMovimentacao() == LogMovimentacao.TipoMovimentacao.SAIDA)
                            .count();
                    
                    return MovimentacaoDiariaDto.builder()
                            .data(data)
                            .entradas((int) entradas)
                            .saidas((int) saidas)
                            .totalMovimentacoes((int) (entradas + saidas))
                            .build();
                })
                .sorted((a, b) -> a.getData().compareTo(b.getData()))
                .collect(Collectors.toList());
    }

    /**
     * Obtém detalhes completos de movimentações - DADOS REAIS PARA FRONTEND
     */
    public List<Object> getDetalhesCompletos(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando detalhes completos de movimentação entre {} e {}", dataInicio, dataFim);
        
        // Buscar logs reais do banco
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.atTime(23, 59, 59);
        
        List<LogMovimentacao> movimentacoes = logMovimentacaoRepository
                .findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(inicio, fim);
        
        log.info("Encontradas {} movimentações reais para detalhes", movimentacoes.size());
        
        // Converter para formato que o frontend precisa
        return movimentacoes.stream()
                .map(mov -> Map.of(
                        "id", mov.getIdLogMovimentacao(),
                        "placa", mov.getVeiculo() != null ? mov.getVeiculo().getPlaca() : "N/A",
                        "tipo", mov.getTipoMovimentacao().toString(),
                        "dataHora", mov.getDataHoraMovimentacao().toString(),
                        "patio", mov.getPatio() != null ? mov.getPatio().getNomePatio() : "N/A",
                        "box", mov.getBox() != null ? mov.getBox().getNome() : "N/A",
                        "status", "Concluído",
                        "observacoes", mov.getObservacoes() != null ? mov.getObservacoes() : ""
                ))
                .collect(Collectors.toList());
    }
}
