package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.mottu.dto.veiculo.VeiculoLocalizacaoResponseDto;
import br.com.fiap.mottu.filter.VeiculoFilter;
import br.com.fiap.mottu.mapper.VeiculoMapper;
import br.com.fiap.mottu.mapper.RastreamentoMapper;
import br.com.fiap.mottu.mapper.PatioMapper;
import br.com.fiap.mottu.mapper.ZonaMapper;
import br.com.fiap.mottu.mapper.BoxMapper;
import br.com.fiap.mottu.model.*;
import br.com.fiap.mottu.model.relacionamento.VeiculoBox;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatio;
import br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento;
import br.com.fiap.mottu.model.relacionamento.VeiculoZona;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.specification.VeiculoSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;

@Service
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;
    private final VeiculoMapper veiculoMapper;
    private final RastreamentoMapper rastreamentoMapper;
    private final PatioMapper patioMapper;
    private final ZonaMapper zonaMapper;
    private final BoxMapper boxMapper;

    @Autowired
    public VeiculoService(VeiculoRepository veiculoRepository,
                          VeiculoMapper veiculoMapper,
                          RastreamentoMapper rastreamentoMapper,
                          PatioMapper patioMapper,
                          ZonaMapper zonaMapper,
                          BoxMapper boxMapper) {
        this.veiculoRepository = veiculoRepository;
        this.veiculoMapper = veiculoMapper;
        this.rastreamentoMapper = rastreamentoMapper;
        this.patioMapper = patioMapper;
        this.zonaMapper = zonaMapper;
        this.boxMapper = boxMapper;
    }

    @Transactional(readOnly = true)
    @Cacheable("veiculosList")
    public Page<Veiculo> listarTodosVeiculos(Pageable pageable) {
        return veiculoRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "veiculoPorId", key = "#id")
    public Veiculo buscarVeiculoPorId(Long id) {
        return veiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));
    }

    @Transactional(readOnly = true)
    public Page<Veiculo> buscarVeiculosPorFiltro(VeiculoFilter filter, Pageable pageable) {
        return veiculoRepository.findAll(VeiculoSpecification.withFilters(filter), pageable);
    }

    @Transactional
    @CacheEvict(value = {"veiculosList", "veiculoLocalizacao"}, allEntries = true)
    public Veiculo criarVeiculo(VeiculoRequestDto dto) {
        // Validações de campos únicos
        if (veiculoRepository.findByPlaca(dto.getPlaca()).isPresent()) {
            throw new DuplicatedResourceException("Veículo", "placa", dto.getPlaca());
        }
        if (veiculoRepository.findByRenavam(dto.getRenavam()).isPresent()) {
            throw new DuplicatedResourceException("Veículo", "RENAVAM", dto.getRenavam());
        }
        if (veiculoRepository.findByChassi(dto.getChassi()).isPresent()) {
            throw new DuplicatedResourceException("Veículo", "chassi", dto.getChassi());
        }
        if (dto.getTagBleId() != null && !dto.getTagBleId().isBlank()) {
            if (veiculoRepository.findByTagBleId(dto.getTagBleId()).isPresent()) {
                throw new DuplicatedResourceException("Veículo", "tagBleId", dto.getTagBleId());
            }
        }

        Veiculo veiculo = veiculoMapper.toEntity(dto);
        // A lógica da tag agora é tratada diretamente pelo mapper.
        return veiculoRepository.save(veiculo);
    }

    @Transactional
    @CachePut(value = "veiculoPorId", key = "#id")
    @CacheEvict(value = {"veiculosList", "veiculoLocalizacao"}, allEntries = true)
    public Veiculo atualizarVeiculo(Long id, VeiculoRequestDto dto) {
        Veiculo existente = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));

        // Validações de campos únicos
        if (dto.getPlaca() != null && !dto.getPlaca().isBlank() && !dto.getPlaca().equals(existente.getPlaca())) {
            veiculoRepository.findByPlaca(dto.getPlaca()).filter(v -> !v.getIdVeiculo().equals(id))
                    .ifPresent(v -> { throw new DuplicatedResourceException("Veículo", "placa", dto.getPlaca()); });
        }
        if (dto.getRenavam() != null && !dto.getRenavam().isBlank() && !dto.getRenavam().equals(existente.getRenavam())) {
            veiculoRepository.findByRenavam(dto.getRenavam()).filter(v -> !v.getIdVeiculo().equals(id))
                    .ifPresent(v -> { throw new DuplicatedResourceException("Veículo", "RENAVAM", dto.getRenavam()); });
        }
        if (dto.getChassi() != null && !dto.getChassi().isBlank() && !dto.getChassi().equals(existente.getChassi())) {
            veiculoRepository.findByChassi(dto.getChassi()).filter(v -> !v.getIdVeiculo().equals(id))
                    .ifPresent(v -> { throw new DuplicatedResourceException("Veículo", "chassi", dto.getChassi()); });
        }
        if (dto.getTagBleId() != null && !dto.getTagBleId().isBlank() && !dto.getTagBleId().equals(existente.getTagBleId())) {
            veiculoRepository.findByTagBleId(dto.getTagBleId()).filter(v -> !v.getIdVeiculo().equals(id))
                    .ifPresent(v -> { throw new DuplicatedResourceException("Veículo", "tagBleId", dto.getTagBleId()); });
        }

        // O mapper cuidará da atualização dos campos, incluindo tagBleId e status
        veiculoMapper.partialUpdate(dto, existente);
        return veiculoRepository.save(existente);
    }

    @Transactional
    @CacheEvict(value = {"veiculoPorId", "veiculosList", "veiculoLocalizacao"}, allEntries = true, key = "#id")
    public void deletarVeiculo(Long id) {
        if (!veiculoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Veículo", id);
        }
        veiculoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "veiculoLocalizacao", key = "#veiculoId")
    public VeiculoLocalizacaoResponseDto getLocalizacaoVeiculo(Long veiculoId) {
        Veiculo veiculo = veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId));

        Rastreamento ultimoRastreamento = veiculo.getVeiculoRastreamentos().stream()
                .map(VeiculoRastreamento::getRastreamento)
                .filter(r -> r != null && r.getDataHoraRegistro() != null)
                .max(Comparator.comparing(Rastreamento::getDataHoraRegistro))
                .orElse(null);

        Patio patioAssociado = veiculo.getVeiculoPatios().stream()
                .map(VeiculoPatio::getPatio)
                .findFirst()
                .orElse(null);

        Zona zonaAssociada = veiculo.getVeiculoZonas().stream()
                .map(VeiculoZona::getZona)
                .findFirst()
                .orElse(null);

        Box boxAssociado = veiculo.getVeiculoBoxes().stream()
                .map(VeiculoBox::getBox)
                .findFirst()
                .orElse(null);

        return new VeiculoLocalizacaoResponseDto(
                veiculo.getIdVeiculo(),
                veiculo.getPlaca(),
                veiculo.getModelo(),
                veiculo.getFabricante(),
                veiculo.getStatus(),
                veiculo.getTagBleId(),
                (ultimoRastreamento != null) ? rastreamentoMapper.toResponseDto(ultimoRastreamento) : null,
                (patioAssociado != null) ? patioMapper.toResponseDto(patioAssociado) : null,
                (zonaAssociada != null) ? zonaMapper.toResponseDto(zonaAssociada) : null,
                (boxAssociado != null) ? boxMapper.toResponseDto(boxAssociado) : null,
                LocalDateTime.now()
        );
    }
}

