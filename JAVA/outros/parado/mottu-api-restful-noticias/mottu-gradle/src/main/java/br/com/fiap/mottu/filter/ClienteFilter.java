// Caminho do arquivo: br\com\fiap\mottu\filter\ClienteFilter.java
package br.com.fiap.mottu.filter;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ClienteFilter(
        @Size(max = 50, message = "Nome deve ter no máximo 50 caracteres")
        String nome,
        
        @Size(max = 50, message = "Sobrenome deve ter no máximo 50 caracteres")
        String sobrenome,
        
        @Pattern(regexp = "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$", message = "CPF deve estar no formato 000.000.000-00")
        String cpf,
        
        @Pattern(regexp = "^(M|F)?$", message = "Sexo deve ser M ou F")
        String sexo,
        
        @Size(max = 50, message = "Profissão deve ter no máximo 50 caracteres")
        String profissao,
        
        @Pattern(regexp = "^(SOLTEIRO|CASADO|DIVORCIADO|VIUVO|UNIAO_ESTAVEL)?$", 
                 message = "Estado civil deve ser: SOLTEIRO, CASADO, DIVORCIADO, VIUVO ou UNIAO_ESTAVEL")
        String estadoCivil,
        
        LocalDate dataCadastroInicio,
        LocalDate dataCadastroFim,
        LocalDate dataNascimentoInicio,
        LocalDate dataNascimentoFim,
        
        @Size(max = 50, message = "Cidade deve ter no máximo 50 caracteres")
        String enderecoCidade,
        
        @Pattern(regexp = "^[A-Z]{2}$", message = "Estado deve ter 2 letras maiúsculas (ex: SP, RJ)")
        String enderecoEstado,
        
        @Email(message = "Email deve ter formato válido")
        String contatoEmail,
        
        @Pattern(regexp = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$", message = "Celular deve estar no formato (00) 00000-0000")
        String contatoCelular,
        
        @Size(max = 20, message = "Placa do veículo deve ter no máximo 20 caracteres")
        String veiculoPlaca,
        
        @Size(max = 50, message = "Modelo do veículo deve ter no máximo 50 caracteres")
        String veiculoModelo
) {}