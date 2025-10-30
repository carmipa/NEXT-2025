package br.com.fiap.mottu.dto.veiculo;

import br.com.fiap.mottu.dto.rastreamento.RastreamentoResponseDto;
import br.com.fiap.mottu.dto.patio.PatioResponseDto;
import br.com.fiap.mottu.dto.zona.ZonaResponseDto;
import br.com.fiap.mottu.dto.box.BoxResponseDto;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDateTime; // Para o timestamp do último rastreamento

@Value
public class VeiculoLocalizacaoResponseDto implements Serializable {
    Long idVeiculo;
    String placa;
    String modelo;
    String fabricante;

    RastreamentoResponseDto ultimoRastreamento; // O último ponto de rastreamento

    PatioResponseDto patioAssociado; // O pátio ao qual o veículo está atualmente associado (se houver)
    ZonaResponseDto zonaAssociada;   // A zona ao qual o veículo está atualmente associado (se houver)
    BoxResponseDto boxAssociado;     // O box ao qual o veículo está atualmente associado (se houver)

    LocalDateTime dataConsulta; // Timestamp da consulta
}