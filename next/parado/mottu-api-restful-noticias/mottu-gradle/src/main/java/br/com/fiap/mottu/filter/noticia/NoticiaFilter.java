package br.com.fiap.mottu.filter.noticia;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticiaFilter {

    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    private String titulo;
    
    @Size(max = 500, message = "Resumo deve ter no máximo 500 caracteres")
    private String resumo;
    
    @Size(max = 100, message = "Fonte deve ter no máximo 100 caracteres")
    private String fonte;
    
    @Size(max = 100, message = "Autor deve ter no máximo 100 caracteres")
    private String autor;
    
    @Pattern(regexp = "^(EMPRESA|PRODUTO|PARCERIA|INVESTIMENTO|PREMIACAO|EXPANSAO|TECNOLOGIA|SUSTENTABILIDADE|COMUNIDADE|OUTROS)?$", 
             message = "Categoria deve ser: EMPRESA, PRODUTO, PARCERIA, INVESTIMENTO, PREMIACAO, EXPANSAO, TECNOLOGIA, SUSTENTABILIDADE, COMUNIDADE ou OUTROS")
    private String categoria;
    
    @Pattern(regexp = "^(POSITIVO|NEUTRO|NEGATIVO)?$", 
             message = "Sentimento deve ser: POSITIVO, NEUTRO ou NEGATIVO")
    private String sentimento;
    
    private LocalDateTime dataPublicacaoInicio;
    private LocalDateTime dataPublicacaoFim;
    private LocalDateTime dataCapturaInicio;
    private LocalDateTime dataCapturaFim;
    
    @Min(value = 0, message = "Relevância mínima deve ser maior ou igual a 0")
    @Max(value = 100, message = "Relevância mínima deve ser menor ou igual a 100")
    private Integer relevanciaMinima;
    
    @Min(value = 0, message = "Visualizações mínimas deve ser maior ou igual a 0")
    private Integer visualizacoesMinimas;
    
    private Boolean ativo;
    
    @Size(max = 100, message = "Palavra-chave deve ter no máximo 100 caracteres")
    private String palavraChave; // Para busca geral no JSON
}
