// Caminho do arquivo: br\com\fiap\mottu\exception\ResourceNotFoundException.java
package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando um recurso solicitado não é encontrado.
 * Retorna HTTP 404 (Not Found).
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s com ID %d não encontrado(a).", resourceName, id));
    }

    public ResourceNotFoundException(String resourceName, String identifierName, String identifierValue) {
        super(String.format("%s com %s '%s' não encontrado(a).", resourceName, identifierName, identifierValue));
    }
}