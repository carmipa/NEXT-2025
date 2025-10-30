package br.com.fiap.mottu.dto.noticia;

import lombok.Builder;

@Builder
public record NoticiaEstatisticasDto(
        long totalNoticias,
        long noticiasHoje,
        String fonteMaisAtiva,
        String categoriaMaisComum,
        long noticiasDicasMottu,
        long noticiasMotoO
) {}