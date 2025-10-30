package br.com.fiap.mottu.dto.veiculo;

import br.com.fiap.mottu.dto.box.BoxResponseDto;
import br.com.fiap.mottu.dto.patio.PatioResponseDto;
import br.com.fiap.mottu.dto.rastreamento.RastreamentoResponseDto;
import br.com.fiap.mottu.dto.zona.ZonaResponseDto;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDateTime;

@Value
public class VeiculoLocalizacaoResponseDto implements Serializable {
    Long idVeiculo;
    String placa;
    String modelo;
    String fabricante;
    String status;
    String tagBleId;
    RastreamentoResponseDto ultimoRastreamento;
    PatioResponseDto patioAssociado;
    ZonaResponseDto zonaAssociada;
    BoxResponseDto boxAssociado;
    LocalDateTime dataConsulta;
}
