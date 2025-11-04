package br.com.fiap.mottu.service;

import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Estacionamento;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste de integração para verificar se a liberação de estacionamentos está funcionando corretamente.
 * Este teste verifica se após liberar um veículo:
 * 1. O estacionamento é marcado como inativo (ESTA_ESTACIONADO = 0)
 * 2. O box é marcado como livre (STATUS = 'L')
 * 3. Não há mais estacionamentos ativos para aquele veículo
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class LiberacaoEstacionamentoTest {

    @Autowired
    private EstacionamentoService estacionamentoService;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private BoxRepository boxRepository;

    @Autowired
    private PatioRepository patioRepository;

    private Veiculo veiculo;
    private Box box;
    private Patio patio;

    @BeforeEach
    void setUp() {
        // Criar ou buscar um pátio de teste
        patio = patioRepository.findAll().stream()
                .filter(p -> p.getStatus().equals("A"))
                .findFirst()
                .orElseGet(() -> {
                    Patio novoPatio = Patio.builder()
                            .nomePatio("Pátio Teste")
                            .status("A")
                            .dataCadastro(LocalDate.now())
                            .build();
                    return patioRepository.save(novoPatio);
                });

        // Criar ou buscar um box livre para teste
        box = boxRepository.findByPatioIdPatioAndStatus(patio.getIdPatio(), "L").stream()
                .findFirst()
                .orElseGet(() -> {
                    Box novoBox = Box.builder()
                            .nome("TESTE001")
                            .status("L")
                            .patio(patio)
                            .dataEntrada(LocalDateTime.now())
                            .build();
                    return boxRepository.save(novoBox);
                });

        // Criar ou buscar um veículo de teste
        String placaTeste = "TEST123";
        veiculo = veiculoRepository.findByPlacaIgnoreCase(placaTeste)
                .orElseGet(() -> {
                    Veiculo novoVeiculo = Veiculo.builder()
                            .placa(placaTeste)
                            .renavam("12345678901") // RENAVAM obrigatório
                            .chassi("9BW12345678901234") // CHASSI obrigatório
                            .modelo("Modelo Teste")
                            .fabricante("Fabricante Teste")
                            .ano(2020) // ANO obrigatório
                            .combustivel("FLEX") // COMBUSTIVEL obrigatório
                            .status("OPERACIONAL")
                            .build();
                    return veiculoRepository.save(novoVeiculo);
                });
    }

    @Test
    @DisplayName("Deve liberar veículo corretamente e marcar estacionamento como inativo")
    void deveLiberarVeiculoCorretamente() {
        // ARRANGE: Estacionar o veículo primeiro
        System.out.println("📝 ARRANGE: Estacionando veículo " + veiculo.getPlaca() + " no box " + box.getNome());
        estacionamentoService.estacionarVeiculo(
                veiculo.getPlaca(),
                box.getIdBox(),
                patio.getIdPatio(),
                "Teste de liberação"
        );

        // Verificar que está estacionado
        List<Estacionamento> estacionamentosAntes = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        assertThat(estacionamentosAntes).hasSize(1);
        assertThat(estacionamentosAntes.get(0).isAtivo()).isTrue();

        Box boxAntes = boxRepository.findById(box.getIdBox()).orElseThrow();
        assertThat(boxAntes.getStatus()).isEqualTo("O");

        System.out.println("✅ Veículo estacionado. Estacionamentos ativos: " + estacionamentosAntes.size());
        System.out.println("📦 Box status antes: " + boxAntes.getStatus());

        // ACT: Liberar o veículo
        System.out.println("🔄 ACT: Liberando veículo " + veiculo.getPlaca());
        estacionamentoService.liberarVeiculo(veiculo.getPlaca(), "Teste de liberação");

        // ASSERT: Verificar que não há mais estacionamentos ativos
        List<Estacionamento> estacionamentosDepois = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        
        System.out.println("🔍 Estacionamentos ativos após liberação: " + estacionamentosDepois.size());
        
        assertThat(estacionamentosDepois)
                .as("Não deve haver estacionamentos ativos após liberação")
                .isEmpty();

        // Verificar que o box foi liberado
        Box boxDepois = boxRepository.findById(box.getIdBox()).orElseThrow();
        System.out.println("📦 Box status depois: " + boxDepois.getStatus());
        
        assertThat(boxDepois.getStatus())
                .as("Box deve estar livre após liberação")
                .isEqualTo("L");

        // Verificar que o estacionamento foi marcado como inativo
        List<Estacionamento> estacionamentosInativos = estacionamentoRepository
                .findByVeiculoIdVeiculoOrderByDataEntradaDesc(veiculo.getIdVeiculo(), 
                        org.springframework.data.domain.PageRequest.of(0, 10))
                .getContent();
        
        assertThat(estacionamentosInativos).isNotEmpty();
        Estacionamento ultimoEstacionamento = estacionamentosInativos.get(0);
        
        System.out.println("📋 Último estacionamento - Esta estacionado: " + ultimoEstacionamento.isAtivo());
        System.out.println("📋 Último estacionamento - Data saída: " + ultimoEstacionamento.getDataSaida());
        
        assertThat(ultimoEstacionamento.isAtivo())
                .as("Último estacionamento deve estar marcado como inativo")
                .isFalse();
        
        assertThat(ultimoEstacionamento.getDataSaida())
                .as("Data de saída deve estar preenchida")
                .isNotNull();

        System.out.println("✅ TESTE PASSOU: Liberação funcionou corretamente!");
    }

    @Test
    @DisplayName("Deve liberar múltiplos estacionamentos duplicados corretamente")
    void deveLiberarMultiplosEstacionamentosDuplicados() {
        // ARRANGE: Criar múltiplos estacionamentos ativos (simulando bug)
        System.out.println("📝 ARRANGE: Criando múltiplos estacionamentos ativos para " + veiculo.getPlaca());
        
        // Criar segundo box
        Box box2 = boxRepository.findByPatioIdPatioAndStatus(patio.getIdPatio(), "L").stream()
                .filter(b -> !b.getIdBox().equals(box.getIdBox()))
                .findFirst()
                .orElseGet(() -> {
                    Box novoBox = Box.builder()
                            .nome("TESTE002")
                            .status("L")
                            .patio(patio)
                            .dataEntrada(LocalDateTime.now())
                            .build();
                    return boxRepository.save(novoBox);
                });

        // Estacionar no primeiro box
        estacionamentoService.estacionarVeiculo(
                veiculo.getPlaca(),
                box.getIdBox(),
                patio.getIdPatio(),
                "Teste múltiplo 1"
        );

        // Estacionar no segundo box (simulando bug - não deveria acontecer mas testamos)
        // Na prática, isso não deve acontecer, mas vamos testar a correção
        try {
            // Criar estacionamento duplicado diretamente (simulando bug)
            Estacionamento estacionamentoDuplicado = Estacionamento.builder()
                    .veiculo(veiculo)
                    .box(box2)
                    .patio(patio)
                    .estaEstacionado(true)
                    .dataEntrada(LocalDateTime.now())
                    .build();
            estacionamentoRepository.save(estacionamentoDuplicado);
            
            System.out.println("⚠️ Criado estacionamento duplicado (simulando bug)");
        } catch (Exception e) {
            System.out.println("ℹ️ Não foi possível criar duplicado (comportamento esperado): " + e.getMessage());
        }

        // Verificar quantos estacionamentos ativos existem
        List<Estacionamento> estacionamentosAntes = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        
        System.out.println("📊 Estacionamentos ativos antes da liberação: " + estacionamentosAntes.size());

        // ACT: Liberar o veículo (deve liberar todos)
        System.out.println("🔄 ACT: Liberando veículo " + veiculo.getPlaca());
        estacionamentoService.liberarVeiculo(veiculo.getPlaca(), "Teste múltiplo");

        // ASSERT: Verificar que todos foram liberados
        List<Estacionamento> estacionamentosDepois = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        
        System.out.println("📊 Estacionamentos ativos após liberação: " + estacionamentosDepois.size());
        
        assertThat(estacionamentosDepois)
                .as("Todos os estacionamentos devem ser liberados")
                .isEmpty();

        System.out.println("✅ TESTE PASSOU: Múltiplos estacionamentos foram liberados corretamente!");
    }
}

