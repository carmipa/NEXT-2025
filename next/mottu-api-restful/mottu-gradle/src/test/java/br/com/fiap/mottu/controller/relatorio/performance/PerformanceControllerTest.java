package br.com.fiap.mottu.controller.relatorio.performance;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class PerformanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve retornar 200 e conter PID em /system")
    void system_ok() throws Exception {
        mockMvc.perform(get("/api/relatorios/performance/system"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pid").exists())
                .andExpect(jsonPath("$.availableProcessors").exists())
                .andExpect(jsonPath("$.threadCount").exists());
    }

    @Test
    @DisplayName("Deve retornar 200 e uma lista em /threads")
    void threads_ok() throws Exception {
        mockMvc.perform(get("/api/relatorios/performance/threads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists());
    }
}


