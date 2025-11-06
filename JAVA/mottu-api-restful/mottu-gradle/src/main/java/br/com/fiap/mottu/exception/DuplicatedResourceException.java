// Caminho do arquivo: br\com\fiap\mottu\exception\DuplicatedResourceException.java
package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando tenta-se criar um recurso que já existe.
 * Retorna HTTP 409 (Conflict).
 */
@ResponseStatus(HttpStatus.CONFLICT) // 409 Conflict
public class DuplicatedResourceException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public DuplicatedResourceException(String message) {
        super(message);
    }

    public DuplicatedResourceException(String resourceName, String identifierName, String identifierValue) {
        super(String.format("%s com %s '%s' já existe.", resourceName, identifierName, identifierValue));
    }
    
    public DuplicatedResourceException(String resourceName, String identifierName, String identifierValue, String suggestion) {
        super(String.format("%s com %s '%s' já existe. %s", resourceName, identifierName, identifierValue, suggestion));
    }
}