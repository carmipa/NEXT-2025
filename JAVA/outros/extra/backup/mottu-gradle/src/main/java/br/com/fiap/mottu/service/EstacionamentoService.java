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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EstacionamentoService {

    private final VeiculoRepository veiculoRepository;
    private final BoxRepository boxRepository;
    private final VeiculoBoxRepository veiculoBoxRepository;

    @Autowired
    public EstacionamentoService(VeiculoRepository veiculoRepository,
                                 BoxRepository boxRepository,
                                 VeiculoBoxRepository veiculoBoxRepository) {
        this.veiculoRepository = veiculoRepository;
        this.boxRepository = boxRepository;
        this.veiculoBoxRepository = veiculoBoxRepository;
    }

    @Transactional
    public Box parkMoto(String placa) {
        // 1) normaliza a placa recebida (corrige O↔0, I↔1, etc.) e usa UPPERCASE
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            throw new InvalidInputException("Placa inválida.");
        }

        // 2) tenta match exato primeiro
        Optional<Veiculo> opt = veiculoRepository.findByPlaca(normalized);

        // 3) se não achou, faz fuzzy contra todas as placas cadastradas (normalizadas)
        Veiculo veiculo = opt.orElseGet(() -> {
            List<Veiculo> all = veiculoRepository.findAll();
            if (all.isEmpty()) throw new ResourceNotFoundException("Nenhum veículo cadastrado.");
            // Lista normalizada
            List<VeiculoNormalized> norm = all.stream()
                    .map(v -> new VeiculoNormalized(v, PlateUtils.normalizeMercosul(v.getPlaca())))
                    .collect(Collectors.toList());
            String bestPlate = PlateUtils.bestCandidate(
                    norm.stream().map(VeiculoNormalized::normalized).collect(Collectors.toList()),
                    normalized,
                    1 // tolera 1 erro; ajuste p/ 2 se necessário
            );
            if (bestPlate == null) {
                throw new ResourceNotFoundException("Veículo com placa " + placa + " não cadastrado.");
            }
            return norm.stream()
                    .min(Comparator.comparingInt(vn -> PlateUtils.levenshtein(vn.normalized(), normalized)))
                    .filter(vn -> PlateUtils.levenshtein(vn.normalized(), normalized) <= 1)
                    .map(VeiculoNormalized::entity)
                    .orElseThrow(() -> new ResourceNotFoundException("Veículo com placa " + placa + " não cadastrado."));
        });

        // 4) já estacionado?
        if (veiculo.getVeiculoBoxes() != null && !veiculo.getVeiculoBoxes().isEmpty()) {
            throw new InvalidInputException("Veículo de placa " + veiculo.getPlaca() + " já está estacionado.");
        }

        // 5) encontra primeira vaga livre
        Box vagaLivre = boxRepository.findAll().stream()
                .filter(box -> "L".equals(box.getStatus()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nenhuma vaga livre encontrada."));

        vagaLivre.setStatus("O");
        boxRepository.save(vagaLivre);

        VeiculoBox associacao = new VeiculoBox(veiculo, vagaLivre);
        veiculoBoxRepository.save(associacao);

        return vagaLivre;
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
        boxOcupado.setStatus("L");
        boxRepository.save(boxOcupado);

        veiculoBoxRepository.deleteById(associacao.getId());
    }

    /** Par auxiliar para manter a entidade + sua placa normalizada. */
    private record VeiculoNormalized(Veiculo entity, String normalized) {}
}
