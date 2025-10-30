package br.com.fiap.mottu.model;

/**
 * Enum que define os tipos de notificação do sistema MOTTU.
 */
public enum TipoNotificacao {
    INFO("Informação"),
    WARNING("Aviso"),
    ERROR("Erro"),
    SUCCESS("Sucesso"),
    ALERT("Alerta");

    private final String descricao;

    TipoNotificacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
