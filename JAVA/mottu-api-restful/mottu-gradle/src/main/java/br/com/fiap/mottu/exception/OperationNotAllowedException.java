package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando uma operação não é permitida.
 * Usada para erros 403 (Forbidden).
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class OperationNotAllowedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public OperationNotAllowedException(String message) {
        super(message);
    }

    public OperationNotAllowedException(String resourceName, String operation, String reason) {
        super(String.format("Não é possível %s %s: %s", operation, resourceName, reason));
    }
}




