package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.zona.ZonaRequestDto;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.mapper.ZonaMapper;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Zona;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.ZonaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ZonaServiceTest {

	@Mock
	private ZonaRepository zonaRepository;

	@Mock
	private PatioRepository patioRepository;

	@Mock
	private ZonaMapper zonaMapper;

	@InjectMocks
	private ZonaService zonaService;

	private Patio patio;
	private Zona zona;
	private ZonaRequestDto request;

	@BeforeEach
	void setup() {
		patio = new Patio();
		patio.setIdPatio(1L);
		patio.setStatus("A");
		patio.setNomePatio("Pátio A");

		zona = new Zona();
		zona.setIdZona(10L);
		zona.setNome("Zona A");
		zona.setStatus("A");

		request = new ZonaRequestDto(
			"Zona A",
			"A",
			"obs",
			1L,
			"A"
		);
	}

	@Test
	void listarTodasZonas_deveRetornarPagina() {
		Pageable pageable = PageRequest.of(0, 10);
		Page<Zona> page = new PageImpl<>(List.of(zona));
		when(zonaRepository.findAll(pageable)).thenReturn(page);

		Page<Zona> result = zonaService.listarTodasZonas(pageable);
		assertEquals(1, result.getTotalElements());
		verify(zonaRepository).findAll(pageable);
	}

	@Test
	void buscarZonaPorId_existente_deveRetornar() {
		when(zonaRepository.findById(10L)).thenReturn(Optional.of(zona));
		Zona result = zonaService.buscarZonaPorId(10L);
		assertEquals(10L, result.getIdZona());
		verify(zonaRepository).findById(10L);
	}

	@Test
	void buscarZonaPorId_inexistente_deveLancar() {
		when(zonaRepository.findById(999L)).thenReturn(Optional.empty());
		assertThrows(ResourceNotFoundException.class, () -> zonaService.buscarZonaPorId(999L));
	}

	@Test
	void criarZona_sucesso_associaPatio() {
		when(patioRepository.findByIdPatio(1L)).thenReturn(Optional.of(patio));
		when(zonaRepository.existsByNomeIgnoreCaseAndPatioIdPatio("Zona A", 1L)).thenReturn(false);
		when(zonaMapper.toEntity(request)).thenReturn(zona);
		when(zonaRepository.save(any(Zona.class))).thenReturn(zona);

		Zona criada = zonaService.criarZona(request);
		assertNotNull(criada);
		verify(patioRepository).findByIdPatio(1L);
		verify(zonaRepository).save(zona);
	}

	@Test
	void criarZona_nomeDuplicadoNoMesmoPatio_deveLancar() {
		when(patioRepository.findByIdPatio(1L)).thenReturn(Optional.of(patio));
		when(zonaRepository.existsByNomeIgnoreCaseAndPatioIdPatio("Zona A", 1L)).thenReturn(true);
		assertThrows(DuplicatedResourceException.class, () -> zonaService.criarZona(request));
	}

	@Test
	void criarZona_patioInexistente_deveLancar() {
		when(patioRepository.findByIdPatio(1L)).thenReturn(Optional.empty());
		assertThrows(ResourceNotFoundException.class, () -> zonaService.criarZona(request));
	}
}
