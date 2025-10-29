package br.com.fiap.mottu.exception.noticia;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NoticiaNotFoundException extends RuntimeException {
    public NoticiaNotFoundException(Long id) {
        super("Notícia não encontrada com o ID: " + id);
    }
}
