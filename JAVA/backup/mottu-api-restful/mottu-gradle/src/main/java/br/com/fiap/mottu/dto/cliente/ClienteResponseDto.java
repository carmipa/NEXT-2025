// Caminho do arquivo: br\com\fiap\mottu\dto\cliente\ClienteResponseDto.java
package br.com.fiap.mottu.dto.cliente;

import br.com.fiap.mottu.dto.contato.ContatoResponseDto;
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto;
import br.com.fiap.mottu.dto.cnh.CnhResponseDto;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link br.com.fiap.mottu.model.Cliente}
 */
@Value
public class ClienteResponseDto implements Serializable {
    Long idCliente;
    LocalDate dataCadastro;
    String sexo;
    String nome;
    String sobrenome;
    LocalDate dataNascimento;
    String cpf;
    String profissao;
    String estadoCivil;
    EnderecoResponseDto enderecoResponseDto;
    ContatoResponseDto contatoResponseDto;
    CnhResponseDto cnhResponseDto;

    // Set<VeiculoResponseDto> veiculos; // Necessita de mapeamento customizado no ClienteMapper
}