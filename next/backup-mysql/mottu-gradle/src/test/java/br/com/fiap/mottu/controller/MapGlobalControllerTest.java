package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.mapglobal.MapGlobalPatioDto;
import br.com.fiap.mottu.service.MapGlobalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes para MapGlobalController
 */
@ExtendWith(MockitoExtension.class)
class MapGlobalControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MapGlobalService mapGlobalService;

    @InjectMocks
    private MapGlobalController mapGlobalController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(mapGlobalController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void buscarTodosPatios_DeveRetornarListaDePatios() throws Exception {
        // Arrange
        MapGlobalPatioDto patio = MapGlobalPatioDto.builder()
                .id(1L)
                .nome("Mottu Patio Guarulhos")
                .endereco("Rua Antônio Pegoraro, 110 - Jardim dos Afonsos")
                .cidade("Guarulhos")
                .estado("SP")
                .cep("07115-000")
                .pais("Brasil")
                .totalVagas(100L)
                .vagasLivres(75L)
                .vagasOcupadas(20L)
                .vagasManutencao(5L)
                .percentualOcupacao(20.0)
                .status("ATIVO")
                .build();

        List<MapGlobalPatioDto> patios = List.of(patio);

        when(mapGlobalService.buscarTodosPatios()).thenReturn(patios);

        // Act & Assert
        mockMvc.perform(get("/api/mapa-global")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].nome").value("Mottu Patio Guarulhos"))
                .andExpect(jsonPath("$[0].cidade").value("Guarulhos"))
                .andExpect(jsonPath("$[0].totalVagas").value(100))
                .andExpect(jsonPath("$[0].percentualOcupacao").value(20.0));
    }

    @Test
    void buscarPatiosPorCidade_DeveRetornarPatiosDaCidade() throws Exception {
        // Arrange
        String cidade = "São Paulo";
        MapGlobalPatioDto patio = MapGlobalPatioDto.builder()
                .id(1L)
                .nome("Mottu Patio São Paulo")
                .endereco("Rua das Flores, 123 - Centro")
                .cidade("São Paulo")
                .estado("SP")
                .cep("01000-000")
                .pais("Brasil")
                .totalVagas(50L)
                .vagasLivres(30L)
                .vagasOcupadas(15L)
                .vagasManutencao(5L)
                .percentualOcupacao(30.0)
                .status("ATIVO")
                .build();

        List<MapGlobalPatioDto> patios = List.of(patio);

        when(mapGlobalService.buscarPatiosPorCidade(cidade)).thenReturn(patios);

        // Act & Assert
        mockMvc.perform(get("/api/mapa-global/cidade/{cidade}", cidade)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].nome").value("Mottu Patio São Paulo"))
                .andExpect(jsonPath("$[0].cidade").value("São Paulo"))
                .andExpect(jsonPath("$[0].totalVagas").value(50))
                .andExpect(jsonPath("$[0].percentualOcupacao").value(30.0));
    }

    @Test
    void invalidarCache_DeveRetornarSucesso() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/mapa-global/invalidate-cache")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
