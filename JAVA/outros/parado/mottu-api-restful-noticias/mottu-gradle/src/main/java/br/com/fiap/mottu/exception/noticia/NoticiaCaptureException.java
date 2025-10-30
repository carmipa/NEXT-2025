package br.com.fiap.mottu.exception.noticia;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class NoticiaCaptureException extends RuntimeException {
    public NoticiaCaptureException(String message) {
        super(message);
    }

    public NoticiaCaptureException(String message, Throwable cause) {
        super(message, cause);
    }
}
