package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.relatorio.*;
import br.com.fiap.mottu.mapper.LogMovimentacaoMapper;
import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RelatorioService {

    private static final Logger log = LoggerFactory.getLogger(RelatorioService.class);

    private final LogMovimentacaoRepository logRepository;
    private final PatioRepository patioRepository;
    private final BoxRepository boxRepository;
    private final LogMovimentacaoMapper mapper;

    public RelatorioService(LogMovimentacaoRepository logRepository,
                           PatioRepository patioRepository,
                           BoxRepository boxRepository,
                           LogMovimentacaoMapper mapper) {
        this.logRepository = logRepository;
        this.patioRepository = patioRepository;
        this.boxRepository = boxRepository;
        this.mapper = mapper;
    }

    /**
     * Obtém ocupação atual de todos os pátios
     */
    public List<OcupacaoAtualDto> getOcupacaoAtual() {
        log.info("Gerando relatório de ocupação atual");
        
        List<Patio> patios = patioRepository.findAll();
        List<OcupacaoAtualDto> ocupacaoAtual = new ArrayList<>();

        for (Patio patio : patios) {
            List<br.com.fiap.mottu.model.Box> boxes = boxRepository.findByPatioIdPatio(patio.getIdPatio());
            int totalBoxes = boxes.size();
            int boxesOcupados = (int) boxes.stream().filter(box -> "O".equals(box.getStatus())).count();
            
            ocupacaoAtual.add(mapper.toOcupacaoAtualDto(patio, totalBoxes, boxesOcupados));
        }

        log.info("Relatório de ocupação atual gerado com sucesso. {} pátios analisados", patios.size());
        return ocupacaoAtual;
    }

    /**
     * Obtém ocupação atual de um pátio específico
     */
    public OcupacaoAtualDto getOcupacaoAtualPorPatio(Long patioId) {
        log.info("Gerando relatório de ocupação atual para o pátio {}", patioId);
        
        Patio patio = patioRepository.findById(patioId)
                .orElseThrow(() -> new RuntimeException("Pátio não encontrado com ID: " + patioId));

        List<br.com.fiap.mottu.model.Box> boxes = boxRepository.findByPatioIdPatio(patioId);
        int totalBoxes = boxes.size();
        int boxesOcupados = (int) boxes.stream().filter(box -> "O".equals(box.getStatus())).count();
        
        log.info("Relatório de ocupação do pátio {} gerado com sucesso", patioId);
        return mapper.toOcupacaoAtualDto(patio, totalBoxes, boxesOcupados);
    }

    /**
     * Obtém movimentação diária por período
     */
    public List<MovimentacaoDiariaDto> getMovimentacaoDiaria(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando relatório de movimentação diária entre {} e {}", dataInicio, dataFim);
        
        List<MovimentacaoDiariaDto> movimentacaoDiaria = new ArrayList<>();
        
        LocalDate dataAtual = dataInicio;
        while (!dataAtual.isAfter(dataFim)) {
            LocalDateTime inicioDia = dataAtual.atStartOfDay();
            LocalDateTime fimDia = dataAtual.atTime(23, 59, 59);
            
            Long entradas = logRepository.countByTipoMovimentacaoAndPeriodo(TipoMovimentacao.ENTRADA, inicioDia, fimDia);
            Long saidas = logRepository.countByTipoMovimentacaoAndPeriodo(TipoMovimentacao.SAIDA, inicioDia, fimDia);
            
            // Buscar movimentações do dia para análise detalhada
            List<LogMovimentacao> movimentacoes = logRepository.findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(inicioDia, fimDia);
            
            Double tempoMedioEstacionamento = calcularTempoMedioEstacionamento(movimentacoes);
            String patioMaisMovimentado = encontrarPatioMaisMovimentado(movimentacoes);
            String boxMaisUtilizado = encontrarBoxMaisUtilizado(movimentacoes);
            List<MovimentacaoDetalhadaDto> detalhes = mapper.toMovimentacaoDetalhadaDtoList(movimentacoes);
            
            movimentacaoDiaria.add(mapper.toMovimentacaoDiariaDto(
                    dataAtual, 
                    entradas.intValue(), 
                    saidas.intValue(), 
                    tempoMedioEstacionamento, 
                    patioMaisMovimentado, 
                    boxMaisUtilizado, 
                    detalhes
            ));
            
            dataAtual = dataAtual.plusDays(1);
        }
        
        log.info("Relatório de movimentação diária gerado com sucesso. {} dias analisados", 
                ChronoUnit.DAYS.between(dataInicio, dataFim) + 1);
        return movimentacaoDiaria;
    }

    /**
     * Obtém performance de todos os pátios
     */
    public List<PerformancePatioDto> getPerformancePatios() {
        log.info("Gerando relatório de performance dos pátios");
        
        List<Patio> patios = patioRepository.findAll();
        List<PerformancePatioDto> performancePatios = new ArrayList<>();
        
        for (Patio patio : patios) {
            // Calcular métricas do pátio
            Double tempoMedioEstacionamento = logRepository.findTempoMedioEstacionamentoPorPatio(patio.getIdPatio());
            Long totalMovimentacoes = logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(
                    patio.getIdPatio(), TipoMovimentacao.ENTRADA, 
                    LocalDateTime.now().minusMonths(1), LocalDateTime.now()) +
                    logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(
                            patio.getIdPatio(), TipoMovimentacao.SAIDA, 
                            LocalDateTime.now().minusMonths(1), LocalDateTime.now());
            
            Long totalEntradas = logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(
                    patio.getIdPatio(), TipoMovimentacao.ENTRADA, 
                    LocalDateTime.now().minusMonths(1), LocalDateTime.now());
            
            Long totalSaidas = logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(
                    patio.getIdPatio(), TipoMovimentacao.SAIDA, 
                    LocalDateTime.now().minusMonths(1), LocalDateTime.now());
            
            List<br.com.fiap.mottu.model.Box> boxes = boxRepository.findByPatioIdPatio(patio.getIdPatio());
            Integer totalBoxes = boxes.size();
            
            // Calcular taxa de ocupação média
            Double taxaOcupacaoMedia = calcularTaxaOcupacaoMedia(patio.getIdPatio());
            
            // Buscar top boxes e veículos
            List<TopBoxDto> topBoxes = getTopBoxesPorPatio(patio.getIdPatio());
            List<TopVeiculoDto> topVeiculos = getTopVeiculosPorPatio(patio.getIdPatio());
            
            performancePatios.add(mapper.toPerformancePatioDto(
                    patio, taxaOcupacaoMedia, tempoMedioEstacionamento, 
                    totalMovimentacoes, totalEntradas, totalSaidas, totalBoxes,
                    topBoxes, topVeiculos
            ));
        }
        
        log.info("Relatório de performance dos pátios gerado com sucesso. {} pátios analisados", patios.size());
        return performancePatios;
    }

    /**
     * Obtém tendências de ocupação
     */
    public TendenciaOcupacaoDto getTendenciasOcupacao() {
        log.info("Gerando relatório de tendências de ocupação");
        
        LocalDateTime inicio = LocalDateTime.now().minusDays(30);
        LocalDateTime fim = LocalDateTime.now();
        
        List<OcupacaoAtualDto> ocupacoes = getOcupacaoAtual();
        Double ocupacaoMedia = ocupacoes.stream()
                .mapToDouble(OcupacaoAtualDto::getTaxaOcupacao)
                .average()
                .orElse(0.0);
        
        Double ocupacaoMaxima = ocupacoes.stream()
                .mapToDouble(OcupacaoAtualDto::getTaxaOcupacao)
                .max()
                .orElse(0.0);
        
        Double ocupacaoMinima = ocupacoes.stream()
                .mapToDouble(OcupacaoAtualDto::getTaxaOcupacao)
                .min()
                .orElse(0.0);
        
        // Calcular tendência geral (simplificado)
        TendenciaOcupacaoDto.TendenciaGeral tendenciaGeral = determinarTendenciaGeral(ocupacaoMedia);
        
        // Calcular dias de alta e baixa ocupação
        Integer diasAltaOcupacao = calcularDiasAltaOcupacao(inicio, fim);
        Integer diasBaixaOcupacao = calcularDiasBaixaOcupacao(inicio, fim);
        
        // Gerar horários de pico e performance de pátios
        List<HorarioPicoDto> horariosPico = gerarHorariosPico();
        List<PatioPerformanceDto> pátiosPerformance = gerarPerformancePatios(ocupacoes);
        
        TendenciaOcupacaoDto tendencia = mapper.toTendenciaOcupacaoDto(
                "Últimos 30 dias", ocupacaoMedia, ocupacaoMaxima, ocupacaoMinima,
                diasAltaOcupacao, diasBaixaOcupacao, tendenciaGeral, 0.0
        );
        
        tendencia.setHorariosPico(horariosPico);
        tendencia.setPátiosPerformance(pátiosPerformance);
        
        log.info("Relatório de tendências de ocupação gerado com sucesso");
        return tendencia;
    }

    // Métodos auxiliares privados

    private Double calcularTempoMedioEstacionamento(List<LogMovimentacao> movimentacoes) {
        return movimentacoes.stream()
                .filter(m -> m.getTempoEstacionamentoMinutos() != null)
                .mapToLong(LogMovimentacao::getTempoEstacionamentoMinutos)
                .average()
                .orElse(0.0);
    }

    private String encontrarPatioMaisMovimentado(List<LogMovimentacao> movimentacoes) {
        return movimentacoes.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getPatio().getNomePatio(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .max(java.util.Map.Entry.comparingByValue())
                .map(java.util.Map.Entry::getKey)
                .orElse("N/A");
    }

    private String encontrarBoxMaisUtilizado(List<LogMovimentacao> movimentacoes) {
        return movimentacoes.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getBox().getNome(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .max(java.util.Map.Entry.comparingByValue())
                .map(java.util.Map.Entry::getKey)
                .orElse("N/A");
    }

    private Double calcularTaxaOcupacaoMedia(Long patioId) {
        List<br.com.fiap.mottu.model.Box> boxes = boxRepository.findByPatioIdPatio(patioId);
        if (boxes.isEmpty()) return 0.0;
        
        int boxesOcupados = (int) boxes.stream().filter(box -> "O".equals(box.getStatus())).count();
        return (boxesOcupados * 100.0) / boxes.size();
    }

    private List<TopBoxDto> getTopBoxesPorPatio(Long patioId) {
        List<Object[]> dados = logRepository.findTopBoxesUtilizados(
                org.springframework.data.domain.PageRequest.of(0, 5));
        
        return dados.stream()
                .map(dadosBox -> mapper.toTopBoxDto(dadosBox, 100L))
                .collect(Collectors.toList());
    }

    private List<TopVeiculoDto> getTopVeiculosPorPatio(Long patioId) {
        List<Object[]> dados = logRepository.findTopVeiculosFrequentes(
                org.springframework.data.domain.PageRequest.of(0, 5));
        
        return dados.stream()
                .map(mapper::toTopVeiculoDto)
                .collect(Collectors.toList());
    }

    private TendenciaOcupacaoDto.TendenciaGeral determinarTendenciaGeral(Double ocupacaoMedia) {
        if (ocupacaoMedia > 80) return TendenciaOcupacaoDto.TendenciaGeral.CRESCENTE;
        if (ocupacaoMedia < 50) return TendenciaOcupacaoDto.TendenciaGeral.DECRESCENTE;
        return TendenciaOcupacaoDto.TendenciaGeral.ESTAVEL;
    }

    private Integer calcularDiasAltaOcupacao(LocalDateTime inicio, LocalDateTime fim) {
        // Implementação simplificada - retorna valor estimado
        return 8;
    }

    private Integer calcularDiasBaixaOcupacao(LocalDateTime inicio, LocalDateTime fim) {
        // Implementação simplificada - retorna valor estimado
        return 3;
    }

    private List<HorarioPicoDto> gerarHorariosPico() {
        List<HorarioPicoDto> horarios = new ArrayList<>();
        
        horarios.add(mapper.toHorarioPicoDto("07:00", "09:00", 85.5, HorarioPicoDto.TipoPico.MANHA));
        horarios.add(mapper.toHorarioPicoDto("17:00", "19:00", 78.2, HorarioPicoDto.TipoPico.TARDE));
        
        return horarios;
    }

    private List<PatioPerformanceDto> gerarPerformancePatios(List<OcupacaoAtualDto> ocupacoes) {
        return ocupacoes.stream()
                .sorted((o1, o2) -> Double.compare(o2.getTaxaOcupacao(), o1.getTaxaOcupacao()))
                .map(ocupacao -> mapper.toPatioPerformanceDto(
                        ocupacao.getPatioId(),
                        ocupacao.getNomePatio(),
                        ocupacao.getTaxaOcupacao(),
                        ocupacoes.indexOf(ocupacao) + 1,
                        TendenciaOcupacaoDto.TendenciaGeral.ESTAVEL,
                        0.0,
                        ocupacao.getCidade()
                ))
                .collect(Collectors.toList());
    }
}

