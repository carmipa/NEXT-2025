// Caminho do arquivo: br\com\fiap\mottu\filter\PatioFilter.java
package br.com.fiap.mottu.filter;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record PatioFilter(
        @Size(max = 100, message = "Nome do pátio deve ter no máximo 100 caracteres")
        String nomePatio,
        
        LocalDate dataCadastroInicio,
        LocalDate dataCadastroFim,
        
        @Size(max = 500, message = "Observação deve ter no máximo 500 caracteres")
        String observacao,
        
        @Pattern(regexp = "^[A-Z]{3}\\d{4}$", message = "Placa do veículo deve estar no formato ABC1234")
        String veiculoPlaca, // Filtro por veículo associado (via junção)
        
        @Size(max = 50, message = "Cidade deve ter no máximo 50 caracteres")
        String enderecoCidade, // Filtro por endereço associado (via junção)
        
        @Email(message = "Email deve ter formato válido")
        String contatoEmail, // Filtro por contato associado (via junção)
        
        @Size(max = 50, message = "Nome da zona deve ter no máximo 50 caracteres")
        String zonaNome, // Filtro por zona associada (via FK direta)
        
        @Size(max = 50, message = "Nome do box deve ter no máximo 50 caracteres")
        String boxNome // Filtro por box associado (via zona)
) {}