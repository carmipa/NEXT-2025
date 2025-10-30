package br.com.fiap.mottu.dto.notificacao;

import br.com.fiap.mottu.model.Notificacao;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record NotificacaoResponseDto(
    Long idNotificacao,
    String titulo,
    String mensagem,
    Notificacao.TipoNotificacao tipo,
    Notificacao.PrioridadeNotificacao prioridade,
    Notificacao.CategoriaNotificacao categoria,
    Boolean lida,
    LocalDateTime dataHoraCriacao,
    LocalDateTime dataHoraLeitura,
    String dadosExtras,
    String urlRedirecionamento
) {
    public static NotificacaoResponseDto fromEntity(Notificacao notificacao) {
        return NotificacaoResponseDto.builder()
            .idNotificacao(notificacao.getIdNotificacao())
            .titulo(notificacao.getTitulo())
            .mensagem(notificacao.getMensagem())
            .tipo(notificacao.getTipo())
            .prioridade(notificacao.getPrioridade())
            .categoria(notificacao.getCategoria())
            .lida(notificacao.getLida())
            .dataHoraCriacao(notificacao.getDataHoraCriacao())
            .dataHoraLeitura(notificacao.getDataHoraLeitura())
            .dadosExtras(notificacao.getDadosExtras())
            .urlRedirecionamento(notificacao.getUrlRedirecionamento())
            .build();
    }
}
