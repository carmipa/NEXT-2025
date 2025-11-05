package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando um recurso não pode ser excluído ou modificado
 * porque está sendo usado por outros recursos.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceInUseException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceInUseException(String message) {
        super(message);
    }

    public ResourceInUseException(String resourceName, String dependencyName, long dependencyCount) {
        super(String.format("Não é possível excluir %s pois possui %d %s associado(s).", 
            resourceName, dependencyCount, dependencyName));
    }

    public ResourceInUseException(String resourceName, String dependencyName) {
        super(String.format("Não é possível excluir %s pois possui %s associado(s).", 
            resourceName, dependencyName));
    }
}



