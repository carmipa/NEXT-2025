package br.com.fiap.mottu.service.relatorios;

import br.com.fiap.mottu.dto.relatorio.OcupacaoAtualDto;
import br.com.fiap.mottu.filter.relatorios.OcupacaoFilter;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.specification.relatorios.OcupacaoSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OcupacaoService {

    private static final Logger log = LoggerFactory.getLogger(OcupacaoService.class);
    private final PatioRepository patioRepository;
    private final BoxRepository boxRepository;
    private final EstacionamentoRepository estacionamentoRepository;

    public OcupacaoService(PatioRepository patioRepository, BoxRepository boxRepository, EstacionamentoRepository estacionamentoRepository) {
        this.patioRepository = patioRepository;
        this.boxRepository = boxRepository;
        this.estacionamentoRepository = estacionamentoRepository;
    }

    /**
     * Obtém ocupação atual de todos os pátios
     */
    public List<OcupacaoAtualDto> getOcupacaoAtual() {
        return getOcupacaoAtual(null);
    }
    
    /**
     * Obtém ocupação atual de todos os pátios com filtros
     */
    @Cacheable(value = "ocupacao", key = "#filter?.toString() ?: 'all'")
    public List<OcupacaoAtualDto> getOcupacaoAtual(OcupacaoFilter filter) {
        log.info("Gerando relatório de ocupação atual com filtros");
        
        List<Patio> patios;
        if (filter != null && filter.hasAnyCriteria()) {
            patios = patioRepository.findAll(OcupacaoSpecification.withOcupacaoFilter(filter));
        } else {
            patios = patioRepository.findAll();
        }
        
        List<OcupacaoAtualDto> ocupacao = patios.stream()
                .map(this::calcularOcupacaoPatio)
                .collect(Collectors.toList());
        
        // Aplicar filtros de ocupação se especificados
        if (filter != null && filter.hasOcupacaoCriteria()) {
            ocupacao = ocupacao.stream()
                    .filter(dto -> {
                        boolean passouFiltro = true;
                        
                        if (filter.getTaxaOcupacaoMin() != null) {
                            passouFiltro = passouFiltro && dto.getTaxaOcupacao() >= filter.getTaxaOcupacaoMin();
                        }
                        if (filter.getTaxaOcupacaoMax() != null) {
                            passouFiltro = passouFiltro && dto.getTaxaOcupacao() <= filter.getTaxaOcupacaoMax();
                        }
                        if (filter.getTotalBoxesMin() != null) {
                            passouFiltro = passouFiltro && dto.getTotalBoxes() >= filter.getTotalBoxesMin();
                        }
                        if (filter.getTotalBoxesMax() != null) {
                            passouFiltro = passouFiltro && dto.getTotalBoxes() <= filter.getTotalBoxesMax();
                        }
                        if (filter.getBoxesOcupadosMin() != null) {
                            passouFiltro = passouFiltro && dto.getBoxesOcupados() >= filter.getBoxesOcupadosMin();
                        }
                        if (filter.getBoxesOcupadosMax() != null) {
                            passouFiltro = passouFiltro && dto.getBoxesOcupados() <= filter.getBoxesOcupadosMax();
                        }
                        
                        return passouFiltro;
                    })
                    .collect(Collectors.toList());
        }
        
        log.info("Relatório de ocupação atual gerado com sucesso. {} pátios analisados", ocupacao.size());
        return ocupacao;
    }

    /**
     * Obtém ocupação atual de um pátio específico
     */
    public OcupacaoAtualDto getOcupacaoAtualPorPatio(Long patioId) {
        log.info("Gerando relatório de ocupação para pátio ID: {}", patioId);
        
        Patio patio = patioRepository.findById(patioId)
                .orElseThrow(() -> new RuntimeException("Pátio não encontrado: " + patioId));
        
        return calcularOcupacaoPatio(patio);
    }

    /**
     * Calcula a ocupação de um pátio específico
     * Usa TB_ESTACIONAMENTO para determinar quais boxes estão realmente ocupados
     */
    private OcupacaoAtualDto calcularOcupacaoPatio(Patio patio) {
        List<Box> boxes = boxRepository.findByPatio(patio);
        
        int totalBoxes = boxes.size();
        
        // Buscar boxes realmente ocupados através de TB_ESTACIONAMENTO para este pátio
        // Usa countByPatioIdPatioAndEstaEstacionadoTrue para contar diretamente
        long boxesOcupadosCount = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patio.getIdPatio());
        int boxesOcupados = (int) boxesOcupadosCount;
        
        double taxaOcupacao = totalBoxes > 0 ? (double) boxesOcupados / totalBoxes * 100 : 0.0;
        
        log.debug("Pátio {}: {} boxes ocupados de {} total (taxa: {:.2f}%)", 
                patio.getNomePatio(), boxesOcupados, totalBoxes, taxaOcupacao);
        
        return OcupacaoAtualDto.builder()
                .patioId(patio.getIdPatio())
                .nomePatio(patio.getNomePatio())
                .totalBoxes(totalBoxes)
                .boxesOcupados(boxesOcupados)
                .boxesLivres(totalBoxes - boxesOcupados)
                .taxaOcupacao(taxaOcupacao)
                .ultimaAtualizacao(java.time.LocalDateTime.now())
                .statusPatio(patio.getStatus())
                .build();
    }
}
