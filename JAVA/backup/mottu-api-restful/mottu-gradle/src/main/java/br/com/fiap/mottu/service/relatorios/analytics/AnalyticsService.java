package br.com.fiap.mottu.service.relatorios.analytics;

import br.com.fiap.mottu.dto.relatorio.analytics.AnalyticsKpiDto;
import br.com.fiap.mottu.dto.relatorio.analytics.TopVeiculoDto;
import br.com.fiap.mottu.dto.relatorio.analytics.TopBoxDto;
import br.com.fiap.mottu.dto.relatorio.analytics.TopPatioDto;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AnalyticsService {

    private final LogMovimentacaoRepository logRepository;

    public AnalyticsService(LogMovimentacaoRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Cacheable(value = "relatorioAnalytics", key = "'kpis'", unless = "#result == null")
    public AnalyticsKpiDto obterKpis() {
        // Período padrão: últimos 30 dias
        LocalDate fim = LocalDate.now();
        LocalDate inicio = fim.minusDays(30);
        return obterKpisPeriodo(inicio.atStartOfDay(), fim.atTime(23,59,59));
    }

    public AnalyticsKpiDto obterKpisPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        AnalyticsKpiDto dto = new AnalyticsKpiDto();
        long totalEventos = logRepository.countByDataHoraMovimentacaoBetween(inicio, fim);

        // Aproximação para usuários únicos: distintos de veículo em logs do período
        long usuariosUnicos = logRepository.findByDataHoraMovimentacaoBetween(inicio, fim).stream()
                .map(l -> l.getVeiculo() != null ? l.getVeiculo().getIdVeiculo() : null)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();

        // Conversão de exemplo: entradas / total * 100
        Long entradas = logRepository.countByTipoMovimentacaoAndPeriodo(
                br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao.ENTRADA, inicio, fim);
        double conversao = (totalEventos > 0 && entradas != null) ? (entradas * 100.0 / totalEventos) : 0.0;

        dto.setTotalEventos(totalEventos);
        dto.setUsuariosUnicos(usuariosUnicos);
        dto.setConversaoPercent(conversao);
        return dto;
    }

    public java.util.List<TopVeiculoDto> topVeiculos(int limit) {
        return logRepository.findTopVeiculosFrequentes(org.springframework.data.domain.PageRequest.of(0, limit)).stream()
                .map(arr -> new TopVeiculoDto(
                        ((Number) arr[0]).longValue(),
                        (String) arr[1],
                        ((Number) arr[2]).longValue()
                ))
                .toList();
    }

    public java.util.List<TopBoxDto> topBoxes(int limit) {
        return logRepository.findTopBoxesUtilizados(org.springframework.data.domain.PageRequest.of(0, limit)).stream()
                .map(arr -> new TopBoxDto(
                        ((Number) arr[0]).longValue(),
                        (String) arr[1],
                        ((Number) arr[2]).longValue()
                ))
                .toList();
    }

    public java.util.List<TopPatioDto> topPatios(int limit) {
        return logRepository.findTopPatios(org.springframework.data.domain.PageRequest.of(0, limit)).stream()
                .map(arr -> new TopPatioDto(
                        ((Number) arr[0]).longValue(),
                        (String) arr[1],
                        ((Number) arr[2]).longValue()
                ))
                .toList();
    }
}


