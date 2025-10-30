package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LogMovimentacaoService {

    private static final Logger log = LoggerFactory.getLogger(LogMovimentacaoService.class);

    private final LogMovimentacaoRepository logRepository;

    public LogMovimentacaoService(LogMovimentacaoRepository logRepository) {
        this.logRepository = logRepository;
    }

    /**
     * Registra uma entrada de veículo
     */
    @Transactional
    public LogMovimentacao registrarEntrada(Veiculo veiculo, Box box) {
        log.info("Registrando entrada do veículo {} no box {}", veiculo.getPlaca(), box.getNome());
        
        Patio patio = box.getPatio();
        if (patio == null) {
            throw new ResourceNotFoundException("Pátio não encontrado para o box " + box.getNome());
        }

        LogMovimentacao logMovimentacao = LogMovimentacao.builder()
                .veiculo(veiculo)
                .box(box)
                .patio(patio)
                .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                .dataHoraMovimentacao(LocalDateTime.now())
                .observacoes("Entrada registrada automaticamente")
                .build();

        LogMovimentacao savedLog = logRepository.save(logMovimentacao);
        log.info("Entrada registrada com sucesso. ID: {}", savedLog.getIdLogMovimentacao());
        
        return savedLog;
    }

    /**
     * Registra uma saída de veículo
     */
    @Transactional
    public LogMovimentacao registrarSaida(Veiculo veiculo, Box box) {
        log.info("Registrando saída do veículo {} do box {}", veiculo.getPlaca(), box.getNome());
        
        Patio patio = box.getPatio();
        if (patio == null) {
            throw new ResourceNotFoundException("Pátio não encontrado para o box " + box.getNome());
        }

        // Buscar a entrada correspondente para calcular o tempo de estacionamento
        Optional<LogMovimentacao> entradaOpt = logRepository.findByVeiculoIdVeiculoAndBoxIdBoxAndTipoMovimentacaoOrderByDataHoraMovimentacaoDesc(
                veiculo.getIdVeiculo(), box.getIdBox(), TipoMovimentacao.ENTRADA);

        Long tempoEstacionamentoMinutos = null;
        if (entradaOpt.isPresent()) {
            LocalDateTime entrada = entradaOpt.get().getDataHoraMovimentacao();
            tempoEstacionamentoMinutos = java.time.Duration.between(entrada, LocalDateTime.now()).toMinutes();
        }

        LogMovimentacao logMovimentacao = LogMovimentacao.builder()
                .veiculo(veiculo)
                .box(box)
                .patio(patio)
                .tipoMovimentacao(TipoMovimentacao.SAIDA)
                .dataHoraMovimentacao(LocalDateTime.now())
                .tempoEstacionamentoMinutos(tempoEstacionamentoMinutos)
                .observacoes("Saída registrada automaticamente")
                .build();

        LogMovimentacao savedLog = logRepository.save(logMovimentacao);
        log.info("Saída registrada com sucesso. ID: {}, Tempo estacionado: {} minutos", 
                savedLog.getIdLogMovimentacao(), tempoEstacionamentoMinutos);
        
        return savedLog;
    }

    /**
     * Busca histórico de movimentações de um veículo
     */
    @Transactional(readOnly = true)
    public List<LogMovimentacao> getHistoricoMovimentacao(Veiculo veiculo) {
        log.info("Buscando histórico de movimentações para o veículo {}", veiculo.getPlaca());
        return logRepository.findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(veiculo.getIdVeiculo());
    }

    /**
     * Busca histórico de movimentações de um veículo por ID
     */
    @Transactional(readOnly = true)
    public List<LogMovimentacao> getHistoricoMovimentacao(Long veiculoId) {
        log.info("Buscando histórico de movimentações para o veículo ID {}", veiculoId);
        return logRepository.findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(veiculoId);
    }

    /**
     * Busca movimentações por período
     */
    @Transactional(readOnly = true)
    public List<LogMovimentacao> getMovimentacoesPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        log.info("Buscando movimentações entre {} e {}", inicio, fim);
        return logRepository.findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(inicio, fim);
    }

    /**
     * Busca movimentações por pátio e período
     */
    @Transactional(readOnly = true)
    public List<LogMovimentacao> getMovimentacoesPorPatioEPeriodo(Long patioId, LocalDateTime inicio, LocalDateTime fim) {
        log.info("Buscando movimentações do pátio {} entre {} e {}", patioId, inicio, fim);
        return logRepository.findByPatioIdPatioAndDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(patioId, inicio, fim);
    }

    /**
     * Conta movimentações por tipo em um período
     */
    @Transactional(readOnly = true)
    public Long contarMovimentacoesPorTipo(TipoMovimentacao tipo, LocalDateTime inicio, LocalDateTime fim) {
        log.info("Contando movimentações do tipo {} entre {} e {}", tipo, inicio, fim);
        return logRepository.countByTipoMovimentacaoAndPeriodo(tipo, inicio, fim);
    }

    /**
     * Conta movimentações por pátio, tipo e período
     */
    @Transactional(readOnly = true)
    public Long contarMovimentacoesPorPatioETipo(Long patioId, TipoMovimentacao tipo, LocalDateTime inicio, LocalDateTime fim) {
        log.info("Contando movimentações do pátio {} tipo {} entre {} e {}", patioId, tipo, inicio, fim);
        return logRepository.countByPatioAndTipoMovimentacaoAndPeriodo(patioId, tipo, inicio, fim);
    }

    /**
     * Busca tempo médio de estacionamento por pátio
     */
    @Transactional(readOnly = true)
    public Double getTempoMedioEstacionamentoPorPatio(Long patioId) {
        log.info("Buscando tempo médio de estacionamento do pátio {}", patioId);
        return logRepository.findTempoMedioEstacionamentoPorPatio(patioId);
    }

    /**
     * Busca tempo médio de estacionamento global
     */
    @Transactional(readOnly = true)
    public Double getTempoMedioEstacionamentoGlobal() {
        log.info("Buscando tempo médio de estacionamento global");
        return logRepository.findTempoMedioEstacionamentoGlobal();
    }

    /**
     * Busca os boxes mais utilizados
     */
    @Transactional(readOnly = true)
    public List<Object[]> getTopBoxesUtilizados(int limit) {
        log.info("Buscando top {} boxes mais utilizados", limit);
        return logRepository.findTopBoxesUtilizados(org.springframework.data.domain.PageRequest.of(0, limit));
    }

    /**
     * Busca os veículos mais frequentes
     */
    @Transactional(readOnly = true)
    public List<Object[]> getTopVeiculosFrequentes(int limit) {
        log.info("Buscando top {} veículos mais frequentes", limit);
        return logRepository.findTopVeiculosFrequentes(org.springframework.data.domain.PageRequest.of(0, limit));
    }

    /**
     * Busca todas as movimentações com paginação
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<LogMovimentacao> getMovimentacoesComPaginacao(
            LocalDateTime inicio, LocalDateTime fim, org.springframework.data.domain.Pageable pageable) {
        log.info("Buscando movimentações paginadas entre {} e {}", inicio, fim);
        return logRepository.findByDataHoraMovimentacaoBetweenOrderByDataHoraMovimentacaoDesc(inicio, fim, pageable);
    }

    /**
     * Busca movimentações por pátio com paginação
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<LogMovimentacao> getMovimentacoesPorPatioComPaginacao(
            Long patioId, org.springframework.data.domain.Pageable pageable) {
        log.info("Buscando movimentações paginadas do pátio {}", patioId);
        return logRepository.findByPatioIdPatioOrderByDataHoraMovimentacaoDesc(patioId, pageable);
    }

    /**
     * Busca movimentações por veículo com paginação
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<LogMovimentacao> getMovimentacoesPorVeiculoComPaginacao(
            Long veiculoId, org.springframework.data.domain.Pageable pageable) {
        log.info("Buscando movimentações paginadas do veículo {}", veiculoId);
        return logRepository.findByVeiculoIdVeiculoOrderByDataHoraMovimentacaoDesc(veiculoId, pageable);
    }
}
