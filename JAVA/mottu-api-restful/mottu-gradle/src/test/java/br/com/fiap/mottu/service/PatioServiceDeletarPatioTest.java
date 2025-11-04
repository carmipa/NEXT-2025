package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.mapper.PatioMapper;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.*;
import br.com.fiap.mottu.repository.relacionamento.VeiculoPatioRepository;
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
 * Testes unitários para PatioService.deletarPatio()
 * Foca na validação de dependências antes de excluir um pátio
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários - PatioService.deletarPatio")
class PatioServiceDeletarPatioTest {

    @Mock
    private PatioRepository patioRepository;

    @Mock
    private EstacionamentoRepository estacionamentoRepository;

    @Mock
    private VeiculoPatioRepository veiculoPatioRepository;

    @Mock
    private BoxRepository boxRepository;

    @Mock
    private ZonaRepository zonaRepository;

    @Mock
    private PatioMapper patioMapper;

    @Mock
    private VeiculoRepository veiculoRepository;

    @Mock
    private ContatoRepository contatoRepository;

    @Mock
    private EnderecoRepository enderecoRepository;

    @Mock
    private ContatoService contatoService;

    @Mock
    private EnderecoService enderecoService;

    @InjectMocks
    private PatioService patioService;

    private Patio patio;
    private Long patioId;

    @BeforeEach
    void setUp() {
        patioId = 1L;
        patio = Patio.builder()
                .idPatio(patioId)
                .nomePatio("Pátio Teste")
                .status("A")
                .build();
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando pátio não existe")
    void deveLancarExcecaoQuandoPatioNaoExiste() {
        // Arrange
        when(patioRepository.findByIdWithContatoAndEndereco(patioId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        verify(patioRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Deve lançar ResourceInUseException quando há estacionamentos ativos")
    void deveLancarExcecaoQuandoHaEstacionamentosAtivos() {
        // Arrange
        when(patioRepository.findByIdWithContatoAndEndereco(patioId))
                .thenReturn(Optional.of(patio));
        when(estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId))
                .thenReturn(3L);

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        assertTrue(exception.getMessage().contains("estacionamento"));
        verify(patioRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Deve lançar ResourceInUseException quando há veículos associados")
    void deveLancarExcecaoQuandoHaVeiculosAssociados() {
        // Arrange
        when(patioRepository.findByIdWithContatoAndEndereco(patioId))
                .thenReturn(Optional.of(patio));
        when(estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId))
                .thenReturn(0L);
        when(veiculoPatioRepository.countByPatioIdPatio(patioId))
                .thenReturn(2L);

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        assertTrue(exception.getMessage().contains("veículo"));
        verify(patioRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Deve lançar ResourceInUseException quando há boxes")
    void deveLancarExcecaoQuandoHaBoxes() {
        // Arrange
        when(patioRepository.findByIdWithContatoAndEndereco(patioId))
                .thenReturn(Optional.of(patio));
        when(estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId))
                .thenReturn(0L);
        when(veiculoPatioRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);
        when(boxRepository.countByPatioIdPatio(patioId))
                .thenReturn(10L);

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        assertTrue(exception.getMessage().contains("box"));
        verify(patioRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Deve lançar ResourceInUseException quando há zonas")
    void deveLancarExcecaoQuandoHaZonas() {
        // Arrange
        when(patioRepository.findByIdWithContatoAndEndereco(patioId))
                .thenReturn(Optional.of(patio));
        when(estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId))
                .thenReturn(0L);
        when(veiculoPatioRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);
        when(boxRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);
        when(zonaRepository.countByPatioIdPatio(patioId))
                .thenReturn(5L);

        // Act & Assert
        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            patioService.deletarPatio(patioId);
        });

        assertTrue(exception.getMessage().contains("zona"));
        verify(patioRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Deve deletar pátio com sucesso quando não há dependências")
    void deveDeletarPatioComSucessoQuandoNaoHaDependencias() {
        // Arrange
        when(patioRepository.findByIdWithContatoAndEndereco(patioId))
                .thenReturn(Optional.of(patio));
        when(estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId))
                .thenReturn(0L);
        when(veiculoPatioRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);
        when(boxRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);
        when(zonaRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);

        // Act
        assertDoesNotThrow(() -> {
            patioService.deletarPatio(patioId);
        });

        // Assert
        verify(patioRepository, times(1)).deleteById(patioId);
        verify(estacionamentoRepository, times(1)).countByPatioIdPatioAndEstaEstacionadoTrue(patioId);
        verify(veiculoPatioRepository, times(1)).countByPatioIdPatio(patioId);
        verify(boxRepository, times(1)).countByPatioIdPatio(patioId);
        verify(zonaRepository, times(1)).countByPatioIdPatio(patioId);
    }

    @Test
    @DisplayName("Deve validar todas as dependências na ordem correta")
    void deveValidarTodasDependenciasNaOrdemCorreta() {
        // Arrange
        when(patioRepository.findByIdWithContatoAndEndereco(patioId))
                .thenReturn(Optional.of(patio));
        when(estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId))
                .thenReturn(0L);
        when(veiculoPatioRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);
        when(boxRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);
        when(zonaRepository.countByPatioIdPatio(patioId))
                .thenReturn(0L);

        // Act
        patioService.deletarPatio(patioId);

        // Assert - Verifica ordem de validação
        var inOrder = inOrder(patioRepository, estacionamentoRepository, 
                veiculoPatioRepository, boxRepository, zonaRepository);
        
        inOrder.verify(patioRepository).findByIdWithContatoAndEndereco(patioId);
        inOrder.verify(estacionamentoRepository).countByPatioIdPatioAndEstaEstacionadoTrue(patioId);
        inOrder.verify(veiculoPatioRepository).countByPatioIdPatio(patioId);
        inOrder.verify(boxRepository).countByPatioIdPatio(patioId);
        inOrder.verify(zonaRepository).countByPatioIdPatio(patioId);
        inOrder.verify(patioRepository).deleteById(patioId);
    }
}

