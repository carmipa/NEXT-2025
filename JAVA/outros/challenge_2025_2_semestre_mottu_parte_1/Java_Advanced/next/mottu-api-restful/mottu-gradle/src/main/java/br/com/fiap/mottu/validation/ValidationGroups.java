package br.com.fiap.mottu.validation;

/**
 * Interfaces de grupos de validação para Bean Validation.
 * Servem para diferenciar regras de criação e atualização.
 */
public interface ValidationGroups {

    interface Create {}
    interface Update {}
}
