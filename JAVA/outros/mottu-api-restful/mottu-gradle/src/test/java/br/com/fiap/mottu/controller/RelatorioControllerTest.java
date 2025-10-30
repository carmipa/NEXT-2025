package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.service.LogMovimentacaoService;
import br.com.fiap.mottu.service.RelatorioService;
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

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RelatorioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RelatorioService relatorioService;

    @Mock
    private LogMovimentacaoService logMovimentacaoService;

    @InjectMocks
    private RelatorioController relatorioController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(relatorioController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void getDashboardIA_DeveRetornarDadosIA() throws Exception {
        // Arrange
        Map<String, Object> dadosIA = new HashMap<>();
        dadosIA.put("previsao1h", 85.5);
        dadosIA.put("picoMaximo", 95.0);
        dadosIA.put("confiancaMedia", 87.3);
        dadosIA.put("tendencia", "CRESCENTE");
        
        when(relatorioService.getDadosDashboardIA()).thenReturn(dadosIA);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/dashboard-ia")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.previsao1h").value(85.5))
                .andExpect(jsonPath("$.picoMaximo").value(95.0))
                .andExpect(jsonPath("$.confiancaMedia").value(87.3))
                .andExpect(jsonPath("$.tendencia").value("CRESCENTE"));

        verify(relatorioService).getDadosDashboardIA();
    }

    @Test
    void getComportamental_DeveRetornarAnaliseComportamental() throws Exception {
        // Arrange
        Map<String, Object> dadosComportamental = new HashMap<>();
        dadosComportamental.put("horariosPico", new String[]{"08:00", "12:00", "18:00"});
        dadosComportamental.put("frequenciaMedia", 3.5);
        dadosComportamental.put("preferencias", new String[]{"Box próximo à entrada", "Box coberto"});
        
        when(relatorioService.getAnaliseComportamental()).thenReturn(dadosComportamental);

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/comportamental")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.horariosPico").isArray())
                .andExpect(jsonPath("$.frequenciaMedia").value(3.5))
                .andExpect(jsonPath("$.preferencias").isArray());

        verify(relatorioService).getAnaliseComportamental();
    }

    @Test
    void getDashboardIA_DeveRetornarErro500_QuandoServicoFalha() throws Exception {
        // Arrange
        when(relatorioService.getDadosDashboardIA()).thenThrow(new RuntimeException("Erro interno"));

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/dashboard-ia")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(relatorioService).getDadosDashboardIA();
    }

    @Test
    void getComportamental_DeveRetornarErro500_QuandoServicoFalha() throws Exception {
        // Arrange
        when(relatorioService.getAnaliseComportamental()).thenThrow(new RuntimeException("Erro interno"));

        // Act & Assert
        mockMvc.perform(get("/api/relatorios/comportamental")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(relatorioService).getAnaliseComportamental();
    }
}