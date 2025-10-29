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
import br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento;
import br.com.fiap.mottu.model.relacionamento.VeiculoZona;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.specification.VeiculoSpecification;
import br.com.fiap.mottu.config.LoggingConfig; // Configuração de logging estruturado
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;
    private final VeiculoMapper veiculoMapper;
    private final RastreamentoMapper rastreamentoMapper;
    private final PatioMapper patioMapper;
    private final ZonaMapper zonaMapper;
    private final BoxMapper boxMapper;
    private final BoxRepository boxRepository;

    public VeiculoService(VeiculoRepository veiculoRepository,
                          VeiculoMapper veiculoMapper,
                          RastreamentoMapper rastreamentoMapper,
                          PatioMapper patioMapper,
                          ZonaMapper zonaMapper,
                          BoxMapper boxMapper,
                          BoxRepository boxRepository) {
        this.veiculoRepository = veiculoRepository;
        this.veiculoMapper = veiculoMapper;
        this.rastreamentoMapper = rastreamentoMapper;
        this.patioMapper = patioMapper;
        this.zonaMapper = zonaMapper;
        this.boxMapper = boxMapper;
        this.boxRepository = boxRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("veiculosList")
    public Page<Veiculo> listarTodosVeiculos(Pageable pageable) {
        log.info("Iniciando listagem de veículos", 
            LoggingConfig.LogContext.create()
                .addOperation("listarTodosVeiculos")
                .addEntityType("Veiculo")
                .add("page", pageable.getPageNumber())
                .add("size", pageable.getPageSize())
                .build());
        
        try {
            Page<Veiculo> result = veiculoRepository.findAll(pageable);
            log.info("Listagem de veículos concluída com sucesso", 
                LoggingConfig.LogContext.create()
                    .addOperation("listarTodosVeiculos")
                    .addEntityType("Veiculo")
                    .addCount((int) result.getTotalElements())
                    .addStatus("SUCCESS")
                    .build());
            return result;
        } catch (Exception e) {
            log.error("Erro ao listar veículos", 
                LoggingConfig.LogContext.create()
                    .addOperation("listarTodosVeiculos")
                    .addEntityType("Veiculo")
                    .addError(e.getMessage())
                    .addStatus("ERROR")
                    .build(), e);
            throw e;
        }
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
        log.info("Iniciando criação de veículo", 
            LoggingConfig.LogContext.create()
                .addOperation("criarVeiculo")
                .addEntityType("Veiculo")
                .add("placa", dto.getPlaca())
                .add("modelo", dto.getModelo())
                .add("fabricante", dto.getFabricante())
                .build());
        
        try {
            // Validações de campos únicos
            if (veiculoRepository.findByPlaca(dto.getPlaca()).isPresent()) {
                log.warn("Tentativa de criar veículo com placa duplicada", 
                    LoggingConfig.LogContext.create()
                        .addOperation("criarVeiculo")
                        .addEntityType("Veiculo")
                        .add("placa", dto.getPlaca())
                        .addError("Placa já existe")
                        .addStatus("DUPLICATED")
                        .build());
                throw new DuplicatedResourceException("Veículo", "placa", dto.getPlaca());
            }
            if (veiculoRepository.findByRenavam(dto.getRenavam()).isPresent()) {
                log.warn("Tentativa de criar veículo com RENAVAM duplicado", 
                    LoggingConfig.LogContext.create()
                        .addOperation("criarVeiculo")
                        .addEntityType("Veiculo")
                        .add("renavam", dto.getRenavam())
                        .addError("RENAVAM já existe")
                        .addStatus("DUPLICATED")
                        .build());
                throw new DuplicatedResourceException("Veículo", "RENAVAM", dto.getRenavam());
            }
            if (veiculoRepository.findByChassi(dto.getChassi()).isPresent()) {
                log.warn("Tentativa de criar veículo com chassi duplicado", 
                    LoggingConfig.LogContext.create()
                        .addOperation("criarVeiculo")
                        .addEntityType("Veiculo")
                        .add("chassi", dto.getChassi())
                        .addError("Chassi já existe")
                        .addStatus("DUPLICATED")
                        .build());
                throw new DuplicatedResourceException("Veículo", "chassi", dto.getChassi());
            }
            if (dto.getTagBleId() != null && !dto.getTagBleId().isBlank()) {
                if (veiculoRepository.findByTagBleId(dto.getTagBleId()).isPresent()) {
                    log.warn("Tentativa de criar veículo com tag BLE duplicada", 
                        LoggingConfig.LogContext.create()
                            .addOperation("criarVeiculo")
                            .addEntityType("Veiculo")
                            .add("tagBleId", dto.getTagBleId())
                            .addError("Tag BLE já existe")
                            .addStatus("DUPLICATED")
                            .build());
                    throw new DuplicatedResourceException("Veículo", "tagBleId", dto.getTagBleId());
                }
            }

            Veiculo veiculo = veiculoMapper.toEntity(dto);
            
            // Gerar tag BLE automaticamente se não fornecida
            if (veiculo.getTagBleId() == null || veiculo.getTagBleId().trim().isEmpty()) {
                String proximaTag = gerarProximaTagBle();
                veiculo.setTagBleId(proximaTag);
                log.info("Tag BLE gerada automaticamente", 
                    LoggingConfig.LogContext.create()
                        .addOperation("criarVeiculo")
                        .addEntityType("Veiculo")
                        .add("tagBleId", proximaTag)
                        .build());
            }
            
            Veiculo veiculoSalvo = veiculoRepository.save(veiculo);
            
            log.info("Veículo criado com sucesso", 
                LoggingConfig.LogContext.create()
                    .addOperation("criarVeiculo")
                    .addEntityType("Veiculo")
                    .addEntityId(veiculoSalvo.getIdVeiculo())
                    .add("placa", veiculoSalvo.getPlaca())
                    .add("modelo", veiculoSalvo.getModelo())
                    .add("tagBleId", veiculoSalvo.getTagBleId())
                    .addStatus("SUCCESS")
                    .build());
            
            return veiculoSalvo;
        } catch (DuplicatedResourceException e) {
            // Re-throw exceções de duplicação sem log adicional (já foram logadas acima)
            throw e;
        } catch (Exception e) {
            log.error("Erro ao criar veículo", 
                LoggingConfig.LogContext.create()
                    .addOperation("criarVeiculo")
                    .addEntityType("Veiculo")
                    .add("placa", dto.getPlaca())
                    .addError(e.getMessage())
                    .addStatus("ERROR")
                    .build(), e);
            throw e;
        }
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
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));
        
        // Liberar boxes associados antes de deletar o veículo
        veiculo.getVeiculoBoxes().forEach(veiculoBox -> {
            Box box = veiculoBox.getBox();
            box.setStatus("L"); // Liberar o box
            box.setDataSaida(LocalDateTime.now());
            boxRepository.save(box);
            log.info("Box {} liberado automaticamente ao deletar veículo {}", box.getNome(), veiculo.getPlaca());
        });
        
        veiculoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "veiculoLocalizacao", key = "#veiculoId")
    public VeiculoLocalizacaoResponseDto getLocalizacaoVeiculo(Long veiculoId) {
        // CORREÇÃO: Usar consulta com fetch join para carregar todas as associações
        Veiculo veiculo = veiculoRepository.findByIdWithAssociations(veiculoId)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId));

        Rastreamento ultimoRastreamento = veiculo.getVeiculoRastreamentos().stream()
                .map(VeiculoRastreamento::getRastreamento)
                .filter(r -> r != null && r.getDataHoraRegistro() != null)
                .max(Comparator.comparing(Rastreamento::getDataHoraRegistro))
                .orElse(null);

        // CORREÇÃO: Buscar pátio através do box associado (agora carregado via fetch join)
        Box boxAssociado = veiculo.getVeiculoBoxes().stream()
                .map(VeiculoBox::getBox)
                .findFirst()
                .orElse(null);

        Patio patioAssociado = (boxAssociado != null) ? boxAssociado.getPatio() : null;

        Zona zonaAssociada = veiculo.getVeiculoZonas().stream()
                .map(VeiculoZona::getZona)
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

    // NOVO MÉTODO: Retorna uma lista de todos os veículos que têm uma associação na tabela TB_VEICULOBOX
    @Transactional(readOnly = true)
    @Cacheable("veiculosEstacionados")
    public List<VeiculoLocalizacaoResponseDto> listarVeiculosEstacionados() {
        // Buscar todos os veículos que têm associação com boxes
        List<Veiculo> veiculosEstacionados = veiculoRepository.findAll().stream()
                .filter(v -> v.getVeiculoBoxes() != null && !v.getVeiculoBoxes().isEmpty())
                .collect(Collectors.toList());

        // Converter para DTOs de localização
        return veiculosEstacionados.stream()
                .map(this::converterParaLocalizacaoDto)
                .collect(Collectors.toList());
    }

    // Método auxiliar para converter Veiculo para VeiculoLocalizacaoResponseDto
    private VeiculoLocalizacaoResponseDto converterParaLocalizacaoDto(Veiculo veiculo) {
        // Buscar box associado
        Box boxAssociado = veiculo.getVeiculoBoxes().stream()
                .map(VeiculoBox::getBox)
                .findFirst()
                .orElse(null);

        Patio patioAssociado = (boxAssociado != null) ? boxAssociado.getPatio() : null;

        Zona zonaAssociada = veiculo.getVeiculoZonas().stream()
                .map(VeiculoZona::getZona)
                .findFirst()
                .orElse(null);

        return new VeiculoLocalizacaoResponseDto(
                veiculo.getIdVeiculo(),
                veiculo.getPlaca(),
                veiculo.getModelo(),
                veiculo.getFabricante(),
                veiculo.getStatus(),
                veiculo.getTagBleId(),
                null, // ultimoRastreamento - pode ser implementado depois
                (patioAssociado != null) ? patioMapper.toResponseDto(patioAssociado) : null,
                (zonaAssociada != null) ? zonaMapper.toResponseDto(zonaAssociada) : null,
                (boxAssociado != null) ? boxMapper.toResponseDto(boxAssociado) : null,
                LocalDateTime.now()
        );
    }

    /**
     * Gera automaticamente a próxima Tag BLE disponível no formato TAG001, TAG002, etc.
     * @return String com a próxima tag disponível
     */
    @Transactional(readOnly = true)
    public String gerarProximaTagBle() {
        List<String> ultimasTags = veiculoRepository.findLastTagBleIds();
        
        int proximoNumero = 1; // Começa com TAG001
        
        if (!ultimasTags.isEmpty()) {
            // Pega a primeira tag (que é a maior devido ao ORDER BY DESC)
            String ultimaTag = ultimasTags.get(0);
            if (ultimaTag != null && ultimaTag.startsWith("TAG")) {
                try {
                    // Extrai o número da tag (ex: TAG001 -> 001 -> 1)
                    String numeroStr = ultimaTag.substring(3);
                    int ultimoNumero = Integer.parseInt(numeroStr);
                    proximoNumero = ultimoNumero + 1;
                } catch (NumberFormatException e) {
                    // Se não conseguir parsear, mantém o próximo número como 1
                    proximoNumero = 1;
                }
            }
        }
        
        // Formata o número com 3 dígitos (001, 002, 003, etc.)
        return String.format("TAG%03d", proximoNumero);
    }
}

