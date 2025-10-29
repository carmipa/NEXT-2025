package br.com.fiap.mottu.service;

import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.model.relacionamento.VeiculoBox;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.relacionamento.VeiculoBoxRepository;
import br.com.fiap.mottu.service.ocr.PlateUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstacionamentoService {

    private final VeiculoRepository veiculoRepository;
    private final BoxRepository boxRepository;
    private final VeiculoBoxRepository veiculoBoxRepository;
    private final LogMovimentacaoService logMovimentacaoService;

    public EstacionamentoService(VeiculoRepository veiculoRepository,
                                 BoxRepository boxRepository,
                                 VeiculoBoxRepository veiculoBoxRepository,
                                 LogMovimentacaoService logMovimentacaoService) {
        this.veiculoRepository = veiculoRepository;
        this.boxRepository = boxRepository;
        this.veiculoBoxRepository = veiculoBoxRepository;
        this.logMovimentacaoService = logMovimentacaoService;
    }

    @Transactional
    public Box parkMoto(String placa, Long preferidoBoxId) {
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            throw new InvalidInputException("Placa inválida.");
        }

        // LÓGICA CORRETA: Apenas busca o veículo. Se não encontrar, lança a exceção que o frontend irá tratar.
        Veiculo veiculo = veiculoRepository.findByPlacaIgnoreCase(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo com placa " + normalized + " não cadastrado."));

        if (veiculo.getVeiculoBoxes() != null && !veiculo.getVeiculoBoxes().isEmpty()) {
            throw new InvalidInputException("Veículo de placa " + veiculo.getPlaca() + " já está estacionado.");
        }

        Box vagaParaOcupar;
        if (preferidoBoxId != null) {
            vagaParaOcupar = boxRepository.findById(preferidoBoxId)
                    .orElseThrow(() -> new ResourceNotFoundException("Box com ID " + preferidoBoxId + " não encontrado."));

            // No modelo atual, 'L' representa livre (Livre)
            if (!"L".equalsIgnoreCase(vagaParaOcupar.getStatus())) {
                throw new InvalidInputException("O Box selecionado (" + vagaParaOcupar.getNome() + ") não está livre.");
            }
        } else {
            vagaParaOcupar = boxRepository.findAll().stream()
                    .filter(box -> "L".equalsIgnoreCase(box.getStatus()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Nenhuma vaga livre encontrada."));
        }

        // Ocupado = 'O' no modelo atual
        vagaParaOcupar.setStatus("O");
        boxRepository.save(vagaParaOcupar);

        VeiculoBox associacao = new VeiculoBox(veiculo, vagaParaOcupar);
        veiculoBoxRepository.save(associacao);

        // ✅ CORRIGIDO: Registrar movimento de ENTRADA no LogMovimentacao
        logMovimentacaoService.registrarEntrada(veiculo, vagaParaOcupar);

        return vagaParaOcupar;
    }

    @Transactional
    public void releaseSpot(String placa) {
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            throw new InvalidInputException("Placa inválida.");
        }

        Veiculo veiculo = veiculoRepository.findByPlaca(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo com placa " + placa + " não encontrado."));
        VeiculoBox associacao = veiculo.getVeiculoBoxes().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Veículo com placa " + placa + " não está estacionado em nenhum box."));
        Box boxOcupado = associacao.getBox();
        
        // ✅ CORRIGIDO: Registrar movimento de SAÍDA no LogMovimentacao ANTES de liberar
        logMovimentacaoService.registrarSaida(veiculo, boxOcupado);
        
        // Liberar volta para LIVRE = 'L'
        boxOcupado.setStatus("L");
        boxRepository.save(boxOcupado);

        veiculoBoxRepository.deleteById(associacao.getId());
    }
}