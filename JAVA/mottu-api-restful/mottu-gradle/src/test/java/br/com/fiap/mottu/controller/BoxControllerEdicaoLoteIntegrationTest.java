package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Contato;
import br.com.fiap.mottu.model.Endereco;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.ContatoRepository;
import br.com.fiap.mottu.repository.EnderecoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.service.BoxService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Teste de integração para simular exatamente o cenário de edição em lote de boxes
 * Reproduz o bug reportado onde boxes não são deletados corretamente
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Testes de Integração - Edição em Lote de Boxes (Cenário Real)")
class BoxControllerEdicaoLoteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BoxService boxService;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private PatioRepository patioRepository;

    @Autowired
    private ContatoRepository contatoRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    private static Patio patioCuritiba;
    private static Contato contatoTeste;
    private static Endereco enderecoTeste;
    private static List<Long> boxIdsCriados = new ArrayList<>();

    @BeforeAll
    static void setupAll(@Autowired PatioRepository patioRepository, @Autowired BoxService boxService,
                        @Autowired ContatoRepository contatoRepository, @Autowired EnderecoRepository enderecoRepository) {
        // Criar contato de teste
        contatoTeste = new Contato();
        contatoTeste.setEmail("teste@curitiba.com");
        contatoTeste.setDdd(41);
        contatoTeste.setDdi(55);
        contatoTeste.setTelefone1("999999999");
        contatoTeste.setCelular("999999999");
        contatoTeste = contatoRepository.save(contatoTeste);

        // Criar endereço de teste
        enderecoTeste = new Endereco();
        enderecoTeste.setLogradouro("Rua Teste");
        enderecoTeste.setNumero(123);
        enderecoTeste.setBairro("Centro");
        enderecoTeste.setCidade("Curitiba");
        enderecoTeste.setEstado("PR");
        enderecoTeste.setPais("Brasil");
        enderecoTeste.setCep("80000-000");
        enderecoTeste = enderecoRepository.save(enderecoTeste);

        // Criar pátio de teste
        patioCuritiba = new Patio();
        patioCuritiba.setNomePatio("Curitiba - Teste Lote");
        patioCuritiba.setStatus("A");
        patioCuritiba.setContato(contatoTeste);
        patioCuritiba.setEndereco(enderecoTeste);
        patioCuritiba = patioRepository.save(patioCuritiba);

        System.out.println("\n═══════════════════════════════════════════════════════════");
        System.out.println("🏁 SETUP: Criando pátio de teste");
        System.out.println("   Pátio ID: " + patioCuritiba.getIdPatio());
        System.out.println("═══════════════════════════════════════════════════════════\n");

        // Criar 10 boxes iniciais (simulando o cenário real)
        for (int i = 1; i <= 10; i++) {
            BoxRequestDto dto = new BoxRequestDto();
            dto.setNome("curitiba" + String.format("%03d", i));
            dto.setStatus("L");
            dto.setDataEntrada(LocalDateTime.now());
            dto.setDataSaida(LocalDateTime.now());
            dto.setObservacao("");
            dto.setPatioId(patioCuritiba.getIdPatio());
            dto.setPatioStatus("A");

            Box box = boxService.criarBox(dto);
            boxIdsCriados.add(box.getIdBox());
            System.out.println("✅ Box criado: " + box.getNome() + " (ID: " + box.getIdBox() + ")");
        }
    }

    @AfterAll
    static void tearDownAll(@Autowired BoxRepository boxRepository, @Autowired PatioRepository patioRepository,
                           @Autowired ContatoRepository contatoRepository, @Autowired EnderecoRepository enderecoRepository) {
        System.out.println("\n═══════════════════════════════════════════════════════════");
        System.out.println("🧹 CLEANUP: Limpando dados de teste");
        System.out.println("═══════════════════════════════════════════════════════════\n");

        // Limpar todos os boxes
        for (Long boxId : boxIdsCriados) {
            try {
                boxRepository.deleteById(boxId);
                System.out.println("🗑️ Box ID " + boxId + " deletado");
            } catch (Exception e) {
                System.err.println("⚠️ Erro ao deletar box ID " + boxId + ": " + e.getMessage());
            }
        }

        // Limpar pátio
        if (patioCuritiba != null && patioCuritiba.getIdPatio() != null) {
            try {
                patioRepository.deleteById(patioCuritiba.getIdPatio());
                System.out.println("🗑️ Pátio ID " + patioCuritiba.getIdPatio() + " deletado");
            } catch (Exception e) {
                System.err.println("⚠️ Erro ao deletar pátio: " + e.getMessage());
            }
        }

        // Limpar endereço
        if (enderecoTeste != null && enderecoTeste.getIdEndereco() != null) {
            try {
                enderecoRepository.deleteById(enderecoTeste.getIdEndereco());
                System.out.println("🗑️ Endereço ID " + enderecoTeste.getIdEndereco() + " deletado");
            } catch (Exception e) {
                System.err.println("⚠️ Erro ao deletar endereço: " + e.getMessage());
            }
        }

        // Limpar contato
        if (contatoTeste != null && contatoTeste.getIdContato() != null) {
            try {
                contatoRepository.deleteById(contatoTeste.getIdContato());
                System.out.println("🗑️ Contato ID " + contatoTeste.getIdContato() + " deletado");
            } catch (Exception e) {
                System.err.println("⚠️ Erro ao deletar contato: " + e.getMessage());
            }
        }
    }

    @Test
    @Order(1)
    @DisplayName("1️⃣ Verificar estado inicial - 10 boxes devem existir")
    void verificarEstadoInicial() {
        long totalBoxes = boxRepository.countByPatioIdPatio(patioCuritiba.getIdPatio());
        
        System.out.println("\n📊 TESTE 1: Verificação do Estado Inicial");
        System.out.println("   Total de boxes: " + totalBoxes);
        
        assertEquals(10L, totalBoxes, "Deveria ter exatamente 10 boxes no início");
    }

    @Test
    @Order(2)
    @DisplayName("2️⃣ Simular edição em lote - Deletar 9 boxes via API")
    @Transactional
    void simularEdicaoEmLote_Deletar9Boxes() throws Exception {
        System.out.println("\n🔧 TESTE 2: Simulando Edição em Lote - Deletando 9 boxes");
        System.out.println("═══════════════════════════════════════════════════════════");

        // Deletar os primeiros 9 boxes (um por um, como faz o frontend)
        for (int i = 0; i < 9; i++) {
            Long boxId = boxIdsCriados.get(i);
            
            System.out.println("\n🗑️ Deletando box " + (i + 1) + "/9 (ID: " + boxId + ")");
            
            // Verificar contagem antes
            long contagemAntes = boxRepository.countByPatioIdPatio(patioCuritiba.getIdPatio());
            System.out.println("   Boxes antes: " + contagemAntes);
            
            // Fazer a requisição DELETE
            mockMvc.perform(delete("/api/boxes/" + boxId))
                    .andDo(print())
                    .andExpect(status().isNoContent());
            
            // Verificar contagem depois
            long contagemDepois = boxRepository.countByPatioIdPatio(patioCuritiba.getIdPatio());
            System.out.println("   Boxes depois: " + contagemDepois);
            System.out.println("   Diferença: " + (contagemAntes - contagemDepois));
            
            // Validar que o box foi realmente deletado
            assertEquals(contagemAntes - 1, contagemDepois, 
                "A contagem deveria diminuir em 1 após deletar o box " + (i + 1));
        }

        // Verificar estado final
        long totalBoxesRestantes = boxRepository.countByPatioIdPatio(patioCuritiba.getIdPatio());
        
        System.out.println("\n📊 RESULTADO FINAL:");
        System.out.println("   Boxes restantes: " + totalBoxesRestantes);
        System.out.println("═══════════════════════════════════════════════════════════");
        
        assertEquals(1L, totalBoxesRestantes, "Deveria restar exatamente 1 box");
    }

    @Test
    @Order(3)
    @DisplayName("3️⃣ Tentar deletar o último box - Deve falhar")
    @Transactional
    void tentarDeletarUltimoBox_DeveFalhar() throws Exception {
        System.out.println("\n❌ TESTE 3: Tentando deletar o último box");
        System.out.println("═══════════════════════════════════════════════════════════");

        // Garantir que há apenas 1 box
        long totalBoxes = boxRepository.countByPatioIdPatio(patioCuritiba.getIdPatio());
        System.out.println("   Boxes existentes: " + totalBoxes);
        
        if (totalBoxes != 1) {
            fail("Pré-condição falhou: deveria haver exatamente 1 box, mas há " + totalBoxes);
        }

        // Tentar deletar o último box
        Long ultimoBoxId = boxIdsCriados.get(9);
        System.out.println("   Tentando deletar box ID: " + ultimoBoxId);
        
        mockMvc.perform(delete("/api/boxes/" + ultimoBoxId))
                .andDo(print())
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("único box")));

        // Verificar que o box ainda existe
        long totalBoxesDepois = boxRepository.countByPatioIdPatio(patioCuritiba.getIdPatio());
        System.out.println("   Boxes após tentativa: " + totalBoxesDepois);
        System.out.println("═══════════════════════════════════════════════════════════");
        
        assertEquals(1L, totalBoxesDepois, "O último box não deveria ter sido deletado");
    }

    @Test
    @Order(4)
    @DisplayName("4️⃣ Simular substituição completa - Deletar todos e criar novos")
    @Transactional
    void simularSubstituicaoCompleta() throws Exception {
        System.out.println("\n🔄 TESTE 4: Simulando Substituição Completa de Boxes");
        System.out.println("═══════════════════════════════════════════════════════════");

        // Primeiro, criar um pátio temporário para este teste
        Contato contatoTemp = new Contato();
        contatoTemp.setEmail("temp@teste.com");
        contatoTemp.setDdd(11);
        contatoTemp.setDdi(55);
        contatoTemp.setTelefone1("999999999");
        contatoTemp.setCelular("999999999");
        contatoTemp = contatoRepository.save(contatoTemp);

        Endereco enderecoTemp = new Endereco();
        enderecoTemp.setLogradouro("Rua Temporária");
        enderecoTemp.setNumero(1);
        enderecoTemp.setBairro("Teste");
        enderecoTemp.setCidade("São Paulo");
        enderecoTemp.setEstado("SP");
        enderecoTemp.setPais("Brasil");
        enderecoTemp.setCep("01000-000");
        enderecoTemp = enderecoRepository.save(enderecoTemp);

        Patio patioTemp = new Patio();
        patioTemp.setNomePatio("Pátio Temp - Substituição");
        patioTemp.setStatus("A");
        patioTemp.setContato(contatoTemp);
        patioTemp.setEndereco(enderecoTemp);
        patioTemp = patioRepository.save(patioTemp);
        
        System.out.println("✅ Pátio temporário criado: ID " + patioTemp.getIdPatio());

        List<Long> boxesTempIds = new ArrayList<>();

        // Criar 5 boxes iniciais
        for (int i = 1; i <= 5; i++) {
            BoxRequestDto dto = new BoxRequestDto();
            dto.setNome("temp" + i);
            dto.setStatus("L");
            dto.setDataEntrada(LocalDateTime.now());
            dto.setDataSaida(LocalDateTime.now());
            dto.setObservacao("");
            dto.setPatioId(patioTemp.getIdPatio());
            dto.setPatioStatus("A");

            Box box = boxService.criarBox(dto);
            boxesTempIds.add(box.getIdBox());
            System.out.println("✅ Box inicial criado: " + box.getNome() + " (ID: " + box.getIdBox() + ")");
        }

        System.out.println("\n🗑️ Fase 1: Deletando 4 boxes antigos (deixando 1)");
        
        // Deletar 4 boxes (deixar 1)
        for (int i = 0; i < 4; i++) {
            Long boxId = boxesTempIds.get(i);
            mockMvc.perform(delete("/api/boxes/" + boxId))
                    .andExpect(status().isNoContent());
            System.out.println("   ✓ Box " + (i + 1) + " deletado");
        }

        long boxesRestantes = boxRepository.countByPatioIdPatio(patioTemp.getIdPatio());
        System.out.println("   Boxes restantes após deleção: " + boxesRestantes);
        assertEquals(1L, boxesRestantes, "Deveria restar 1 box");

        System.out.println("\n➕ Fase 2: Criando 3 novos boxes");
        
        // Criar 3 novos boxes
        for (int i = 1; i <= 3; i++) {
            BoxRequestDto dto = new BoxRequestDto();
            dto.setNome("novo" + i);
            dto.setStatus("L");
            dto.setDataEntrada(LocalDateTime.now());
            dto.setDataSaida(LocalDateTime.now());
            dto.setObservacao("Novo box");
            dto.setPatioId(patioTemp.getIdPatio());
            dto.setPatioStatus("A");

            String jsonContent = objectMapper.writeValueAsString(dto);

            mockMvc.perform(post("/api/boxes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonContent))
                    .andExpect(status().isCreated());
            
            System.out.println("   ✓ Novo box " + i + " criado");
        }

        long boxesFinais = boxRepository.countByPatioIdPatio(patioTemp.getIdPatio());
        System.out.println("\n📊 Total final de boxes: " + boxesFinais);
        System.out.println("═══════════════════════════════════════════════════════════");
        
        assertEquals(4L, boxesFinais, "Deveria ter 4 boxes (1 antigo + 3 novos)");

        // Cleanup
        boxRepository.deleteAll(boxRepository.findByPatioIdPatio(patioTemp.getIdPatio(), null).getContent());
        patioRepository.delete(patioTemp);
        enderecoRepository.delete(enderecoTemp);
        contatoRepository.delete(contatoTemp);
    }

    @Test
    @Order(5)
    @DisplayName("5️⃣ Teste de contagem durante múltiplas operações")
    @Transactional
    void testeContagemDuranteMultiplasOperacoes() {
        System.out.println("\n📊 TESTE 5: Verificando Contagem Durante Operações");
        System.out.println("═══════════════════════════════════════════════════════════");

        // Criar pátio para este teste
        Contato contatoContagem = new Contato();
        contatoContagem.setEmail("contagem@teste.com");
        contatoContagem.setDdd(21);
        contatoContagem.setDdi(55);
        contatoContagem.setTelefone1("999999999");
        contatoContagem.setCelular("999999999");
        contatoContagem = contatoRepository.save(contatoContagem);

        Endereco enderecoContagem = new Endereco();
        enderecoContagem.setLogradouro("Rua Contagem");
        enderecoContagem.setNumero(100);
        enderecoContagem.setBairro("Teste");
        enderecoContagem.setCidade("Rio de Janeiro");
        enderecoContagem.setEstado("RJ");
        enderecoContagem.setPais("Brasil");
        enderecoContagem.setCep("20000-000");
        enderecoContagem = enderecoRepository.save(enderecoContagem);

        Patio patioContagem = new Patio();
        patioContagem.setNomePatio("Pátio Teste Contagem");
        patioContagem.setStatus("A");
        patioContagem.setContato(contatoContagem);
        patioContagem.setEndereco(enderecoContagem);
        patioContagem = patioRepository.save(patioContagem);

        List<Long> boxesIds = new ArrayList<>();

        // Criar 3 boxes
        for (int i = 1; i <= 3; i++) {
            BoxRequestDto dto = new BoxRequestDto();
            dto.setNome("contagem" + i);
            dto.setStatus("L");
            dto.setDataEntrada(LocalDateTime.now());
            dto.setDataSaida(LocalDateTime.now());
            dto.setObservacao("");
            dto.setPatioId(patioContagem.getIdPatio());
            dto.setPatioStatus("A");

            Box box = boxService.criarBox(dto);
            boxesIds.add(box.getIdBox());
            
            long contagem = boxRepository.countByPatioIdPatio(patioContagem.getIdPatio());
            System.out.println("   Após criar box " + i + ": " + contagem + " boxes");
            assertEquals(i, contagem, "Contagem incorreta após criar box " + i);
        }

        // Deletar 2 boxes
        for (int i = 0; i < 2; i++) {
            boxService.deletarBox(boxesIds.get(i));
            
            long contagem = boxRepository.countByPatioIdPatio(patioContagem.getIdPatio());
            System.out.println("   Após deletar box " + (i + 1) + ": " + contagem + " boxes");
            assertEquals(3 - (i + 1), contagem, "Contagem incorreta após deletar box " + (i + 1));
        }

        System.out.println("═══════════════════════════════════════════════════════════");

        // Cleanup
        boxRepository.deleteById(boxesIds.get(2));
        patioRepository.delete(patioContagem);
        enderecoRepository.delete(enderecoContagem);
        contatoRepository.delete(contatoContagem);
    }
}

