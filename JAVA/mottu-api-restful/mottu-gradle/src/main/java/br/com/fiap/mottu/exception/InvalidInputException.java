// Caminho do arquivo: br\com\fiap\mottu\exception\InvalidInputException.java
package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando uma entrada/requisição contém dados inválidos.
 * Retorna HTTP 400 (Bad Request).
 */
@ResponseStatus(HttpStatus.BAD_REQUEST) // 400 Bad Request
public class InvalidInputException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public InvalidInputException(String message) {
        super(message);
    }

    public InvalidInputException(String fieldName, String invalidValue, String expectedFormat) {
        super(String.format("Campo '%s' contém valor inválido: '%s'. Formato esperado: %s", 
            fieldName, invalidValue, expectedFormat));
    }
}