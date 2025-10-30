package br.com.fiap.mottu.controller.relatorio.manutencao;

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
class ManutencaoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve retornar 200 e resumo em /resumo")
    void resumo_ok() throws Exception {
        mockMvc.perform(get("/api/relatorios/manutencao/resumo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendentes").exists())
                .andExpect(jsonPath("$.concluidas").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 quando fim < inicio em /resumo")
    void resumo_periodo_invalido() throws Exception {
        mockMvc.perform(get("/api/relatorios/manutencao/resumo")
                        .param("inicio", "2025-10-10")
                        .param("fim", "2025-10-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando período > 360 dias em /resumo")
    void resumo_periodo_maior_90() throws Exception {
        mockMvc.perform(get("/api/relatorios/manutencao/resumo")
                        .param("inicio", "2024-01-01")
                        .param("fim", "2025-04-15"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 200 e lista em /resumo-por-patio")
    void resumo_por_patio_ok() throws Exception {
        mockMvc.perform(get("/api/relatorios/manutencao/resumo-por-patio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].patioId").exists());
    }
}


