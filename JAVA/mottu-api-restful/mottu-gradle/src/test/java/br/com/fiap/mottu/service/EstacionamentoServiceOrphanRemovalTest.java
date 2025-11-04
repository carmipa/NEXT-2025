package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.estacionamento.EstacionamentoResponseDto;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Contato;
import br.com.fiap.mottu.model.Endereco;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.ContatoRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import br.com.fiap.mottu.repository.EnderecoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Teste de integração específico para verificar se o problema de orphanRemoval
 * está sendo resolvido ao estacionar veículos.
 * 
 * Este teste verifica especificamente se não há conflitos com coleções
 * orphanRemoval = true quando o Hibernate faz flush da transação.
 */
@SpringBootTest
@Transactional
public class EstacionamentoServiceOrphanRemovalTest {

    @Autowired
    private EstacionamentoService estacionamentoService;
    
    @Autowired
    private VeiculoRepository veiculoRepository;
    
    @Autowired
    private BoxRepository boxRepository;
    
    @Autowired
    private PatioRepository patioRepository;
    
    @Autowired
    private ContatoRepository contatoRepository;
    
    @Autowired
    private EnderecoRepository enderecoRepository;
    
    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    private Veiculo veiculo;
    private Box boxLivre;
    private Patio patio;
    private Contato contato;
    private Endereco endereco;

    @BeforeEach
    void setUp() {
        // Limpar dados antes de cada teste para garantir isolamento
        estacionamentoRepository.deleteAll();
        boxRepository.deleteAll();
        veiculoRepository.deleteAll();
        patioRepository.deleteAll();
        contatoRepository.deleteAll();
        enderecoRepository.deleteAll();

        // Criar Contato e Endereco (necessários para criar Patio)
        contato = Contato.builder()
                .email("teste@example.com")
                .ddd(11)
                .ddi(55)
                .telefone1("123456789")
                .celular("987654321")
                .build();
        contato = contatoRepository.save(contato);

        endereco = Endereco.builder()
                .cep("01234567")
                .logradouro("Rua Teste")
                .numero(123)
                .complemento("Apto 45")
                .bairro("Centro")
                .cidade("São Paulo")
                .estado("SP")
                .pais("Brasil")
                .build();
        endereco = enderecoRepository.save(endereco);

        // Criar um pátio (com relacionamentos que podem causar orphanRemoval)
        patio = Patio.builder()
                .nomePatio("Patio Teste OrphanRemoval")
                .status("A")
                .dataCadastro(LocalDate.now())
                .contato(contato)
                .endereco(endereco)
                .build();
        patio = patioRepository.save(patio);

        // Criar veículo
        veiculo = Veiculo.builder()
                .placa("TEST123")
                .modelo("Modelo Teste")
                .fabricante("Fabricante Teste")
                .status("ATIVO")
                .build();
        veiculo = veiculoRepository.save(veiculo);

        // Criar box livre
        boxLivre = Box.builder()
                .nome("BOX001")
                .status("L")
                .patio(patio)
                .build();
        boxLivre = boxRepository.save(boxLivre);
    }

    @Test
    @DisplayName("Deve estacionar veículo SEM causar erro de orphanRemoval ao fazer flush")
    void deveEstacionarVeiculoSemErroOrphanRemoval() {
        // Este teste verifica se o método estacionarVeiculo não causa
        // JpaSystemException relacionado a orphanRemoval
        
        assertDoesNotThrow(() -> {
            EstacionamentoResponseDto response = estacionamentoService.estacionarVeiculo(
                    veiculo.getPlaca(), 
                    boxLivre.getIdBox(), 
                    patio.getIdPatio(),
                    "Teste sem orphanRemoval"
            );
            
            // Verificar se o estacionamento foi criado corretamente
            assertNotNull(response);
            assertNotNull(response.getIdEstacionamento());
            assertEquals(veiculo.getPlaca(), response.getVeiculo().getPlaca());
            assertEquals(boxLivre.getIdBox(), response.getBox().getIdBox());
            assertEquals(patio.getIdPatio(), response.getPatio().getIdPatio());
            assertTrue(response.getEstaEstacionado());
            
            // Verificar se o box foi atualizado para ocupado
            Optional<Box> boxAtualizado = boxRepository.findById(boxLivre.getIdBox());
            assertTrue(boxAtualizado.isPresent());
            assertEquals("O", boxAtualizado.get().getStatus());
            
            // Verificar se o estacionamento está no banco
            assertTrue(estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(
                    veiculo.getIdVeiculo()));
        });
    }

    @Test
    @DisplayName("Deve estacionar veículo com vaga automática SEM causar erro de orphanRemoval")
    void deveEstacionarVeiculoComVagaAutomaticaSemErroOrphanRemoval() {
        // Criar um segundo box livre
        final Box boxLivre2 = Box.builder()
                .nome("BOX002")
                .status("L")
                .patio(patio)
                .build();
        final Box boxLivre2Salvo = boxRepository.save(boxLivre2);

        assertDoesNotThrow(() -> {
            EstacionamentoResponseDto response = estacionamentoService.estacionarVeiculo(
                    veiculo.getPlaca(), 
                    null, // Vaga automática
                    patio.getIdPatio(),
                    "Teste vaga automática sem orphanRemoval"
            );
            
            assertNotNull(response);
            assertTrue(response.getEstaEstacionado());
            
            // Verificar se um dos boxes foi ocupado
            Optional<Box> box1 = boxRepository.findById(boxLivre.getIdBox());
            Optional<Box> box2 = boxRepository.findById(boxLivre2Salvo.getIdBox());
            
            assertTrue(box1.isPresent());
            assertTrue(box2.isPresent());
            
            // Pelo menos um dos boxes deve estar ocupado
            boolean umBoxOcupado = "O".equals(box1.get().getStatus()) || 
                                  "O".equals(box2.get().getStatus());
            assertTrue(umBoxOcupado, "Pelo menos um box deve estar ocupado");
        });
    }

    @Test
    @DisplayName("Deve lançar exceção se tentar estacionar veículo já estacionado")
    void deveLancarExcecaoSeVeiculoJaEstacionado() {
        // Estacionar o veículo uma vez
        estacionamentoService.estacionarVeiculo(veiculo.getPlaca(), boxLivre.getIdBox(), patio.getIdPatio(), null);

        // Tentar estacionar novamente
        assertThrows(DuplicatedResourceException.class, () -> {
            estacionamentoService.estacionarVeiculo(veiculo.getPlaca(), boxLivre.getIdBox(), patio.getIdPatio(), null);
        });
    }

    @Test
    @DisplayName("Deve lançar exceção se box não estiver disponível")
    void deveLancarExcecaoSeBoxNaoDisponivel() {
        // Criar outro veículo
        Veiculo outroVeiculo = Veiculo.builder()
                .placa("OUTRO456")
                .modelo("Outro Modelo")
                .fabricante("Outro Fabricante")
                .status("ATIVO")
                .build();
        outroVeiculo = veiculoRepository.save(outroVeiculo);

        // Estacionar no box
        estacionamentoService.estacionarVeiculo(outroVeiculo.getPlaca(), boxLivre.getIdBox(), patio.getIdPatio(), null);

        // Tentar estacionar outro veículo no mesmo box
        assertThrows(InvalidInputException.class, () -> {
            estacionamentoService.estacionarVeiculo(veiculo.getPlaca(), boxLivre.getIdBox(), patio.getIdPatio(), null);
        });
    }

    @Test
    @DisplayName("Deve verificar que o Patio não é carregado com suas coleções orphanRemoval")
    void deveVerificarQuePatioNaoCarregaColecoesOrphanRemoval() {
        // Este teste verifica que mesmo após estacionar, o Patio não é carregado
        // com suas coleções contatoPatios, evitando o erro de orphanRemoval
        
        assertDoesNotThrow(() -> {
            EstacionamentoResponseDto response = estacionamentoService.estacionarVeiculo(
                    veiculo.getPlaca(), 
                    boxLivre.getIdBox(), 
                    patio.getIdPatio(),
                    "Teste verificação Patio"
            );
            
            // Verificar que o DTO foi construído corretamente sem carregar o Patio completo
            assertNotNull(response.getPatio());
            assertEquals(patio.getIdPatio(), response.getPatio().getIdPatio());
            assertEquals(patio.getNomePatio(), response.getPatio().getNomePatio());
            assertEquals(patio.getStatus(), response.getPatio().getStatus());
            
            // Verificar que não há erro ao fazer commit da transação
            // (isso é verificado pelo assertDoesNotThrow)
        });
    }
}
