package br.com.fiap.mottu.dto.mapglobal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO para dados de pátio no mapa global
 */
@Data
@Builder
@NoArgsConstructor
@Schema(description = "Dados do pátio para exibição no mapa global")
public class MapGlobalPatioDto implements Serializable {
    
    @Schema(description = "ID único do pátio", example = "1")
    private Long id;
    
    @Schema(description = "Nome do pátio", example = "Mottu Patio Guarulhos")
    private String nome;
    
    @Schema(description = "Endereço completo do pátio", example = "Rua Antônio Pegoraro, 110 - Jardim dos Afonsos")
    private String endereco;
    
    @Schema(description = "Cidade do pátio", example = "Guarulhos")
    private String cidade;
    
    @Schema(description = "Estado do pátio", example = "SP")
    private String estado;
    
    @Schema(description = "CEP do pátio", example = "07115-000")
    private String cep;
    
    @Schema(description = "País do pátio", example = "Brasil")
    private String pais;
    
    @Schema(description = "Total de vagas no pátio", example = "100")
    private Long totalVagas;
    
    @Schema(description = "Vagas livres", example = "75")
    private Long vagasLivres;
    
    @Schema(description = "Vagas ocupadas", example = "20")
    private Long vagasOcupadas;
    
    @Schema(description = "Vagas em manutenção", example = "5")
    private Long vagasManutencao;
    
    @Schema(description = "Percentual de ocupação", example = "25.0")
    private Double percentualOcupacao;
    
    @Schema(description = "Status do pátio", example = "ATIVO")
    private String status;
    
    /**
     * Construtor específico para uso com HQL Constructor Expressions
     * Deve corresponder exatamente à ordem dos campos na query HQL
     */
    public MapGlobalPatioDto(
            Long id,                    // 1: p.idPatio
            String nome,                // 2: p.nomePatio
            String endereco,            // 3: CONCAT(e.logradouro, ', ', e.numero, ' - ', e.bairro)
            String cidade,              // 4: e.cidade
            String estado,              // 5: e.estado
            String cep,                 // 6: e.cep
            String pais,                // 7: e.pais
            Long totalVagas,            // 8: COUNT(b.idBox)
            Long vagasLivres,           // 9: COUNT(CASE WHEN b.status = 'L' THEN 1 END)
            Long vagasOcupadas,         // 10: COUNT(CASE WHEN b.status = 'O' THEN 1 END)
            Long vagasManutencao,       // 11: COUNT(CASE WHEN b.status = 'M' THEN 1 END)
            Double percentualOcupacao,  // 12: CASE WHEN COUNT(b.idBox) > 0 THEN ... ELSE 0.0 END
            String status               // 13: p.status
    ) {
        this.id = id;
        this.nome = nome;
        this.endereco = endereco;
        this.cidade = cidade;
        this.estado = estado;
        this.cep = cep;
        this.pais = pais;
        this.totalVagas = totalVagas;
        this.vagasLivres = vagasLivres;
        this.vagasOcupadas = vagasOcupadas;
        this.vagasManutencao = vagasManutencao;
        this.percentualOcupacao = percentualOcupacao;
        this.status = status;
    }
}
