// Caminho: src/main/java/br/com/fiap/mottu/dto/patio/PatioResponseDto.java
package br.com.fiap.mottu.dto.patio;

import br.com.fiap.mottu.dto.contato.ContatoResponseDto;
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto;
import lombok.Value;
import java.io.Serializable;

/**
 * DTO for {@link br.com.fiap.mottu.model.Patio}
 */
@Value
public class PatioResponseDto implements Serializable {
    Long idPatio;
    String status;
    String nomePatio;
    String observacao;
    java.time.LocalDate dataCadastro;

    // Campos para exibir o contato e endereço associados (FK direta)
    ContatoResponseDto contato;
    EnderecoResponseDto endereco;
}