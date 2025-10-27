package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.mapper.BoxMapper;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.model.Zona;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.ZonaRepository;
import br.com.fiap.mottu.repository.relacionamento.VeiculoBoxRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para BoxService
 * Verifica funcionalidades de CRUD, filtros e associação com Pátio
 */
@ExtendWith(MockitoExtension.class)
class BoxServiceTest {

    @Mock
    private BoxRepository boxRepository;

    @Mock
    private ZonaRepository zonaRepository;

    @Mock
    private PatioRepository patioRepository;

    @Mock
    private VeiculoRepository veiculoRepository;

    @Mock
    private VeiculoBoxRepository veiculoBoxRepository;

    @Mock
    private BoxMapper boxMapper;

    @InjectMocks
    private BoxService boxService;

    private Box box;
    private Zona zona;
    private BoxRequestDto boxRequestDto;

    @BeforeEach
    void setUp() {
        zona = new Zona();
        zona.setIdZona(10L);
        zona.setStatus("A");
        zona.setNome("Zona A");

        box = new Box();
        box.setIdBox(1L);
        box.setNome("Box-01");
        box.setStatus("A");
        box.setDataEntrada(LocalDateTime.now());
        box.setDataSaida(LocalDateTime.now());
        box.setObservacao("Box de teste");
        // box.setZona(zona); // Removido - método não existe mais

        boxRequestDto = new BoxRequestDto(
                "Box-01",
                "A",
                null,
                null,
                "Box de teste",
                10L,
                "A"
        );
    }

    @Test
    void listarTodosBoxes_DeveRetornarPaginaDeBoxes() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Box> expectedPage = new PageImpl<>(List.of(box));
        when(boxRepository.findAll(pageable)).thenReturn(expectedPage);

        // Act
        Page<Box> result = boxService.listarTodosBoxes(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(boxRepository).findAll(pageable);
    }

    @Test
    void buscarBoxPorId_QuandoBoxExiste_DeveRetornarBox() {
        // Arrange
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));

        // Act
        Box result = boxService.buscarBoxPorId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(box.getIdBox(), result.getIdBox());
        verify(boxRepository).findById(1L);
    }

    @Test
    void buscarBoxPorId_QuandoBoxNaoExiste_DeveLancarExcecao() {
        // Arrange
        when(boxRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> boxService.buscarBoxPorId(999L));
        verify(boxRepository).findById(999L);
    }

    @Test
    void criarBox_QuandoNomeNaoExiste_DeveCriarBox() {
        // Arrange
        Patio patio = new Patio();
        patio.setIdPatio(1L);
        patio.setStatus("A");
        patio.setNomePatio("Pátio Teste");
        
        when(patioRepository.findByIdPatio(1L)).thenReturn(Optional.of(patio));
        when(boxRepository.existsByNomeIgnoreCaseAndPatioIdPatio("Box-01", 1L)).thenReturn(false);
        when(boxMapper.toEntity(boxRequestDto)).thenReturn(box);
        when(boxRepository.save(any(Box.class))).thenReturn(box);

        // Act
        Box result = boxService.criarBox(boxRequestDto);

        // Assert
        assertNotNull(result);
        verify(patioRepository).findByIdPatio(1L);
        verify(boxRepository).existsByNomeIgnoreCaseAndPatioIdPatio("Box-01", 1L);
        verify(boxRepository).save(box);
    }

    @Test
    void criarBox_QuandoNomeJaExiste_DeveLancarExcecao() {
        // Arrange
        Patio patio = new Patio();
        patio.setIdPatio(1L);
        patio.setStatus("A");
        patio.setNomePatio("Pátio Teste");
        
        when(patioRepository.findByIdPatio(1L)).thenReturn(Optional.of(patio));
        when(boxRepository.existsByNomeIgnoreCaseAndPatioIdPatio("Box-01", 1L)).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicatedResourceException.class, () -> boxService.criarBox(boxRequestDto));
        verify(patioRepository).findByIdPatio(1L);
        verify(boxRepository).existsByNomeIgnoreCaseAndPatioIdPatio("Box-01", 1L);
        verify(boxRepository, never()).save(any());
    }


    @Test
    void atualizarBox_QuandoBoxExiste_DeveAtualizarBox() {
        // Arrange
        Patio patio = new Patio();
        patio.setIdPatio(1L);
        patio.setStatus("A");
        patio.setNomePatio("Pátio Teste");
        
        Box boxExistente = new Box();
        boxExistente.setIdBox(1L);
        boxExistente.setNome("Box-01");
        boxExistente.setPatio(patio);

        when(boxRepository.findById(1L)).thenReturn(Optional.of(boxExistente));
        when(boxRepository.findByPatioIdAndNome(1L, "Box-01")).thenReturn(Optional.empty());
        when(boxRepository.save(any(Box.class))).thenReturn(boxExistente);

        // Act
        Box result = boxService.atualizarBox(1L, boxRequestDto);

        // Assert
        assertNotNull(result);
        verify(boxRepository).findById(1L);
        verify(boxRepository).save(boxExistente);
    }

    @Test
    void deletarBox_QuandoBoxExiste_DeveDeletarBox() {
        // Arrange
        Patio patio = new Patio();
        patio.setIdPatio(1L);
        patio.setStatus("A");
        patio.setNomePatio("Pátio Teste");
        
        Box boxExistente = new Box();
        boxExistente.setIdBox(1L);
        boxExistente.setNome("Box-01");
        boxExistente.setPatio(patio);
        
        when(boxRepository.findById(1L)).thenReturn(Optional.of(boxExistente));

        // Act
        boxService.deletarBox(1L);

        // Assert
        verify(boxRepository).findById(1L);
        verify(boxRepository).delete(boxExistente);
    }

    @Test
    void deletarBox_QuandoBoxNaoExiste_DeveLancarExcecao() {
        // Arrange
        when(boxRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> boxService.deletarBox(999L));
        verify(boxRepository).findById(999L);
        verify(boxRepository, never()).delete(any(Box.class));
    }

    @Test
    void buscarBoxesPorFiltro_DeveRetornarPaginaFiltrada() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Box> expectedPage = new PageImpl<>(List.of(box));
        when(boxRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(expectedPage);

        // Act
        br.com.fiap.mottu.filter.BoxFilter filter = new br.com.fiap.mottu.filter.BoxFilter(
                null, null, null, null, null, null, null, null, null
        );
        Page<Box> result = boxService.buscarBoxesPorFiltro(filter, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(boxRepository).findAll(any(Specification.class), eq(pageable));
    }
}
