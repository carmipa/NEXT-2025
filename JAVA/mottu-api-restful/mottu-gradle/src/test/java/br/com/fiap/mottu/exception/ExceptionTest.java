package br.com.fiap.mottu.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes para exceções personalizadas
 */
@DisplayName("Testes - Exceções Personalizadas")
class ExceptionTest {

    @Test
    @DisplayName("ResourceNotFoundException deve ter mensagem correta")
    void resourceNotFoundExceptionMensagem() {
        // Arrange & Act
        ResourceNotFoundException ex = new ResourceNotFoundException("Pátio", 1L);

        // Assert
        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("Pátio"));
        assertTrue(ex.getMessage().contains("1"));
    }

    @Test
    @DisplayName("ResourceInUseException deve ter mensagem correta com contagem")
    void resourceInUseExceptionMensagemComContagem() {
        // Arrange & Act
        ResourceInUseException ex = new ResourceInUseException("Pátio", "estacionamento(s)", 3L);

        // Assert
        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("Pátio"));
        assertTrue(ex.getMessage().contains("estacionamento"));
        assertTrue(ex.getMessage().contains("3"));
    }

    @Test
    @DisplayName("ResourceInUseException deve ter mensagem correta sem contagem")
    void resourceInUseExceptionMensagemSemContagem() {
        // Arrange & Act
        ResourceInUseException ex = new ResourceInUseException("Pátio", "box(es)");

        // Assert
        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("Pátio"));
        assertTrue(ex.getMessage().contains("box"));
    }

    @Test
    @DisplayName("OperationNotAllowedException deve ter mensagem correta")
    void operationNotAllowedExceptionMensagem() {
        // Arrange & Act
        OperationNotAllowedException ex = new OperationNotAllowedException("Não é permitido excluir este recurso");

        // Assert
        assertNotNull(ex.getMessage());
        assertEquals("Não é permitido excluir este recurso", ex.getMessage());
    }

    @Test
    @DisplayName("OperationNotAllowedException deve construir mensagem com parâmetros")
    void operationNotAllowedExceptionMensagemComParametros() {
        // Arrange & Act
        OperationNotAllowedException ex = new OperationNotAllowedException("Pátio", "excluir", "está em uso");

        // Assert
        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("excluir"));
        assertTrue(ex.getMessage().contains("Pátio"));
        assertTrue(ex.getMessage().contains("está em uso"));
    }

    @Test
    @DisplayName("DuplicatedResourceException deve ter mensagem correta")
    void duplicatedResourceExceptionMensagem() {
        // Arrange & Act
        DuplicatedResourceException ex = new DuplicatedResourceException("Pátio", "nome", "Teste");

        // Assert
        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("Pátio"));
        assertTrue(ex.getMessage().contains("nome"));
        assertTrue(ex.getMessage().contains("Teste"));
    }
}


