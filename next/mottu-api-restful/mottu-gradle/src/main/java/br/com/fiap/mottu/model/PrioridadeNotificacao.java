package br.com.fiap.mottu.model;

/**
 * Enum que define os níveis de prioridade das notificações.
 */
public enum PrioridadeNotificacao {
    BAIXA("Baixa"),
    MEDIA("Média"),
    ALTA("Alta"),
    CRITICA("Crítica");

    private final String descricao;

    PrioridadeNotificacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
