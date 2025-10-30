package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.rastreamento.RastreamentoRequestDto;
import br.com.fiap.mottu.filter.RastreamentoFilter;
import br.com.fiap.mottu.mapper.RastreamentoMapper;
import br.com.fiap.mottu.model.Rastreamento;
import br.com.fiap.mottu.repository.RastreamentoRepository;
import br.com.fiap.mottu.exception.*;
import br.com.fiap.mottu.specification.RastreamentoSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RastreamentoService {

    private final RastreamentoRepository rastreamentoRepository;
    private final RastreamentoMapper rastreamentoMapper;

    @Autowired
    public RastreamentoService(RastreamentoRepository rastreamentoRepository,
                               RastreamentoMapper rastreamentoMapper) {
        this.rastreamentoRepository = rastreamentoRepository;
        this.rastreamentoMapper = rastreamentoMapper;
    }

    @Transactional(readOnly = true)
    @Cacheable("rastreamentosList")
    public Page<Rastreamento> listarTodosRastreamentos(Pageable pageable) {
        return rastreamentoRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "rastreamentoPorId", key = "#id")
    public Rastreamento buscarRastreamentoPorId(Long id) {
        return rastreamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rastreamento", id));
    }

    @Transactional(readOnly = true)
    public Page<Rastreamento> buscarRastreamentosPorFiltro(RastreamentoFilter filter, Pageable pageable) {
        return rastreamentoRepository.findAll(RastreamentoSpecification.withFilters(filter), pageable);
    }

    @Transactional
    @CacheEvict(value = {"rastreamentosList", "rastreamentoPorId"}, allEntries = true)
    public Rastreamento criarRastreamento(RastreamentoRequestDto dto) {
        if (dto.getIpsX() == null || dto.getIpsY() == null || dto.getIpsZ() == null ||
                dto.getGprsLatitude() == null || dto.getGprsLongitude() == null || dto.getGprsAltitude() == null) {
            throw new InvalidInputException("Todas as coordenadas (IPS_X, IPS_Y, IPS_Z, GPRS_LATITUDE, GPRS_LONGITUDE, GPRS_ALTITUDE) são obrigatórias.");
        }
        Rastreamento rastreamento = rastreamentoMapper.toEntity(dto);
        return rastreamentoRepository.save(rastreamento);
    }

    @Transactional
    @CachePut(value = "rastreamentoPorId", key = "#id")
    @CacheEvict(value = "rastreamentosList", allEntries = true)
    public Rastreamento atualizarRastreamento(Long id, RastreamentoRequestDto dto) {
        return rastreamentoRepository.findById(id)
                .map(existente -> {
                    if (dto.getIpsX() == null || dto.getIpsY() == null || dto.getIpsZ() == null ||
                            dto.getGprsLatitude() == null || dto.getGprsLongitude() == null || dto.getGprsAltitude() == null) {
                        throw new InvalidInputException("Na atualização, todas as coordenadas devem ser fornecidas se a intenção for alterá-las.");
                    }
                    rastreamentoMapper.partialUpdate(dto, existente);
                    return rastreamentoRepository.save(existente);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Rastreamento", id));
    }

    @Transactional
    @CacheEvict(value = {"rastreamentoPorId", "rastreamentosList"}, allEntries = true, key = "#id")
    public void deletarRastreamento(Long id) {
        if (!rastreamentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Rastreamento", id);
        }
        rastreamentoRepository.deleteById(id);
    }
}
