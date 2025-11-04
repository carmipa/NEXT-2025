package br.com.fiap.mottu.service.relatorios.manutencao;

import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoDto;
import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoPatioDto;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ManutencaoService {

    private static final Logger log = LoggerFactory.getLogger(ManutencaoService.class);
    private final BoxRepository boxRepository;
    private final VeiculoRepository veiculoRepository;
    private final PatioRepository patioRepository;
    private final EstacionamentoRepository estacionamentoRepository;

    public ManutencaoService(BoxRepository boxRepository, VeiculoRepository veiculoRepository, 
                             PatioRepository patioRepository, EstacionamentoRepository estacionamentoRepository) {
        this.boxRepository = boxRepository;
        this.veiculoRepository = veiculoRepository;
        this.patioRepository = patioRepository;
        this.estacionamentoRepository = estacionamentoRepository;
    }

    @Cacheable(value = "relatorioManutencao", key = "'resumo'", unless = "#result == null")
    public ManutencaoResumoDto obterResumo() {
        ManutencaoResumoDto dto = new ManutencaoResumoDto();

        // Boxes em manutenção (status 'M')
        long boxesManutencao = boxRepository.findByStatus("M").size();

        // Veículos por status (OPERACIONAL, EM_MANUTENCAO, INATIVO) — via dados reais
        long veiculosEmManutencao = veiculoRepository.findAll().stream()
                .filter(v -> "EM_MANUTENCAO".equalsIgnoreCase(v.getStatus()))
                .count();

        // Definição de pendentes/em andamento/concluídas (regra simples baseada em dados atuais)
        dto.setPendentes(boxesManutencao);          // boxes sinalizados em manutenção pendentes de conclusão
        dto.setEmAndamento(veiculosEmManutencao);   // veículos marcados em manutenção
        dto.setConcluidas(0);                       // sem histórico consolidado aqui; pode ser enriquecido por logs

        return dto;
    }

    @Cacheable(value = "relatorioManutencao", key = "'porPatio'", unless = "#result == null")
    public java.util.List<ManutencaoResumoPatioDto> resumoPorPatio() {
        log.info("Gerando resumo de manutenção por pátio - DADOS REAIS");
        
        java.util.List<Patio> patios = patioRepository.findAll();
        java.util.List<ManutencaoResumoPatioDto> lista = new java.util.ArrayList<>();
        
        for (Patio p : patios) {
            ManutencaoResumoPatioDto dto = new ManutencaoResumoPatioDto();
            dto.setPatioId(p.getIdPatio());
            dto.setPatioNome(p.getNomePatio());
            
            // Total de boxes do pátio
            long totalBoxes = boxRepository.countByPatio(p);
            
            // Boxes em manutenção (status 'M')
            long boxesManutencao = boxRepository.countByPatioAndStatus(p, "M");
            
            // Boxes realmente ocupados através de TB_ESTACIONAMENTO
            long boxesOcupados = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio());
            
            // Boxes livres = total - ocupados - manutenção
            long boxesLivres = totalBoxes - boxesOcupados - boxesManutencao;
            if (boxesLivres < 0) boxesLivres = 0; // Garantir que não seja negativo
            
            dto.setBoxesLivres(boxesLivres);
            dto.setBoxesOcupados(boxesOcupados);
            dto.setBoxesManutencao(boxesManutencao);
            
            // Veículos por status - DADOS REAIS do pátio específico através de TB_ESTACIONAMENTO
            // Buscar apenas veículos que estão estacionados neste pátio
            java.util.List<br.com.fiap.mottu.model.Estacionamento> estacionamentosDoPatio = 
                    estacionamentoRepository.findByPatioIdPatioAndEstaEstacionadoTrueOrderByDataUltimaAtualizacaoDesc(p.getIdPatio());
            
            // Contar veículos estacionados neste pátio por status
            long operacionais = estacionamentosDoPatio.stream()
                    .filter(e -> e.getVeiculo() != null && "OPERACIONAL".equalsIgnoreCase(e.getVeiculo().getStatus()))
                    .count();
            long emManutencao = estacionamentosDoPatio.stream()
                    .filter(e -> e.getVeiculo() != null && "EM_MANUTENCAO".equalsIgnoreCase(e.getVeiculo().getStatus()))
                    .count();
            long inativos = estacionamentosDoPatio.stream()
                    .filter(e -> e.getVeiculo() != null && "INATIVO".equalsIgnoreCase(e.getVeiculo().getStatus()))
                    .count();
            
            dto.setVeiculosOperacionais(operacionais);
            dto.setVeiculosEmManutencao(emManutencao);
            dto.setVeiculosInativos(inativos);
            
            log.debug("Pátio {}: {} boxes livres, {} ocupados, {} manutenção, {} veículos operacionais, {} em manutenção, {} inativos",
                    p.getNomePatio(), boxesLivres, boxesOcupados, boxesManutencao, operacionais, emManutencao, inativos);
            
            lista.add(dto);
        }
        
        log.info("Resumo de manutenção gerado para {} pátios", lista.size());
        return lista;
    }
}


