package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.OperationNotAllowedException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.relacionamento.VeiculoBoxRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para validar a lógica de deleção de boxes
 * Foca nas regras de negócio e validações
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários - Validação de Deleção de Boxes")
class BoxServiceDeletarValidacaoTest {

    @Mock
    private BoxRepository boxRepository;

    @Mock
    private VeiculoBoxRepository veiculoBoxRepository;

    @InjectMocks
    private BoxService boxService;

    private Patio patio;
    private Box box;

    @BeforeEach
    void setUp() {
        patio = new Patio();
        patio.setIdPatio(1L);
        patio.setNomePatio("Pátio Teste");
        patio.setStatus("A");

        box = new Box();
        box.setIdBox(1L);
        box.setNome("Box001");
        box.setStatus("L");
        box.setDataEntrada(LocalDateTime.now());
        box.setDataSaida(LocalDateTime.now());
        box.setPatio(patio);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar box inexistente")
    void deveLancarExcecao_BoxInexistente() {
        System.out.println("\n🧪 TESTE: Deletar box inexistente");
        
        when(boxRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            boxService.deletarBox(999L);
        });

        assertTrue(exception.getMessage().contains("Box"));
        assertTrue(exception.getMessage().contains("999"));
        
        System.out.println("   ✅ Exceção lançada corretamente: " + exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar box ocupado")
    void deveLancarExcecao_BoxOcupado() {
        System.out.println("\n🧪 TESTE: Deletar box ocupado");
        
        box.setStatus("O"); // Ocupado
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));
        
        // Simular que há mais de 1 box no pátio (para passar a validação do último box)
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(10L);

        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            boxService.deletarBox(1L);
        });

        assertTrue(exception.getMessage().contains("ocupado"));
        
        System.out.println("   ✅ Exceção lançada corretamente: " + exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar box com veículos associados")
    void deveLancarExcecao_BoxComVeiculos() {
        System.out.println("\n🧪 TESTE: Deletar box com veículos");
        
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));
        
        // IMPORTANTE: Verificação do último box vem ANTES da verificação de veículos
        // Simular que há MAIS de 1 box no pátio (para passar a primeira validação)
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(5L);
        
        // Simular que há veículos no box
        when(veiculoBoxRepository.countByBoxIdBox(1L)).thenReturn(2L);

        ResourceInUseException exception = assertThrows(ResourceInUseException.class, () -> {
            boxService.deletarBox(1L);
        });

        assertTrue(exception.getMessage().contains("veículos"));
        
        System.out.println("   ✅ Exceção lançada corretamente: " + exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar o último box do pátio")
    void deveLancarExcecao_UltimoBoxDoPatio() {
        System.out.println("\n🧪 TESTE: Deletar último box do pátio");
        
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));
        
        // Simular que é o único box do pátio
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(1L);

        OperationNotAllowedException exception = assertThrows(OperationNotAllowedException.class, () -> {
            boxService.deletarBox(1L);
        });

        assertTrue(exception.getMessage().contains("único box"));
        assertTrue(exception.getMessage().contains("pátio"));
        
        System.out.println("   ✅ Exceção lançada corretamente: " + exception.getMessage());
        
        // Verificar que o método deleteById NÃO foi chamado
        verify(boxRepository, never()).deleteById(any());
        System.out.println("   ✅ Box NÃO foi deletado (como esperado)");
    }

    @Test
    @DisplayName("Deve deletar box com sucesso quando há outros boxes no pátio")
    void deveDeletarBoxComSucesso() {
        System.out.println("\n🧪 TESTE: Deletar box com sucesso");
        
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));
        when(veiculoBoxRepository.countByBoxIdBox(1L)).thenReturn(0L);
        
        // Simular que há 5 boxes no pátio
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(5L);

        assertDoesNotThrow(() -> {
            boxService.deletarBox(1L);
        });

        // Verificar que o método delete FOI chamado
        verify(boxRepository, times(1)).delete(box);
        System.out.println("   ✅ Box deletado com sucesso");
    }

    @Test
    @DisplayName("Deve validar contagem correta - 2 boxes, pode deletar 1")
    void deveValidarContagem_2Boxes() {
        System.out.println("\n🧪 TESTE: Validar contagem com 2 boxes");
        
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));
        when(veiculoBoxRepository.countByBoxIdBox(1L)).thenReturn(0L);
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(2L);

        assertDoesNotThrow(() -> {
            boxService.deletarBox(1L);
        });

        verify(boxRepository, times(1)).delete(box);
        System.out.println("   ✅ Box deletado (restaria 1 box)");
    }

    @Test
    @DisplayName("Deve validar a ordem das verificações (contagem antes de status)")
    void deveValidarOrdemVerificacoes() {
        System.out.println("\n🧪 TESTE: Ordem das verificações");
        
        // Box ocupado E é o último do pátio
        box.setStatus("O");
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(1L);

        // Deve falhar por ser o último box (verificação ANTERIOR ao status)
        OperationNotAllowedException exception = assertThrows(OperationNotAllowedException.class, () -> {
            boxService.deletarBox(1L);
        });

        assertTrue(exception.getMessage().contains("último box") || exception.getMessage().contains("único box"));
        System.out.println("   ✅ Verificação de contagem executada antes do status");
        
        // Verificar que a contagem foi chamada
        verify(boxRepository, times(1)).countByPatioIdPatio(1L);
        verify(boxRepository, never()).delete((Box) any());
    }

    @Test
    @DisplayName("Deve validar comportamento com 10 boxes no pátio")
    void deveValidar_10Boxes() {
        System.out.println("\n🧪 TESTE: Pátio com 10 boxes");
        
        when(boxRepository.findById(1L)).thenReturn(Optional.of(box));
        when(veiculoBoxRepository.countByBoxIdBox(1L)).thenReturn(0L);
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(10L);

        assertDoesNotThrow(() -> {
            boxService.deletarBox(1L);
        });

        verify(boxRepository, times(1)).delete(box);
        System.out.println("   ✅ Box deletado de pátio com 10 boxes");
    }

    @Test
    @DisplayName("Deve simular deleção sequencial de 9 boxes de um total de 10")
    void deveSimularDelecaoSequencial() {
        System.out.println("\n🧪 TESTE: Deleção sequencial de 9 boxes");
        
        // Simular deleção de 9 boxes
        for (int i = 1; i <= 9; i++) {
            Box boxAtual = new Box();
            boxAtual.setIdBox((long) i);
            boxAtual.setNome("Box" + i);
            boxAtual.setStatus("L");
            boxAtual.setPatio(patio);
            
            when(boxRepository.findById(boxAtual.getIdBox())).thenReturn(Optional.of(boxAtual));
            when(veiculoBoxRepository.countByBoxIdBox(boxAtual.getIdBox())).thenReturn(0L);
            
            // A contagem diminui a cada deleção
            long boxesRestantes = 10 - (i - 1);
            when(boxRepository.countByPatioIdPatio(1L)).thenReturn(boxesRestantes);

            final int boxNum = i;
            System.out.println("   Deletando box " + boxNum + "/9 (restam " + boxesRestantes + " boxes)");
            
            assertDoesNotThrow(() -> {
                boxService.deletarBox(boxAtual.getIdBox());
            });
        }

        // Tentar deletar o 10º box (último) deve falhar
        Box ultimoBox = new Box();
        ultimoBox.setIdBox(10L);
        ultimoBox.setNome("Box10");
        ultimoBox.setStatus("L");
        ultimoBox.setPatio(patio);
        
        when(boxRepository.findById(10L)).thenReturn(Optional.of(ultimoBox));
        // NÃO PRECISA mockar veiculoBoxRepository aqui pois a validação do último box vem ANTES
        when(boxRepository.countByPatioIdPatio(1L)).thenReturn(1L); // Apenas 1 box restante

        System.out.println("   Tentando deletar o 10º box (último)...");
        
        OperationNotAllowedException exception = assertThrows(OperationNotAllowedException.class, () -> {
            boxService.deletarBox(10L);
        });

        assertTrue(exception.getMessage().contains("único box"));
        System.out.println("   ✅ Falhou corretamente ao tentar deletar o último box");
    }
}

