package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.OperationNotAllowedException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.mapper.BoxMapper;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.relacionamento.VeiculoBoxRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para BoxService.deletarBox()
 * Valida as regras de negócio para exclusão de boxes
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários - BoxService.deletarBox")
class BoxServiceDeletarBoxTest {

    @Mock
    private BoxRepository boxRepository;

    @Mock
    private BoxMapper boxMapper;

    @Mock
    private PatioRepository patioRepository;

    @Mock
    private VeiculoRepository veiculoRepository;

    @Mock
    private VeiculoBoxRepository veiculoBoxRepository;

    @InjectMocks
    private BoxService boxService;

    private Patio patioMock;
    private Box boxMock;

    @BeforeEach
    void setUp() {
        // Setup do Pátio
        patioMock = new Patio();
        patioMock.setIdPatio(17L);
        patioMock.setNomePatio("Pátio Curitiba");
        patioMock.setStatus("A");

        // Setup do Box
        boxMock = new Box();
        boxMock.setIdBox(1073L);
        boxMock.setNome("curitiba001");
        boxMock.setStatus("L"); // Livre
        boxMock.setPatio(patioMock);
    }

    @Test
    @DisplayName("Deve lançar exceção quando box não existe")
    void deveLancarExcecaoQuandoBoxNaoExiste() {
        // Arrange
        when(boxRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            boxService.deletarBox(999L);
        });

        verify(boxRepository, times(1)).findById(999L);
        verify(boxRepository, never()).delete((Box) any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando tentar deletar o último box do pátio")
    void deveLancarExcecaoQuandoDeletarUltimoBox() {
        // Arrange
        when(boxRepository.findById(1073L)).thenReturn(Optional.of(boxMock));
        when(boxRepository.countByPatioIdPatio(17L)).thenReturn(1L); // Apenas 1 box no pátio

        // Act & Assert
        OperationNotAllowedException exception = assertThrows(OperationNotAllowedException.class, () -> {
            boxService.deletarBox(1073L);
        });

        assertTrue(exception.getMessage().contains("único box do pátio"));
        assertTrue(exception.getMessage().contains("curitiba001"));
        assertTrue(exception.getMessage().contains("Pátio Curitiba"));

        verify(boxRepository, times(1)).findById(1073L);
        verify(boxRepository, times(1)).countByPatioIdPatio(17L);
        verify(boxRepository, never()).delete((Box) any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando box está ocupado")
    void deveLancarExcecaoQuandoBoxEstaOcupado() {
        // Arrange
        boxMock.setStatus("O"); // Ocupado
        when(boxRepository.findById(1073L)).thenReturn(Optional.of(boxMock));
        when(boxRepository.countByPatioIdPatio(17L)).thenReturn(10L); // 10 boxes no pátio

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            boxService.deletarBox(1073L);
        });

        assertTrue(exception.getMessage().contains("ocupado"));

        verify(boxRepository, times(1)).findById(1073L);
        verify(boxRepository, times(1)).countByPatioIdPatio(17L);
        verify(boxRepository, never()).delete((Box) any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando box tem veículos associados")
    void deveLancarExcecaoQuandoBoxTemVeiculosAssociados() {
        // Arrange
        when(boxRepository.findById(1073L)).thenReturn(Optional.of(boxMock));
        when(boxRepository.countByPatioIdPatio(17L)).thenReturn(10L); // 10 boxes no pátio
        when(veiculoBoxRepository.countByBoxIdBox(1073L)).thenReturn(2L); // 2 veículos associados

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            boxService.deletarBox(1073L);
        });

        assertTrue(exception.getMessage().contains("veículos"));

        verify(boxRepository, times(1)).findById(1073L);
        verify(boxRepository, times(1)).countByPatioIdPatio(17L);
        verify(veiculoBoxRepository, times(1)).countByBoxIdBox(1073L);
        verify(boxRepository, never()).delete((Box) any());
    }

    @Test
    @DisplayName("Deve deletar box com sucesso quando todas as validações passam")
    void deveDeletarBoxComSucesso() {
        // Arrange
        when(boxRepository.findById(1073L)).thenReturn(Optional.of(boxMock));
        when(boxRepository.countByPatioIdPatio(17L)).thenReturn(10L); // 10 boxes no pátio
        when(veiculoBoxRepository.countByBoxIdBox(1073L)).thenReturn(0L); // Sem veículos

        // Act
        assertDoesNotThrow(() -> {
            boxService.deletarBox(1073L);
        });

        // Assert
        verify(boxRepository, times(1)).findById(1073L);
        verify(boxRepository, times(1)).countByPatioIdPatio(17L);
        verify(veiculoBoxRepository, times(1)).countByBoxIdBox(1073L);
        verify(boxRepository, times(1)).delete(boxMock);
    }

    @Test
    @DisplayName("Deve permitir deletar múltiplos boxes mas não o último")
    void devePermitirDeletarMultiplosBoxesMasNaoOUltimo() {
        // Arrange - Simula 10 boxes no pátio
        when(boxRepository.findById(anyLong())).thenReturn(Optional.of(boxMock));
        when(veiculoBoxRepository.countByBoxIdBox(anyLong())).thenReturn(0L);

        // Deletar 9 boxes com sucesso
        for (int i = 10; i > 1; i--) {
            when(boxRepository.countByPatioIdPatio(17L)).thenReturn((long) i);
            assertDoesNotThrow(() -> boxService.deletarBox(1073L));
        }

        // Tentar deletar o último box deve falhar
        when(boxRepository.countByPatioIdPatio(17L)).thenReturn(1L);
        assertThrows(OperationNotAllowedException.class, () -> {
            boxService.deletarBox(1073L);
        });
    }
}

