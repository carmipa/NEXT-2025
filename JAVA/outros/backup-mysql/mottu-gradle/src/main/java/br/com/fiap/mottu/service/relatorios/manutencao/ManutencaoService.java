package br.com.fiap.mottu.service.relatorios.manutencao;

import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoDto;
import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoPatioDto;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ManutencaoService {

    private final BoxRepository boxRepository;
    private final VeiculoRepository veiculoRepository;
    private final PatioRepository patioRepository;

    public ManutencaoService(BoxRepository boxRepository, VeiculoRepository veiculoRepository, PatioRepository patioRepository) {
        this.boxRepository = boxRepository;
        this.veiculoRepository = veiculoRepository;
        this.patioRepository = patioRepository;
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
        java.util.List<Patio> patios = patioRepository.findAll();
        java.util.List<ManutencaoResumoPatioDto> lista = new java.util.ArrayList<>();
        for (Patio p : patios) {
            ManutencaoResumoPatioDto dto = new ManutencaoResumoPatioDto();
            dto.setPatioId(p.getIdPatio());
            dto.setPatioNome(p.getNomePatio());
            dto.setBoxesLivres(boxRepository.countByPatioAndStatus(p, "L"));
            dto.setBoxesOcupados(boxRepository.countByPatioAndStatus(p, "O"));
            dto.setBoxesManutencao(boxRepository.countByPatioAndStatus(p, "M"));

            long operacionais = veiculoRepository.findAll().stream()
                    .filter(v -> "OPERACIONAL".equalsIgnoreCase(v.getStatus()))
                    .count();
            long emManutencao = veiculoRepository.findAll().stream()
                    .filter(v -> "EM_MANUTENCAO".equalsIgnoreCase(v.getStatus()))
                    .count();
            long inativos = veiculoRepository.findAll().stream()
                    .filter(v -> "INATIVO".equalsIgnoreCase(v.getStatus()))
                    .count();
            dto.setVeiculosOperacionais(operacionais);
            dto.setVeiculosEmManutencao(emManutencao);
            dto.setVeiculosInativos(inativos);
            lista.add(dto);
        }
        return lista;
    }
}


