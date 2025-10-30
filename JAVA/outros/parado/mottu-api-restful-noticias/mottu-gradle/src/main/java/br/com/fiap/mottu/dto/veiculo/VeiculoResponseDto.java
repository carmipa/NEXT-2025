package br.com.fiap.mottu.dto.veiculo;

import lombok.Value;
import java.io.Serializable;

@Value
public class VeiculoResponseDto implements Serializable {
    Long idVeiculo;
    String placa;
    String renavam;
    String chassi;
    String fabricante;
    String modelo;
    String motor;
    Integer ano;
    String combustivel;
    String tagBleId;
    String status;
}
