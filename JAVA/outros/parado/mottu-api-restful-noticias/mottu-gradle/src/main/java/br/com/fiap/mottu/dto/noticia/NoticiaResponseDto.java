package br.com.fiap.mottu.dto.noticia;

import br.com.fiap.mottu.model.noticia.Noticia;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticiaResponseDto {
    
    private Long idNoticia;
    private String titulo;
    private String resumo;
    private String conteudo;
    private String urlOrigem;
    private String urlImagem;
    private String fonte;
    private String autor;
    private LocalDateTime dataPublicacao;
    private LocalDateTime dataCaptura;
    private String categoria;
    private String sentimento;
    private Integer relevancia;
    private Integer visualizacoes;
    private Boolean ativo;
    
    // Campos adicionais do JSON
    private String palavrasChave;
    private String tags;
    private String idioma;
    private String tipoConteudo;
    private Integer tamanhoConteudo;
    private String hashConteudo;
    
    public static NoticiaResponseDto fromEntity(Noticia noticia) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            NoticiaJsonDto jsonData = mapper.readValue(noticia.getDadosJson(), NoticiaJsonDto.class);
            
            return NoticiaResponseDto.builder()
                .idNoticia(noticia.getIdNoticia())
                .titulo(jsonData.getTitulo())
                .resumo(jsonData.getResumo())
                .conteudo(jsonData.getConteudo())
                .urlOrigem(jsonData.getUrlOrigem())
                .urlImagem(jsonData.getUrlImagem())
                .fonte(noticia.getFonte())
                .autor(jsonData.getAutor())
                .dataPublicacao(jsonData.getDataPublicacao())
                .dataCaptura(noticia.getDataCaptura())
                .categoria(jsonData.getCategoria())
                .sentimento(jsonData.getSentimento())
                .relevancia(jsonData.getRelevancia())
                .visualizacoes(jsonData.getVisualizacoes())
                .ativo(jsonData.getAtivo())
                .palavrasChave(jsonData.getPalavrasChave())
                .tags(jsonData.getTags())
                .idioma(jsonData.getIdioma())
                .tipoConteudo(jsonData.getTipoConteudo())
                .tamanhoConteudo(jsonData.getTamanhoConteudo())
                .hashConteudo(jsonData.getHashConteudo())
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao converter JSON da notícia", e);
        }
    }
}