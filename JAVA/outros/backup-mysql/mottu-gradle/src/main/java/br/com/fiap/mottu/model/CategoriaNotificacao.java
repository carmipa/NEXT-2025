package br.com.fiap.mottu.model;

/**
 * Enum que define as categorias de notificação do sistema.
 */
public enum CategoriaNotificacao {
    OCUPACAO("Ocupação"),
    MOVIMENTACAO("Movimentação"),
    SISTEMA("Sistema"),
    MANUTENCAO("Manutenção"),
    SEGURANCA("Segurança"),
    PERFORMANCE("Performance"),
    PATIO("Pátio"),
    BOX("Box"),
    VEICULO("Veículo");

    private final String descricao;

    CategoriaNotificacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
