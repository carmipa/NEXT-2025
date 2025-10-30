package br.com.fiap.mottu.dto.noticia;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticiaJsonDto {
    
    private String titulo;
    private String resumo;
    private String conteudo;
    private String urlOrigem;
    private String urlImagem;
    private String autor;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataPublicacao;
    
    private String categoria;
    private String sentimento;
    private Integer relevancia;
    private Integer visualizacoes;
    private Boolean ativo;
    
    // Metadados adicionais
    private String palavrasChave;
    private String tags;
    private String idioma;
    private String tipoConteudo;
    private Integer tamanhoConteudo;
    private String hashConteudo; // Para evitar duplicatas
}