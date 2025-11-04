package br.com.fiap.mottu.dto.estacionamento;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO para respostas de Estacionamento
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstacionamentoResponseDto implements Serializable {

    private Long idEstacionamento;

    private VeiculoInfo veiculo;
    private BoxInfo box;
    private PatioInfo patio;

    private Boolean estaEstacionado;
    private LocalDateTime dataEntrada;
    private LocalDateTime dataSaida;
    private LocalDateTime dataUltimaAtualizacao;
    private String observacoes;

    // Campos calculados
    private Long tempoEstacionadoMinutos;

    // ================== DTOs ANINHADOS ==================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VeiculoInfo implements Serializable {
        private Long idVeiculo;
        private String placa;
        private String modelo;
        private String fabricante;
        private String tagBleId;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoxInfo implements Serializable {
        private Long idBox;
        private String nome;
        private String status;
        private LocalDateTime dataEntrada;
        private LocalDateTime dataSaida;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatioInfo implements Serializable {
        private Long idPatio;
        private String nomePatio;
        private String status;
    }
}




