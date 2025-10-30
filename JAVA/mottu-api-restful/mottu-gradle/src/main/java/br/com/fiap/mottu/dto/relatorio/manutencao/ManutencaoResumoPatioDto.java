package br.com.fiap.mottu.dto.relatorio.manutencao;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@Schema(description = "Resumo de manutenção por pátio")
public class ManutencaoResumoPatioDto implements Serializable {
    private Long patioId;
    private String patioNome;
    private long boxesLivres;
    private long boxesOcupados;
    private long boxesManutencao;
    private long veiculosOperacionais;
    private long veiculosEmManutencao;
    private long veiculosInativos;

    public Long getPatioId() { return patioId; }
    public void setPatioId(Long patioId) { this.patioId = patioId; }
    public String getPatioNome() { return patioNome; }
    public void setPatioNome(String patioNome) { this.patioNome = patioNome; }
    public long getBoxesLivres() { return boxesLivres; }
    public void setBoxesLivres(long boxesLivres) { this.boxesLivres = boxesLivres; }
    public long getBoxesOcupados() { return boxesOcupados; }
    public void setBoxesOcupados(long boxesOcupados) { this.boxesOcupados = boxesOcupados; }
    public long getBoxesManutencao() { return boxesManutencao; }
    public void setBoxesManutencao(long boxesManutencao) { this.boxesManutencao = boxesManutencao; }
    public long getVeiculosOperacionais() { return veiculosOperacionais; }
    public void setVeiculosOperacionais(long veiculosOperacionais) { this.veiculosOperacionais = veiculosOperacionais; }
    public long getVeiculosEmManutencao() { return veiculosEmManutencao; }
    public void setVeiculosEmManutencao(long veiculosEmManutencao) { this.veiculosEmManutencao = veiculosEmManutencao; }
    public long getVeiculosInativos() { return veiculosInativos; }
    public void setVeiculosInativos(long veiculosInativos) { this.veiculosInativos = veiculosInativos; }
}


