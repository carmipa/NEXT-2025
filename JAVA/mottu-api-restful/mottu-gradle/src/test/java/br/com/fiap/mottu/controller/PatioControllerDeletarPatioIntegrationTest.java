package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.model.Contato;
import br.com.fiap.mottu.model.Endereco;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.repository.*;
import br.com.fiap.mottu.repository.relacionamento.VeiculoPatioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração para o endpoint DELETE /api/patios/{id} no PatioController.
 * Testa o comportamento completo do endpoint com banco de dados real.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Rollback
@DisplayName("PatioController - Testes de Integração - Deletar Pátio")
class PatioControllerDeletarPatioIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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

    @Autowired
    private ContatoRepository contatoRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    private Patio patioParaDeletar;
    private Contato contato;
    private Endereco endereco;

    @BeforeEach
    void setUp() {
        // Criar contato e endereco para o pátio
        contato = Contato.builder()
                .telefone1("11999999999")
                .celular("11988888888")
                .email("teste@teste.com")
                .build();
        contato = contatoRepository.save(contato);

        endereco = Endereco.builder()
                .logradouro("Rua Teste")
                .numero(123)
                .cidade("São Paulo")
                .estado("SP")
                .cep("01234567")
                .build();
        endereco = enderecoRepository.save(endereco);

        // Criar um pátio limpo para deletar (sem dependências)
        patioParaDeletar = Patio.builder()
                .nomePatio("Pátio Teste Deletar " + System.currentTimeMillis())
                .status("A")
                .dataCadastro(LocalDate.now())
                .contato(contato)
                .endereco(endereco)
                .build();
        patioParaDeletar = patioRepository.save(patioParaDeletar);
    }

    @Test
    @DisplayName("✅ Deve retornar 204 No Content quando deletar pátio com sucesso")
    void deveRetornar204QuandoDeletarComSucesso() throws Exception {
        // Arrange
        Long patioId = patioParaDeletar.getIdPatio();

        // Act & Assert
        mockMvc.perform(delete("/api/patios/{id}", patioId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        // Verificar que o pátio foi deletado do banco
        assertFalse(patioRepository.findById(patioId).isPresent(),
                "Pátio deve ter sido deletado do banco de dados");
    }

    @Test
    @DisplayName("❌ Deve retornar 404 quando pátio não existe")
    void deveRetornar404QuandoPatioNaoExiste() throws Exception {
        // Arrange
        Long idInexistente = 999999L;

        // Act & Assert
        mockMvc.perform(delete("/api/patios/{id}", idInexistente)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("❌ Deve retornar 409 quando há estacionamentos ativos")
    void deveRetornar409QuandoHaEstacionamentosAtivos() throws Exception {
        // Arrange
        // Buscar um pátio que tenha estacionamentos ativos (se existir)
        Patio patioComEstacionamento = patioRepository.findAll().stream()
                .filter(p -> estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(p.getIdPatio()) > 0)
                .findFirst()
                .orElse(null);

        if (patioComEstacionamento != null) {
            // Act & Assert
            mockMvc.perform(delete("/api/patios/{id}", patioComEstacionamento.getIdPatio())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").exists())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("estacionado")));
        }
    }

    @Test
    @DisplayName("❌ Deve retornar 409 quando há veículos associados")
    void deveRetornar409QuandoHaVeiculosAssociados() throws Exception {
        // Arrange
        // Buscar um pátio que tenha veículos associados (se existir)
        Patio patioComVeiculos = patioRepository.findAll().stream()
                .filter(p -> veiculoPatioRepository.countByPatioIdPatio(p.getIdPatio()) > 0)
                .findFirst()
                .orElse(null);

        if (patioComVeiculos != null) {
            // Act & Assert
            mockMvc.perform(delete("/api/patios/{id}", patioComVeiculos.getIdPatio())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").exists())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("associado")));
        }
    }

    @Test
    @DisplayName("✅ Deve deletar pátio mesmo com boxes e zonas (serão deletados em cascata)")
    void deveDeletarPatioComBoxesEZonas() throws Exception {
        // Arrange
        // Criar um pátio com boxes e zonas mas sem estacionamentos ativos ou veículos associados
        Patio patioComBoxes = Patio.builder()
                .nomePatio("Pátio Com Boxes " + System.currentTimeMillis())
                .status("A")
                .dataCadastro(LocalDate.now())
                .contato(contato)
                .endereco(endereco)
                .build();
        patioComBoxes = patioRepository.save(patioComBoxes);

        // Verificar que o pátio foi criado
        assertTrue(patioRepository.findById(patioComBoxes.getIdPatio()).isPresent());

        // Act
        mockMvc.perform(delete("/api/patios/{id}", patioComBoxes.getIdPatio())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Assert - Verificar que o pátio foi deletado
        assertFalse(patioRepository.findById(patioComBoxes.getIdPatio()).isPresent(),
                "Pátio deve ter sido deletado");

        // Verificar que boxes e zonas foram deletados em cascata
        assertEquals(0, boxRepository.countByPatioIdPatio(patioComBoxes.getIdPatio()),
                "Boxes devem ter sido deletados em cascata");
        assertEquals(0, zonaRepository.countByPatioIdPatio(patioComBoxes.getIdPatio()),
                "Zonas devem ter sido deletadas em cascata");
    }

    @Test
    @DisplayName("✅ Deve aceitar múltiplas deleções sequenciais")
    void deveAceitarMultiplasDelecoesSequenciais() throws Exception {
        // Arrange
        Patio patio1 = Patio.builder()
                .nomePatio("Pátio Sequencial 1 " + System.currentTimeMillis())
                .status("A")
                .dataCadastro(LocalDate.now())
                .contato(contato)
                .endereco(endereco)
                .build();
        patio1 = patioRepository.save(patio1);

        Patio patio2 = Patio.builder()
                .nomePatio("Pátio Sequencial 2 " + System.currentTimeMillis())
                .status("A")
                .dataCadastro(LocalDate.now())
                .contato(contato)
                .endereco(endereco)
                .build();
        patio2 = patioRepository.save(patio2);

        // Act & Assert
        mockMvc.perform(delete("/api/patios/{id}", patio1.getIdPatio())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/patios/{id}", patio2.getIdPatio())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Verificar que ambos foram deletados
        assertFalse(patioRepository.findById(patio1.getIdPatio()).isPresent());
        assertFalse(patioRepository.findById(patio2.getIdPatio()).isPresent());
    }

    @Test
    @DisplayName("✅ Deve retornar response vazio quando deletar com sucesso")
    void deveRetornarResponseVazioQuandoDeletarComSucesso() throws Exception {
        // Arrange
        Long patioId = patioParaDeletar.getIdPatio();

        // Act & Assert
        mockMvc.perform(delete("/api/patios/{id}", patioId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""))
                .andExpect(header().doesNotExist("Content-Type"));
    }

    @Test
    @DisplayName("✅ Deve processar requisição DELETE corretamente")
    void deveProcessarRequisicaoDeleteCorretamente() throws Exception {
        // Arrange
        Long patioId = patioParaDeletar.getIdPatio();
        assertTrue(patioRepository.findById(patioId).isPresent(),
                "Pátio deve existir antes da deleção");

        // Act
        mockMvc.perform(delete("/api/patios/{id}", patioId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Assert
        assertFalse(patioRepository.findById(patioId).isPresent(),
                "Pátio não deve mais existir após a deleção");
    }

    @Test
    @DisplayName("❌ Deve retornar erro apropriado quando ID inválido")
    void deveRetornarErroQuandoIdInvalido() throws Exception {
        // Arrange
        String idInvalido = "abc";

        // Act & Assert
        mockMvc.perform(delete("/api/patios/{id}", idInvalido)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("✅ Deve deletar pátio independente do seu status")
    void deveDeletarPatioIndependenteDoStatus() throws Exception {
        // Arrange
        Patio patioInativo = Patio.builder()
                .nomePatio("Pátio Inativo " + System.currentTimeMillis())
                .status("I") // Inativo
                .dataCadastro(LocalDate.now())
                .contato(contato)
                .endereco(endereco)
                .build();
        patioInativo = patioRepository.save(patioInativo);

        // Act & Assert
        mockMvc.perform(delete("/api/patios/{id}", patioInativo.getIdPatio())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Verificar que foi deletado
        assertFalse(patioRepository.findById(patioInativo.getIdPatio()).isPresent());
    }
}

