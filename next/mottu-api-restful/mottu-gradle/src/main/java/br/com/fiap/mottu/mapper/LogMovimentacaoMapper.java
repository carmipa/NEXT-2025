package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.relatorio.*;
import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.model.Patio;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class LogMovimentacaoMapper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Converte LogMovimentacao para MovimentacaoDetalhadaDto
     */
    public MovimentacaoDetalhadaDto toMovimentacaoDetalhadaDto(LogMovimentacao log) {
        if (log == null) return null;

        return MovimentacaoDetalhadaDto.builder()
                .idMovimentacao(log.getIdLogMovimentacao())
                .placaVeiculo(log.getVeiculo() != null ? log.getVeiculo().getPlaca() : null)
                .nomeBox(log.getBox() != null ? log.getBox().getNome() : null)
                .nomePatio(log.getPatio() != null ? log.getPatio().getNomePatio() : null)
                .tipoMovimentacao(log.getTipoMovimentacao())
                .dataHoraMovimentacao(log.getDataHoraMovimentacao())
                .tempoEstacionamentoMinutos(log.getTempoEstacionamentoMinutos())
                .observacoes(log.getObservacoes())
                .modeloVeiculo(log.getVeiculo() != null ? log.getVeiculo().getModelo() : null)
                .fabricanteVeiculo(log.getVeiculo() != null ? log.getVeiculo().getFabricante() : null)
                .build();
    }

    /**
     * Converte lista de LogMovimentacao para lista de MovimentacaoDetalhadaDto
     */
    public List<MovimentacaoDetalhadaDto> toMovimentacaoDetalhadaDtoList(List<LogMovimentacao> logs) {
        if (logs == null) return null;
        return logs.stream()
                .map(this::toMovimentacaoDetalhadaDto)
                .collect(Collectors.toList());
    }

    /**
     * Converte dados de ocupação atual para DTO
     */
    public OcupacaoAtualDto toOcupacaoAtualDto(Patio patio, Integer totalBoxes, Integer boxesOcupados) {
        if (patio == null) return null;

        Integer boxesLivres = totalBoxes - boxesOcupados;
        Double taxaOcupacao = totalBoxes > 0 ? (boxesOcupados.doubleValue() / totalBoxes.doubleValue()) * 100 : 0.0;

        return OcupacaoAtualDto.builder()
                .patioId(patio.getIdPatio())
                .nomePatio(patio.getNomePatio())
                .totalBoxes(totalBoxes)
                .boxesOcupados(boxesOcupados)
                .boxesLivres(boxesLivres)
                .taxaOcupacao(taxaOcupacao)
                .ultimaAtualizacao(LocalDateTime.now())
                .statusPatio(patio.getStatus())
                .cidade(patio.getEndereco() != null ? patio.getEndereco().getCidade() : null)
                .estado(patio.getEndereco() != null ? patio.getEndereco().getEstado() : null)
                .build();
    }

    /**
     * Converte dados de performance para DTO
     */
    public PerformancePatioDto toPerformancePatioDto(Patio patio, Double ocupacaoMedia, 
                                                    Double tempoMedioEstacionamento, Long totalMovimentacoes,
                                                    Long totalEntradas, Long totalSaidas, Integer totalBoxes,
                                                    List<TopBoxDto> topBoxes, List<TopVeiculoDto> topVeiculos) {
        if (patio == null) return null;

        return PerformancePatioDto.builder()
                .patioId(patio.getIdPatio())
                .nomePatio(patio.getNomePatio())
                .taxaOcupacaoMedia(ocupacaoMedia)
                .tempoMedioEstacionamento(tempoMedioEstacionamento)
                .totalMovimentacoes(totalMovimentacoes)
                .totalEntradas(totalEntradas)
                .totalSaidas(totalSaidas)
                .totalBoxes(totalBoxes)
                .topBoxes(topBoxes)
                .topVeiculos(topVeiculos)
                .status(patio.getStatus())
                .cidade(patio.getEndereco() != null ? patio.getEndereco().getCidade() : null)
                .estado(patio.getEndereco() != null ? patio.getEndereco().getEstado() : null)
                .build();
    }

    /**
     * Converte dados de box mais utilizado para DTO
     */
    public TopBoxDto toTopBoxDto(Object[] dados, Long totalMovimentacoes) {
        if (dados == null || dados.length < 3) return null;

        Long boxId = (Long) dados[0];
        String nomeBox = (String) dados[1];
        Long utilizacoes = (Long) dados[2];
        
        Double taxaUtilizacao = totalMovimentacoes > 0 ? 
            (utilizacoes.doubleValue() / totalMovimentacoes.doubleValue()) * 100 : 0.0;

        return TopBoxDto.builder()
                .boxId(boxId)
                .nomeBox(nomeBox)
                .totalUtilizacoes(utilizacoes)
                .taxaUtilizacao(taxaUtilizacao)
                .build();
    }

    /**
     * Converte dados de veículo mais frequente para DTO
     */
    public TopVeiculoDto toTopVeiculoDto(Object[] dados) {
        if (dados == null || dados.length < 3) return null;

        Long veiculoId = (Long) dados[0];
        String placa = (String) dados[1];
        Long utilizacoes = (Long) dados[2];

        return TopVeiculoDto.builder()
                .veiculoId(veiculoId)
                .placa(placa)
                .totalUtilizacoes(utilizacoes)
                .build();
    }

    /**
     * Converte dados de tendência para DTO
     */
    public TendenciaOcupacaoDto toTendenciaOcupacaoDto(String periodo, Double ocupacaoMedia, 
                                                      Double ocupacaoMaxima, Double ocupacaoMinima,
                                                      Integer diasAltaOcupacao, Integer diasBaixaOcupacao,
                                                      TendenciaOcupacaoDto.TendenciaGeral tendenciaGeral,
                                                      Double variacaoPercentual) {
        return TendenciaOcupacaoDto.builder()
                .periodoAnalisado(periodo)
                .tendenciaGeral(tendenciaGeral)
                .variacaoPercentual(variacaoPercentual)
                .ocupacaoMedia(ocupacaoMedia)
                .ocupacaoMaxima(ocupacaoMaxima)
                .ocupacaoMinima(ocupacaoMinima)
                .diasAltaOcupacao(diasAltaOcupacao)
                .diasBaixaOcupacao(diasBaixaOcupacao)
                .dataAnalise(LocalDate.now())
                .build();
    }

    /**
     * Converte dados de horário de pico para DTO
     */
    public HorarioPicoDto toHorarioPicoDto(String horarioInicio, String horarioFim, 
                                          Double percentualOcupacao, HorarioPicoDto.TipoPico tipoPico) {
        return HorarioPicoDto.builder()
                .horarioInicio(horarioInicio)
                .horarioFim(horarioFim)
                .percentualOcupacao(percentualOcupacao)
                .tipoPico(tipoPico)
                .build();
    }

    /**
     * Converte dados de performance de pátio para DTO
     */
    public PatioPerformanceDto toPatioPerformanceDto(Long patioId, String nomePatio, 
                                                    Double ocupacaoMedia, Integer ranking,
                                                    TendenciaOcupacaoDto.TendenciaGeral tendencia,
                                                    Double variacaoPercentual, String cidade) {
        return PatioPerformanceDto.builder()
                .patioId(patioId)
                .nomePatio(nomePatio)
                .ocupacaoMedia(ocupacaoMedia)
                .ranking(ranking)
                .tendencia(tendencia)
                .variacaoPercentual(variacaoPercentual)
                .cidade(cidade)
                .build();
    }

    /**
     * Converte LogMovimentacao para MovimentacaoDiariaDto
     */
    public MovimentacaoDiariaDto toMovimentacaoDiariaDto(LocalDate data, Integer entradas, Integer saidas,
                                                        Double tempoMedioEstacionamento, String patioMaisMovimentado,
                                                        String boxMaisUtilizado, List<MovimentacaoDetalhadaDto> detalhes) {
        return MovimentacaoDiariaDto.builder()
                .data(data)
                .entradas(entradas)
                .saidas(saidas)
                .totalMovimentacoes(entradas + saidas)
                .tempoMedioEstacionamento(tempoMedioEstacionamento)
                .patioMaisMovimentado(patioMaisMovimentado)
                .boxMaisUtilizado(boxMaisUtilizado)
                .movimentacoesDetalhadas(detalhes)
                .build();
    }
}

