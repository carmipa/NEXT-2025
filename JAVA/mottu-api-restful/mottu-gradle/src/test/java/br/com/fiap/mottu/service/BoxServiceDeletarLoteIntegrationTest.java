package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.exception.OperationNotAllowedException;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes de integração para validar a exclusão de boxes em lote
 * Simula o cenário de edição em lote onde múltiplos boxes são deletados
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Testes de Integração - Deletar Boxes em Lote")
class BoxServiceDeletarLoteIntegrationTest {

    @Autowired
    private BoxService boxService;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private PatioRepository patioRepository;

    private Patio patioTeste;
    private List<Long> boxIdsParaLimpar;

    @BeforeEach
    void setUp() {
        boxIdsParaLimpar = new ArrayList<>();
        
        // Criar pátio de teste
        patioTeste = new Patio();
        patioTeste.setNomePatio("Pátio Teste Lote");
        patioTeste.setStatus("A");
        patioTeste = patioRepository.save(patioTeste);
        
        System.out.println("✅ Pátio criado: ID " + patioTeste.getIdPatio());
    }

    @AfterEach
    void tearDown() {
        // Limpar boxes criados
        for (Long boxId : boxIdsParaLimpar) {
            try {
                boxRepository.deleteById(boxId);
            } catch (Exception e) {
                // Ignora erros de limpeza
            }
        }
        
        // Limpar pátio
        if (patioTeste != null && patioTeste.getIdPatio() != null) {
            try {
                patioRepository.deleteById(patioTeste.getIdPatio());
            } catch (Exception e) {
                // Ignora erros de limpeza
            }
        }
    }

    @Test
    @DisplayName("Deve criar 10 boxes e deletar 9 com sucesso, mas não o último")
    void deveCriar10BoxesDeletar9MasNaoOUltimo() {
        // Arrange - Criar 10 boxes
        for (int i = 1; i <= 10; i++) {
            BoxRequestDto dto = new BoxRequestDto();
            dto.setNome("TesteLote" + String.format("%03d", i));
            dto.setStatus("L");
            dto.setDataEntrada(LocalDateTime.now());
            dto.setDataSaida(LocalDateTime.now());
            dto.setObservacao("Box de teste");
            dto.setPatioId(patioTeste.getIdPatio());
            dto.setPatioStatus("A");

            Box box = boxService.criarBox(dto);
            boxIdsParaLimpar.add(box.getIdBox());
            System.out.println("✅ Box criado: " + box.getNome() + " (ID: " + box.getIdBox() + ")");
        }

        // Verificar que foram criados 10 boxes
        long totalBoxes = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
        assertEquals(10L, totalBoxes, "Deveria ter exatamente 10 boxes");

        // Act - Deletar 9 boxes (deixando apenas 1)
        int boxesDeletados = 0;
        for (int i = 0; i < 9; i++) {
            Long boxId = boxIdsParaLimpar.get(i);
            
            System.out.println("🗑️ Deletando box ID: " + boxId);
            assertDoesNotThrow(() -> boxService.deletarBox(boxId));
            boxesDeletados++;
            
            long boxesRestantes = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
            System.out.println("   Boxes restantes: " + boxesRestantes);
        }

        assertEquals(9, boxesDeletados, "Deveria ter deletado 9 boxes");

        // Verificar que resta apenas 1 box
        totalBoxes = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
        assertEquals(1L, totalBoxes, "Deveria restar exatamente 1 box");

        // Assert - Tentar deletar o último box deve falhar
        Long ultimoBoxId = boxIdsParaLimpar.get(9);
        System.out.println("❌ Tentando deletar o último box ID: " + ultimoBoxId);
        
        OperationNotAllowedException exception = assertThrows(OperationNotAllowedException.class, () -> {
            boxService.deletarBox(ultimoBoxId);
        });

        assertTrue(exception.getMessage().contains("único box do pátio"));
        System.out.println("✅ Exceção capturada corretamente: " + exception.getMessage());

        // Verificar que o box não foi deletado
        totalBoxes = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
        assertEquals(1L, totalBoxes, "O último box não deveria ter sido deletado");
    }

    @Test
    @DisplayName("Deve falhar ao tentar deletar todos os boxes de uma vez")
    void deveFalharAoDeletarTodosOsBoxes() {
        // Arrange - Criar 10 boxes
        for (int i = 1; i <= 10; i++) {
            BoxRequestDto dto = new BoxRequestDto();
            dto.setNome("TesteFalha" + String.format("%03d", i));
            dto.setStatus("L");
            dto.setDataEntrada(LocalDateTime.now());
            dto.setDataSaida(LocalDateTime.now());
            dto.setObservacao("Box de teste");
            dto.setPatioId(patioTeste.getIdPatio());
            dto.setPatioStatus("A");

            Box box = boxService.criarBox(dto);
            boxIdsParaLimpar.add(box.getIdBox());
        }

        // Act & Assert - Deletar todos os boxes sequencialmente
        int boxesDeletadosComSucesso = 0;
        boolean ultimoBoxFalhou = false;

        for (int i = 0; i < boxIdsParaLimpar.size(); i++) {
            Long boxId = boxIdsParaLimpar.get(i);
            
            try {
                boxService.deletarBox(boxId);
                boxesDeletadosComSucesso++;
                System.out.println("✅ Box " + (i + 1) + " deletado com sucesso");
            } catch (OperationNotAllowedException e) {
                ultimoBoxFalhou = true;
                System.out.println("❌ Falhou ao deletar box " + (i + 1) + ": " + e.getMessage());
                break; // Para após a primeira falha (deve ser o último box)
            }
        }

        // Verificar que conseguiu deletar 9 boxes e falhou no 10º (último)
        assertEquals(9, boxesDeletadosComSucesso, "Deveria ter deletado 9 boxes");
        assertTrue(ultimoBoxFalhou, "Deveria ter falhado ao deletar o último box");

        // Verificar que resta 1 box
        long totalBoxes = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
        assertEquals(1L, totalBoxes, "Deveria restar exatamente 1 box");
    }

    @Test
    @DisplayName("Deve validar contagem correta de boxes durante exclusão em lote")
    void deveValidarContagemDuranteExclusaoEmLote() {
        // Arrange - Criar 5 boxes
        for (int i = 1; i <= 5; i++) {
            BoxRequestDto dto = new BoxRequestDto();
            dto.setNome("TesteContagem" + i);
            dto.setStatus("L");
            dto.setDataEntrada(LocalDateTime.now());
            dto.setDataSaida(LocalDateTime.now());
            dto.setObservacao("Box de teste");
            dto.setPatioId(patioTeste.getIdPatio());
            dto.setPatioStatus("A");

            Box box = boxService.criarBox(dto);
            boxIdsParaLimpar.add(box.getIdBox());
        }

        // Act & Assert - Verificar contagem após cada exclusão
        for (int i = 0; i < 4; i++) { // Deletar 4, deixar 1
            long contagemAntes = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
            
            boxService.deletarBox(boxIdsParaLimpar.get(i));
            
            long contagemDepois = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
            
            assertEquals(contagemAntes - 1, contagemDepois, 
                "A contagem deveria diminuir em 1 após cada exclusão");
            
            System.out.println("📊 Contagem: " + contagemAntes + " → " + contagemDepois);
        }

        // Verificar contagem final
        long contagemFinal = boxRepository.countByPatioIdPatio(patioTeste.getIdPatio());
        assertEquals(1L, contagemFinal, "Deveria restar exatamente 1 box");
    }
}

