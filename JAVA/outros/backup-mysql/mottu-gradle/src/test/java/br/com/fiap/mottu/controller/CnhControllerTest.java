package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.cnh.CnhRequestDto;
import br.com.fiap.mottu.dto.cnh.CnhResponseDto;
import br.com.fiap.mottu.service.CnhService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes para o CnhController
 */
@WebMvcTest(CnhController.class)
class CnhControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CnhService cnhService;

    @Autowired
    private ObjectMapper objectMapper;

    private CnhRequestDto criarCnhRequestDto() {
        return new CnhRequestDto(
            LocalDate.of(2020, 1, 15),
            LocalDate.of(2030, 1, 15),
            "12345678901",
            "B",
            1L
        );
    }

    private CnhResponseDto criarCnhResponseDto() {
        return new CnhResponseDto(
            1L,
            LocalDate.of(2020, 1, 15),
            LocalDate.of(2030, 1, 15),
            "12345678901",
            "B",
            1L,
            "João Silva",
            "12345678901",
            LocalDateTime.now(),
            LocalDateTime.now(),
            false,
            false,
            3650L,
            false,
            true
        );
    }

    @Test
    void criarCnh_DeveRetornar201_QuandoDadosValidos() throws Exception {
        // Arrange
        CnhRequestDto requestDto = criarCnhRequestDto();
        CnhResponseDto responseDto = criarCnhResponseDto();
        
        when(cnhService.criar(any(CnhRequestDto.class))).thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(post("/api/cnh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCnh").value(1L))
                .andExpect(jsonPath("$.numeroRegistro").value("12345678901"))
                .andExpect(jsonPath("$.categoria").value("B"));
    }

    @Test
    void buscarPorId_DeveRetornar200_QuandoCnhExiste() throws Exception {
        // Arrange
        CnhResponseDto responseDto = criarCnhResponseDto();
        when(cnhService.buscarPorId(1L)).thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCnh").value(1L))
                .andExpect(jsonPath("$.numeroRegistro").value("12345678901"));
    }

    @Test
    void buscarPorNumeroRegistro_DeveRetornar200_QuandoCnhExiste() throws Exception {
        // Arrange
        CnhResponseDto responseDto = criarCnhResponseDto();
        when(cnhService.buscarPorNumeroRegistro("12345678901")).thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/numero/12345678901"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroRegistro").value("12345678901"));
    }

    @Test
    void buscarPorCliente_DeveRetornar200_QuandoCnhExiste() throws Exception {
        // Arrange
        CnhResponseDto responseDto = criarCnhResponseDto();
        when(cnhService.buscarPorCliente(1L)).thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/cliente/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clienteId").value(1L));
    }

    @Test
    void listar_DeveRetornar200_ComListaPaginada() throws Exception {
        // Arrange
        List<CnhResponseDto> cnhs = Arrays.asList(criarCnhResponseDto());
        Page<CnhResponseDto> page = new PageImpl<>(cnhs, PageRequest.of(0, 20), 1);
        when(cnhService.listar(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/cnh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].idCnh").value(1L));
    }

    @Test
    void buscarPorCategoria_DeveRetornar200_ComCnhsDaCategoria() throws Exception {
        // Arrange
        List<CnhResponseDto> cnhs = Arrays.asList(criarCnhResponseDto());
        Page<CnhResponseDto> page = new PageImpl<>(cnhs, PageRequest.of(0, 20), 1);
        when(cnhService.buscarPorCategoria("B", any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/categoria/B"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].categoria").value("B"));
    }

    @Test
    void buscarVencidas_DeveRetornar200_ComCnhsVencidas() throws Exception {
        // Arrange
        List<CnhResponseDto> cnhs = Arrays.asList(criarCnhResponseDto());
        Page<CnhResponseDto> page = new PageImpl<>(cnhs, PageRequest.of(0, 20), 1);
        when(cnhService.buscarVencidas(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/vencidas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void buscarProximasVencimento_DeveRetornar200_ComCnhsProximasVencimento() throws Exception {
        // Arrange
        List<CnhResponseDto> cnhs = Arrays.asList(criarCnhResponseDto());
        Page<CnhResponseDto> page = new PageImpl<>(cnhs, PageRequest.of(0, 20), 1);
        when(cnhService.buscarProximasVencimento(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/proximas-vencimento"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void buscarPermitemMotos_DeveRetornar200_ComCnhsQuePermitemMotos() throws Exception {
        // Arrange
        List<CnhResponseDto> cnhs = Arrays.asList(criarCnhResponseDto());
        Page<CnhResponseDto> page = new PageImpl<>(cnhs, PageRequest.of(0, 20), 1);
        when(cnhService.buscarPermitemMotos(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/permitem-motos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void buscarPermitemCarros_DeveRetornar200_ComCnhsQuePermitemCarros() throws Exception {
        // Arrange
        List<CnhResponseDto> cnhs = Arrays.asList(criarCnhResponseDto());
        Page<CnhResponseDto> page = new PageImpl<>(cnhs, PageRequest.of(0, 20), 1);
        when(cnhService.buscarPermitemCarros(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/permitem-carros"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void atualizar_DeveRetornar200_QuandoAtualizacaoSucesso() throws Exception {
        // Arrange
        CnhRequestDto requestDto = criarCnhRequestDto();
        CnhResponseDto responseDto = criarCnhResponseDto();
        
        when(cnhService.atualizar(eq(1L), any(CnhRequestDto.class))).thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(put("/api/cnh/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCnh").value(1L));
    }

    @Test
    void excluir_DeveRetornar204_QuandoExclusaoSucesso() throws Exception {
        // Arrange
        // Mock do service não precisa retornar nada para delete

        // Act & Assert
        mockMvc.perform(delete("/api/cnh/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void contarVencidas_DeveRetornar200_ComContagem() throws Exception {
        // Arrange
        when(cnhService.contarVencidas()).thenReturn(5L);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/estatisticas/vencidas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(5));
    }

    @Test
    void contarProximasVencimento_DeveRetornar200_ComContagem() throws Exception {
        // Arrange
        when(cnhService.contarProximasVencimento()).thenReturn(3L);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/estatisticas/proximas-vencimento"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(3));
    }

    @Test
    void clientePossuiCnh_DeveRetornar200_ComBoolean() throws Exception {
        // Arrange
        when(cnhService.clientePossuiCnh(1L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/cliente/1/possui"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));
    }

    @Test
    void isCnhVencida_DeveRetornar200_ComBoolean() throws Exception {
        // Arrange
        when(cnhService.isCnhVencida(1L)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/1/vencida"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(false));
    }

    @Test
    void isCnhProximaVencimento_DeveRetornar200_ComBoolean() throws Exception {
        // Arrange
        when(cnhService.isCnhProximaVencimento(1L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/cnh/1/proxima-vencimento"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));
    }
}




