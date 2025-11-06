package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.exception.OperationNotAllowedException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.service.PatioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para o endpoint DELETE /api/patios/{id} no PatioController.
 * Testa o comportamento do controller ao deletar pátios.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PatioController - Testes Unitários - Deletar Pátio")
class PatioControllerDeletarPatioTest {

    @Mock
    private PatioService patioService;

    @InjectMocks
    private PatioController patioController;

    private Long patioId;

    @BeforeEach
    void setUp() {
        patioId = 1L;
    }

    @Test
    @DisplayName("✅ Deve retornar 204 No Content quando deletar pátio com sucesso")
    void deveRetornar204QuandoDeletarComSucesso() {
        // Arrange
        doNothing().when(patioService).deletarPatio(patioId);

        // Act
        ResponseEntity<Void> response = patioController.deletarPatio(patioId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        
        // Verificar que o service foi chamado corretamente
        verify(patioService, times(1)).deletarPatio(patioId);
        verifyNoMoreInteractions(patioService);
    }

    @Test
    @DisplayName("❌ Deve lançar ResourceNotFoundException quando pátio não existe")
    void deveLancarResourceNotFoundExceptionQuandoPatioNaoExiste() {
        // Arrange
        Long idInexistente = 999L;
        doThrow(new ResourceNotFoundException("Pátio não encontrado com ID: " + idInexistente))
                .when(patioService).deletarPatio(idInexistente);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> patioController.deletarPatio(idInexistente)
        );

        assertEquals("Pátio não encontrado com ID: " + idInexistente, exception.getMessage());
        
        // Verificar que o service foi chamado
        verify(patioService, times(1)).deletarPatio(idInexistente);
    }

    @Test
    @DisplayName("❌ Deve lançar ResourceInUseException quando há estacionamentos ativos")
    void deveLancarResourceInUseExceptionQuandoHaEstacionamentosAtivos() {
        // Arrange
        String mensagemEsperada = "Não é possível excluir o Pátio 'Pátio Teste' (ID: 1) pois possui 2 veículo(s) estacionado(s) no momento. " +
                "Por favor, libere todos os veículos estacionados antes de excluir o pátio.";
        
        doThrow(new ResourceInUseException(mensagemEsperada))
                .when(patioService).deletarPatio(patioId);

        // Act & Assert
        ResourceInUseException exception = assertThrows(
                ResourceInUseException.class,
                () -> patioController.deletarPatio(patioId)
        );

        assertTrue(exception.getMessage().contains("estacionado"));
        assertTrue(exception.getMessage().contains("veículo"));
        assertEquals(mensagemEsperada, exception.getMessage());
        
        verify(patioService, times(1)).deletarPatio(patioId);
    }

    @Test
    @DisplayName("❌ Deve lançar ResourceInUseException quando há veículos associados")
    void deveLancarResourceInUseExceptionQuandoHaVeiculosAssociados() {
        // Arrange
        String mensagemEsperada = "Não é possível excluir o Pátio 'Pátio Teste' (ID: 1) pois possui 3 veículo(s) associado(s). " +
                "Por favor, remova as associações dos veículos antes de excluir o pátio.";
        
        doThrow(new ResourceInUseException(mensagemEsperada))
                .when(patioService).deletarPatio(patioId);

        // Act & Assert
        ResourceInUseException exception = assertThrows(
                ResourceInUseException.class,
                () -> patioController.deletarPatio(patioId)
        );

        assertTrue(exception.getMessage().contains("associado"));
        assertTrue(exception.getMessage().contains("veículo"));
        assertEquals(mensagemEsperada, exception.getMessage());
        
        verify(patioService, times(1)).deletarPatio(patioId);
    }

    @Test
    @DisplayName("❌ Deve lançar OperationNotAllowedException quando há erro ao processar dependências")
    void deveLancarOperationNotAllowedExceptionQuandoHaErroAoProcessarDependencias() {
        // Arrange
        String mensagemEsperada = "Não foi possível excluir o Pátio 'Pátio Teste' (ID: 1) devido a um erro ao processar as dependências dos boxes. " +
                "Erro: Erro ao deletar notificações. Por favor, tente novamente ou entre em contato com o suporte.";
        
        doThrow(new OperationNotAllowedException(mensagemEsperada))
                .when(patioService).deletarPatio(patioId);

        // Act & Assert
        OperationNotAllowedException exception = assertThrows(
                OperationNotAllowedException.class,
                () -> patioController.deletarPatio(patioId)
        );

        assertTrue(exception.getMessage().contains("dependências"));
        assertTrue(exception.getMessage().contains("boxes"));
        assertEquals(mensagemEsperada, exception.getMessage());
        
        verify(patioService, times(1)).deletarPatio(patioId);
    }

    @Test
    @DisplayName("❌ Deve lançar OperationNotAllowedException quando há erro de integridade no banco")
    void deveLancarOperationNotAllowedExceptionQuandoHaErroDeIntegridade() {
        // Arrange
        String mensagemEsperada = "Não foi possível excluir o Pátio 'Pátio Teste' (ID: 1) devido a restrições de integridade no banco de dados. " +
                "O pátio pode possuir dependências que não puderam ser removidas automaticamente. " +
                "Por favor, verifique manualmente as dependências ou entre em contato com o suporte.";
        
        doThrow(new OperationNotAllowedException(mensagemEsperada))
                .when(patioService).deletarPatio(patioId);

        // Act & Assert
        OperationNotAllowedException exception = assertThrows(
                OperationNotAllowedException.class,
                () -> patioController.deletarPatio(patioId)
        );

        assertTrue(exception.getMessage().contains("integridade"));
        assertTrue(exception.getMessage().contains("banco de dados"));
        assertEquals(mensagemEsperada, exception.getMessage());
        
        verify(patioService, times(1)).deletarPatio(patioId);
    }

    @Test
    @DisplayName("✅ Deve chamar service apenas uma vez mesmo que não retorne erro")
    void deveChamarServiceApenasUmaVez() {
        // Arrange
        doNothing().when(patioService).deletarPatio(patioId);

        // Act
        patioController.deletarPatio(patioId);

        // Assert
        verify(patioService, times(1)).deletarPatio(patioId);
        verifyNoMoreInteractions(patioService);
    }

    @Test
    @DisplayName("✅ Deve deletar pátio com ID válido")
    void deveDeletarPatioComIdValido() {
        // Arrange
        Long idValido = 100L;
        doNothing().when(patioService).deletarPatio(idValido);

        // Act
        ResponseEntity<Void> response = patioController.deletarPatio(idValido);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(patioService, times(1)).deletarPatio(idValido);
    }

    @Test
    @DisplayName("✅ Deve processar múltiplas deleções sequenciais")
    void deveProcessarMultiplasDelecoesSequenciais() {
        // Arrange
        Long id1 = 1L;
        Long id2 = 2L;
        Long id3 = 3L;
        
        doNothing().when(patioService).deletarPatio(anyLong());

        // Act
        ResponseEntity<Void> response1 = patioController.deletarPatio(id1);
        ResponseEntity<Void> response2 = patioController.deletarPatio(id2);
        ResponseEntity<Void> response3 = patioController.deletarPatio(id3);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response1.getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, response2.getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, response3.getStatusCode());
        
        verify(patioService, times(1)).deletarPatio(id1);
        verify(patioService, times(1)).deletarPatio(id2);
        verify(patioService, times(1)).deletarPatio(id3);
    }

    @Test
    @DisplayName("❌ Deve propagar exceções não tratadas")
    void devePropagarExcecoesNaoTratadas() {
        // Arrange
        RuntimeException runtimeException = new RuntimeException("Erro inesperado");
        doThrow(runtimeException)
                .when(patioService).deletarPatio(patioId);

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> patioController.deletarPatio(patioId)
        );

        assertEquals("Erro inesperado", exception.getMessage());
        verify(patioService, times(1)).deletarPatio(patioId);
    }

    @Test
    @DisplayName("✅ Deve retornar response vazio quando deletar com sucesso")
    void deveRetornarResponseVazioQuandoDeletarComSucesso() {
        // Arrange
        doNothing().when(patioService).deletarPatio(patioId);

        // Act
        ResponseEntity<Void> response = patioController.deletarPatio(patioId);

        // Assert
        assertNotNull(response);
        assertNull(response.getBody());
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertTrue(response.getHeaders().isEmpty() || response.getHeaders().size() == 0);
    }

    @Test
    @DisplayName("❌ Deve manter mensagem de erro original quando ResourceInUseException")
    void deveManterMensagemDeErroOriginalQuandoResourceInUseException() {
        // Arrange
        String mensagemOriginal = "Mensagem de erro específica do ResourceInUseException";
        doThrow(new ResourceInUseException(mensagemOriginal))
                .when(patioService).deletarPatio(patioId);

        // Act & Assert
        ResourceInUseException exception = assertThrows(
                ResourceInUseException.class,
                () -> patioController.deletarPatio(patioId)
        );

        assertEquals(mensagemOriginal, exception.getMessage());
        verify(patioService, times(1)).deletarPatio(patioId);
    }

    @Test
    @DisplayName("❌ Deve manter mensagem de erro original quando OperationNotAllowedException")
    void deveManterMensagemDeErroOriginalQuandoOperationNotAllowedException() {
        // Arrange
        String mensagemOriginal = "Mensagem de erro específica do OperationNotAllowedException";
        doThrow(new OperationNotAllowedException(mensagemOriginal))
                .when(patioService).deletarPatio(patioId);

        // Act & Assert
        OperationNotAllowedException exception = assertThrows(
                OperationNotAllowedException.class,
                () -> patioController.deletarPatio(patioId)
        );

        assertEquals(mensagemOriginal, exception.getMessage());
        verify(patioService, times(1)).deletarPatio(patioId);
    }
}

