package br.com.fiap.mottu.mapper.noticia;

import br.com.fiap.mottu.dto.noticia.NoticiaResponseDto;
import br.com.fiap.mottu.model.noticia.Noticia;
import org.springframework.stereotype.Component;

/**
 * Mapper para conversão entre entidades Noticia e DTOs
 */
@Component
public class NoticiaMapper {

    /**
     * Converte uma entidade Noticia para NoticiaResponseDto
     * @param noticia Entidade Noticia
     * @return NoticiaResponseDto
     */
    public NoticiaResponseDto toResponseDto(Noticia noticia) {
        if (noticia == null) {
            return null;
        }
        
        return NoticiaResponseDto.fromEntity(noticia);
    }
}