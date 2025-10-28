package br.com.fiap.mottu.controller.relatorio.analytics;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve retornar 200 e KPIs em /kpis")
    void kpis_ok() throws Exception {
        mockMvc.perform(get("/api/relatorios/analytics/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEventos").exists())
                .andExpect(jsonPath("$.usuariosUnicos").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 quando período > 360 dias")
    void kpis_periodo_maior_90() throws Exception {
        mockMvc.perform(get("/api/relatorios/analytics/kpis")
                        .param("inicio", "2024-01-01")
                        .param("fim", "2025-04-15"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 202 enquanto relatório não pronto em /async-status")
    void async_status_not_ready() throws Exception {
        mockMvc.perform(get("/api/relatorios/analytics/async-status")
                        .param("jobId", "running"))
                .andExpect(status().isAccepted());
    }

    @Test
    @DisplayName("Deve retornar 200 quando relatório pronto em /async-status")
    void async_status_done() throws Exception {
        mockMvc.perform(get("/api/relatorios/analytics/async-status")
                        .param("jobId", "done"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 200 e lista em /top-veiculos")
    void top_veiculos_ok() throws Exception {
        mockMvc.perform(get("/api/relatorios/analytics/top-veiculos")
                        .param("limit", "5"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 200 e lista em /top-boxes")
    void top_boxes_ok() throws Exception {
        mockMvc.perform(get("/api/relatorios/analytics/top-boxes")
                        .param("limit", "5"))
                .andExpect(status().isOk());
    }
}


