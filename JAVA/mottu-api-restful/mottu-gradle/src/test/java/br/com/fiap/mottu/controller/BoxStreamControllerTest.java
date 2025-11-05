package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.service.VagaOracleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Testes para BoxStreamController - SSE de atualização de status dos boxes em tempo real.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BoxStreamController - Testes SSE")
class BoxStreamControllerTest {

    @Mock
    private VagaOracleService vagaService;

    @InjectMocks
    private BoxStreamController controller;

    private VagaOracleService.BoxComVeiculoRow boxLivre;
    private VagaOracleService.BoxComVeiculoRow boxOcupado;
    private VagaOracleService.BoxComVeiculoRow boxManutencao;

    @BeforeEach
    void setUp() {
        // Criar boxes de teste com diferentes status
        boxLivre = new VagaOracleService.BoxComVeiculoRow(
                1L, "Gru001", "L", null, null, null,
                null, null, null, null
        );

        boxOcupado = new VagaOracleService.BoxComVeiculoRow(
                2L, "Gru002", "O", LocalDate.now(), null, null,
                "ABC1234", "CB300", "Honda", "TAG001"
        );

        boxManutencao = new VagaOracleService.BoxComVeiculoRow(
                3L, "Gru003", "M", null, null, "Em manutenção",
                null, null, null, null
        );
    }

    @Test
    @DisplayName("Deve retornar stream SSE com boxes de um pátio específico")
    void deveRetornarStreamComBoxesDePatioEspecifico() {
        // Arrange
        Long patioId = 1L;
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of(boxLivre, boxOcupado, boxManutencao);
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    assertThat(boxesList).hasSize(3);
                    
                    // Verificar box livre
                    Map<String, Object> box1 = boxesList.get(0);
                    assertThat(box1.get("idBox")).isEqualTo(1L);
                    assertThat(box1.get("nome")).isEqualTo("Gru001");
                    assertThat(box1.get("status")).isEqualTo("L");
                    assertThat(box1.get("veiculo")).isNull();
                    
                    // Verificar box ocupado
                    Map<String, Object> box2 = boxesList.get(1);
                    assertThat(box2.get("idBox")).isEqualTo(2L);
                    assertThat(box2.get("nome")).isEqualTo("Gru002");
                    assertThat(box2.get("status")).isEqualTo("O");
                    assertThat(box2.get("veiculo")).isNotNull();
                    
                    // Verificar box em manutenção
                    Map<String, Object> box3 = boxesList.get(2);
                    assertThat(box3.get("idBox")).isEqualTo(3L);
                    assertThat(box3.get("nome")).isEqualTo("Gru003");
                    assertThat(box3.get("status")).isEqualTo("M");
                    assertThat(box3.get("veiculo")).isNull();
                    
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));

        verify(vagaService, atLeastOnce()).listarBoxesComDetalhesVeiculo(patioId);
    }

    @Test
    @DisplayName("Deve retornar stream SSE com todos os boxes quando patioId é null")
    void deveRetornarStreamComTodosBoxesQuandoPatioIdNull() {
        // Arrange
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of(boxLivre, boxOcupado, boxManutencao);
        
        when(vagaService.listarBoxesComDetalhesVeiculo())
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(null);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    assertThat(boxesList).hasSize(3);
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));

        verify(vagaService, atLeastOnce()).listarBoxesComDetalhesVeiculo();
        verify(vagaService, never()).listarBoxesComDetalhesVeiculo(anyLong());
    }

    @Test
    @DisplayName("Deve preservar status original do box (L, O, M)")
    void devePreservarStatusOriginalDoBox() {
        // Arrange
        Long patioId = 1L;
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of(
                boxLivre,  // Status 'L'
                boxOcupado, // Status 'O'
                boxManutencao // Status 'M'
        );
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    assertThat(boxesList).hasSize(3);
                    
                    // Verificar que os status foram preservados
                    assertThat(boxesList.get(0).get("status")).isEqualTo("L");
                    assertThat(boxesList.get(1).get("status")).isEqualTo("O");
                    assertThat(boxesList.get(2).get("status")).isEqualTo("M");
                    
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    @DisplayName("Deve incluir dados do veículo quando box está ocupado")
    void deveIncluirDadosVeiculoQuandoBoxOcupado() {
        // Arrange
        Long patioId = 1L;
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of(boxOcupado);
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    assertThat(boxesList).hasSize(1);
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> veiculo = (Map<String, Object>) boxesList.get(0).get("veiculo");
                    
                    assertThat(veiculo).isNotNull();
                    assertThat(veiculo.get("placa")).isEqualTo("ABC1234");
                    assertThat(veiculo.get("modelo")).isEqualTo("CB300");
                    assertThat(veiculo.get("fabricante")).isEqualTo("Honda");
                    assertThat(veiculo.get("tagBleId")).isEqualTo("TAG001");
                    
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    @DisplayName("Deve retornar veiculo null quando box não está ocupado")
    void deveRetornarVeiculoNullQuandoBoxNaoOcupado() {
        // Arrange
        Long patioId = 1L;
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of(boxLivre, boxManutencao);
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    assertThat(boxesList).hasSize(2);
                    
                    // Box livre deve ter veiculo null
                    assertThat(boxesList.get(0).get("veiculo")).isNull();
                    
                    // Box em manutenção deve ter veiculo null
                    assertThat(boxesList.get(1).get("veiculo")).isNull();
                    
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    @DisplayName("Deve lidar com erro e retornar lista vazia")
    void deveLidarComErroERetornarListaVazia() {
        // Arrange
        Long patioId = 1L;
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenThrow(new RuntimeException("Erro ao buscar boxes"));

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    // Quando há erro, deve retornar lista vazia
                    assertThat(boxesList).isEmpty();
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));

        verify(vagaService, atLeastOnce()).listarBoxesComDetalhesVeiculo(patioId);
    }

    @Test
    @DisplayName("Deve atualizar stream a cada 3 segundos")
    void deveAtualizarStreamACada3Segundos() {
        // Arrange
        Long patioId = 1L;
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of(boxLivre);
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert - verificar que recebe múltiplas atualizações
        StepVerifier.create(flux)
                .expectNextCount(1) // Primeira atualização imediata
                .thenAwait(Duration.ofSeconds(3)) // Aguardar 3 segundos
                .expectNextCount(1) // Segunda atualização após 3 segundos
                .thenCancel()
                .verify(Duration.ofSeconds(10));

        // Verificar que o serviço foi chamado múltiplas vezes devido ao intervalo
        verify(vagaService, atLeast(2)).listarBoxesComDetalhesVeiculo(patioId);
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando não há boxes")
    void deveRetornarListaVaziaQuandoNaoHaBoxes() {
        // Arrange
        Long patioId = 1L;
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of();
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    assertThat(boxesList).isEmpty();
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    @DisplayName("Deve mapear corretamente box com veiculo parcialmente preenchido")
    void deveMapearCorretamenteBoxComVeiculoParcialmentePreenchido() {
        // Arrange
        Long patioId = 1L;
        VagaOracleService.BoxComVeiculoRow boxComVeiculoParcial = new VagaOracleService.BoxComVeiculoRow(
                4L, "Gru004", "O", LocalDate.now(), null, null,
                "XYZ5678", null, null, null // Apenas placa preenchida
        );
        
        List<VagaOracleService.BoxComVeiculoRow> boxes = List.of(boxComVeiculoParcial);
        
        when(vagaService.listarBoxesComDetalhesVeiculo(patioId))
                .thenReturn(boxes);

        // Act
        Flux<List<Map<String, Object>>> flux = controller.streamBoxesStatus(patioId);

        // Assert
        StepVerifier.create(flux)
                .expectNextMatches(boxesList -> {
                    assertThat(boxesList).hasSize(1);
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> veiculo = (Map<String, Object>) boxesList.get(0).get("veiculo");
                    
                    assertThat(veiculo).isNotNull();
                    assertThat(veiculo.get("placa")).isEqualTo("XYZ5678");
                    // O controller usa LinkedHashMap que aceita null
                    assertThat(veiculo.get("modelo")).isEqualTo(""); 
                    assertThat(veiculo.get("fabricante")).isEqualTo(""); 
                    // tagBleId pode ser null no LinkedHashMap
                    assertThat(veiculo.get("tagBleId")).isNull(); 
                    
                    return true;
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }
}

