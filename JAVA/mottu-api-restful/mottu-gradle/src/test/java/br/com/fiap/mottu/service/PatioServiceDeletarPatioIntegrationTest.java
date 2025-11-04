package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.*;
import br.com.fiap.mottu.repository.relacionamento.VeiculoPatioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Teste de integração para PatioService.deletarPatio()
 * Testa o método em um ambiente real com banco de dados
 */
@SpringBootTest
@Transactional
@Rollback
@DisplayName("Testes de Integração - PatioService.deletarPatio")
class PatioServiceDeletarPatioIntegrationTest {

    @Autowired
    private PatioService patioService;

    @Autowired
    private PatioRepository patioRepository;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @Autowired
    private VeiculoPatioRepository veiculoPatioRepository;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private ZonaRepository zonaRepository;

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando pátio não existe")
    void deveLancarExcecaoQuandoPatioNaoExiste() {
        // Arrange
        Long idInexistente = 999999L;

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            patioService.deletarPatio(idInexistente);
        });
    }

    @Test
    @DisplayName("Deve validar que não pode deletar pátio com estacionamentos ativos")
    void deveValidarEstacionamentosAtivos() {
        // Arrange - Buscar um pátio que tenha estacionamentos ativos (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio()) > 0)
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            assertTrue(exception.getMessage().contains("estacionamento"));
        }
    }

    @Test
    @DisplayName("Deve validar que não pode deletar pátio com boxes")
    void deveValidarBoxes() {
        // Arrange - Buscar um pátio que tenha boxes (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> {
                    long estacionamentos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio());
                    long boxes = boxRepository.countByPatioIdPatio(p.getIdPatio());
                    return estacionamentos == 0 && boxes > 0;
                })
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            assertTrue(exception.getMessage().contains("box"));
        }
    }

    @Test
    @DisplayName("Deve validar que não pode deletar pátio com zonas")
    void deveValidarZonas() {
        // Arrange - Buscar um pátio que tenha zonas mas sem boxes nem estacionamentos (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> {
                    long estacionamentos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio());
                    long boxes = boxRepository.countByPatioIdPatio(p.getIdPatio());
                    long zonas = zonaRepository.countByPatioIdPatio(p.getIdPatio());
                    return estacionamentos == 0 && boxes == 0 && zonas > 0;
                })
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            assertTrue(exception.getMessage().contains("zona"));
        }
    }

    @Test
    @DisplayName("Deve validar que não pode deletar pátio com veículos associados")
    void deveValidarVeiculosAssociados() {
        // Arrange - Buscar um pátio que tenha veículos associados mas sem outras dependências (se existir)
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> {
                    long estacionamentos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio());
                    long boxes = boxRepository.countByPatioIdPatio(p.getIdPatio());
                    long zonas = zonaRepository.countByPatioIdPatio(p.getIdPatio());
                    long veiculos = veiculoPatioRepository.countByPatioIdPatio(p.getIdPatio());
                    return estacionamentos == 0 && boxes == 0 && zonas == 0 && veiculos > 0;
                })
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            assertTrue(exception.getMessage().contains("veículo"));
        }
    }

    @Test
    @DisplayName("Deve executar validações na ordem correta")
    void deveExecutarValidacoesNaOrdemCorreta() {
        // Arrange
        Patio patio = patioRepository.findAll().stream()
                .filter(p -> estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio()) > 0)
                .findFirst()
                .orElse(null);

        if (patio != null) {
            // Act & Assert - Deve lançar exceção de estacionamento primeiro
            ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
                patioService.deletarPatio(patio.getIdPatio());
            });

            // Verifica que a mensagem é sobre estacionamento (primeira validação)
            assertTrue(exception.getMessage().contains("estacionamento"));
        }
    }
}


