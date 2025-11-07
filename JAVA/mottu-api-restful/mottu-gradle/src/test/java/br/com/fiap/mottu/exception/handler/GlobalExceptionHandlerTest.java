package br.com.fiap.mottu.exception.handler;

import br.com.fiap.mottu.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.ServletWebRequest;

import jakarta.servlet.http.HttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Testes para GlobalExceptionHandler
 */
@DisplayName("Testes - GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private ServletWebRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        request = new ServletWebRequest(httpRequest);
    }

    @Test
    @DisplayName("Deve tratar ResourceNotFoundException corretamente")
    void deveTratarResourceNotFoundException() {
        // Arrange
        ResourceNotFoundException ex = new ResourceNotFoundException("Pátio", 1L);

        // Act
        ResponseEntity<Object> response = handler.handleResourceNotFoundException(ex, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof java.util.Map);
    }

    @Test
    @DisplayName("Deve tratar ResourceInUseException corretamente")
    void deveTratarResourceInUseException() {
        // Arrange
        ResourceInUseException ex = new ResourceInUseException("Pátio", "estacionamento(s)", 3L);

        // Act
        ResponseEntity<Object> response = handler.handleResourceInUseException(ex, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof java.util.Map);
        
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> body = (java.util.Map<String, Object>) response.getBody();
        assertEquals(HttpStatus.CONFLICT.value(), body.get("status"));
        assertEquals("Recurso em Uso", body.get("error"));
    }

    @Test
    @DisplayName("Deve tratar OperationNotAllowedException corretamente")
    void deveTratarOperationNotAllowedException() {
        // Arrange
        OperationNotAllowedException ex = new OperationNotAllowedException("Operação não permitida");

        // Act
        ResponseEntity<Object> response = handler.handleOperationNotAllowedException(ex, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof java.util.Map);
        
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> body = (java.util.Map<String, Object>) response.getBody();
        assertEquals(HttpStatus.FORBIDDEN.value(), body.get("status"));
        assertEquals("Operação Não Permitida", body.get("error"));
    }

    @Test
    @DisplayName("Deve tratar DuplicatedResourceException corretamente")
    void deveTratarDuplicatedResourceException() {
        // Arrange
        DuplicatedResourceException ex = new DuplicatedResourceException("Pátio", "nome", "Teste");

        // Act
        ResponseEntity<Object> response = handler.handleDuplicatedResourceException(ex, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Deve tratar InvalidInputException corretamente")
    void deveTratarInvalidInputException() {
        // Arrange
        InvalidInputException ex = new InvalidInputException("Dados inválidos");

        // Act
        ResponseEntity<Object> response = handler.handleInvalidInputException(ex, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}






