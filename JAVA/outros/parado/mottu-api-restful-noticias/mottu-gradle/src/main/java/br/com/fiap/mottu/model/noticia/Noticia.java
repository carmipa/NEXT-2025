package br.com.fiap.mottu.model.noticia;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_NOTICIA")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Noticia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_NOTICIA")
    @SequenceGenerator(name = "SEQ_NOTICIA", sequenceName = "SEQ_NOTICIA", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_NOTICIA")
    private Long idNoticia;
    
    @Column(name = "DADOS_JSON", columnDefinition = "CLOB", nullable = false)
    private String dadosJson; // JSON com todos os dados da notícia
    
    @Column(name = "URL_ORIGEM", unique = true, length = 1024)
    private String urlOrigem; // URL original da notícia para evitar duplicatas
    
    @Column(name = "FONTE", nullable = false, length = 100)
    private String fonte;
    
    @Column(name = "DATA_CAPTURA", nullable = false)
    private LocalDateTime dataCaptura;
    
    @Column(name = "ATIVO", nullable = false)
    @Builder.Default
    private Boolean ativo = true;
    
    // Campos para índices e filtros rápidos (opcionais)
    @Column(name = "CATEGORIA", length = 50)
    private String categoria;
    
    @Column(name = "SENTIMENTO", length = 20)
    private String sentimento;
    
    @Column(name = "RELEVANCIA")
    @Builder.Default
    private Integer relevancia = 0;
    
    @Column(name = "VISUALIZACOES")
    @Builder.Default
    private Integer visualizacoes = 0;
}
