// Caminho do arquivo: br\com\fiap\mottu\external\viacep\ViaCepResponse.java
package br.com.fiap.mottu.external.viacep; // Pacote atualizado

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViaCepResponse {
    private String cep;
    private String logradouro;
    private String complemento;
    private String bairro;
    private String localidade; // Corresponde à cidade
    private String uf;         // Corresponde ao estado
    private String ibge;
    private String gia;
    private String ddd;
    private String siafi;

    @JsonAlias("erro")
    private Boolean erro;
}