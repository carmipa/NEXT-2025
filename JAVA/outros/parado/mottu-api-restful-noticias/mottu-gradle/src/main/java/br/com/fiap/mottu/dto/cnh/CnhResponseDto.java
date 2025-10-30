package br.com.fiap.mottu.dto.cnh;

import lombok.Value;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para respostas de CNH (Carteira Nacional de Habilitação)
 */
@Value
public class CnhResponseDto implements Serializable {
    
    Long idCnh;
    LocalDate dataEmissao;
    LocalDate dataValidade;
    String numeroRegistro;
    String categoria;
    Long clienteId;
    String clienteNome;
    String clienteCpf;
    LocalDateTime criadoEm;
    LocalDateTime atualizadoEm;
    
    // Campos calculados
    boolean vencida;
    boolean proximaVencimento;
    long diasParaVencimento;
    boolean permiteDirigirMotos;
    boolean permiteDirigirCarros;
}




