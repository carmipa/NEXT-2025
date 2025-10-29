package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.relatorio.OcupacaoAtualDto;
import br.com.fiap.mottu.mapper.LogMovimentacaoMapper;
import br.com.fiap.mottu.model.LogMovimentacao;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.LogMovimentacaoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.service.relatorios.OcupacaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    @Mock
    private LogMovimentacaoRepository logRepository;

    @Mock
    private PatioRepository patioRepository;

    @Mock
    private BoxRepository boxRepository;

    @Mock
    private LogMovimentacaoMapper mapper;

    @Mock
    private OcupacaoService ocupacaoService;

    @InjectMocks
    private RelatorioService relatorioService;

    @BeforeEach
    void setUp() {
        // Setup comum para todos os testes
    }

    @Test
    void getDadosDashboardIA_DeveRetornarDadosIA() {
        // Arrange
        List<OcupacaoAtualDto> ocupacaoAtual = List.of(
                OcupacaoAtualDto.builder()
                        .patioId(1L)
                        .nomePatio("Patio Teste")
                        .totalBoxes(10)
                        .boxesOcupados(7)
                        .boxesLivres(3)
                        .taxaOcupacao(70.0)
                        .build()
        );
        
        when(ocupacaoService.getOcupacaoAtual()).thenReturn(ocupacaoAtual);

        // Act
        Map<String, Object> resultado = relatorioService.getDadosDashboardIA();

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.containsKey("previsao1h"));
        assertTrue(resultado.containsKey("picoMaximo"));
        assertTrue(resultado.containsKey("confiancaMedia"));
        assertTrue(resultado.containsKey("tendencia"));
        assertTrue(resultado.containsKey("dadosGrafico"));
        assertTrue(resultado.containsKey("insights"));

        verify(ocupacaoService).getOcupacaoAtual();
    }

    @Test
    void getAnaliseComportamental_DeveRetornarAnaliseComportamental() {
        // Arrange
        List<LogMovimentacao> movimentacoes = List.of();
        when(logRepository.findAll()).thenReturn(movimentacoes);

        // Act
        Map<String, Object> resultado = relatorioService.getAnaliseComportamental();

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.containsKey("horariosPico"));
        assertTrue(resultado.containsKey("diasSemana"));
        assertTrue(resultado.containsKey("tiposVeiculo"));
        assertTrue(resultado.containsKey("recomendacoes"));

        verify(logRepository).findAll();
    }

    @Test
    void getDadosDashboardIA_DeveLancarExcecao_QuandoOcupacaoServiceFalha() {
        // Arrange
        when(ocupacaoService.getOcupacaoAtual()).thenThrow(new RuntimeException("Erro no serviço"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> relatorioService.getDadosDashboardIA());
        
        verify(ocupacaoService).getOcupacaoAtual();
    }

    @Test
    void getAnaliseComportamental_DeveLancarExcecao_QuandoLogRepositoryFalha() {
        // Arrange
        when(logRepository.findAll()).thenThrow(new RuntimeException("Erro no repositório"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> relatorioService.getAnaliseComportamental());
        
        verify(logRepository).findAll();
    }
}