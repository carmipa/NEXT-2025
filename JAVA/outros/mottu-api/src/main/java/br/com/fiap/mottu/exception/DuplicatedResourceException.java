// Caminho do arquivo: br\com\fiap\mottu\exception\DuplicatedResourceException.java
package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Anotação para que o Spring mude o status HTTP automaticamente
@ResponseStatus(HttpStatus.CONFLICT) // 409 Conflict
public class DuplicatedResourceException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public DuplicatedResourceException(String message) {
        super(message);
    }

    public DuplicatedResourceException(String resourceName, String identifierName, String identifierValue) {
        super(String.format("%s com %s '%s' já existe.", resourceName, identifierName, identifierValue));
    }
}