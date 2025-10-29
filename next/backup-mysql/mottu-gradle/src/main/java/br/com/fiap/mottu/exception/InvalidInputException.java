// Caminho do arquivo: br\com\fiap\mottu\exception\InvalidInputException.java
package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Anotação para que o Spring mude o status HTTP automaticamente
@ResponseStatus(HttpStatus.BAD_REQUEST) // 400 Bad Request
public class InvalidInputException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public InvalidInputException(String message) {
        super(message);
    }
}