// Caminho: src/main/java/br/com/fiap/mottu/service/PatioService.java
package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.dto.box.BoxResponseDto;
import br.com.fiap.mottu.dto.patio.PatioCompletoRequestDto;
import br.com.fiap.mottu.dto.patio.PatioRequestDto;
import br.com.fiap.mottu.dto.zona.ZonaRequestDto;
import br.com.fiap.mottu.dto.zona.ZonaResponseDto;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.filter.PatioFilter;
import br.com.fiap.mottu.mapper.PatioMapper;
import br.com.fiap.mottu.model.*;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatio;
import br.com.fiap.mottu.model.relacionamento.VeiculoPatioId;
import br.com.fiap.mottu.repository.*;
import br.com.fiap.mottu.repository.relacionamento.VeiculoPatioRepository;
import br.com.fiap.mottu.specification.PatioSpecification;
import br.com.fiap.mottu.config.LoggingConfig; // Configuração de logging estruturado
import br.com.fiap.mottu.service.MapGlobalService; // Para invalidar cache do mapa global
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Serviço refatorado para gerenciar Pátios e suas associações.
 * PRINCIPAIS MELHORIAS:
 * 1.  `buscarPatioPorId`: Corrigido para carregar ansiosamente (eagerly) os dados de Contato e Endereço.
 * 2.  `findAndValidatePatio`: Novo método privado para evitar repetição de código nos endpoints hierárquicos.
 * 3.  `criarPatioCompleto`: Lógica do wizard otimizada para ser mais direta e eficiente.
 * 4.  TODOS os métodos hierárquicos foram refatorados para usar o método `findAndValidatePatio`.
 */
@Service
@Slf4j
public class PatioService {

    private final PatioRepository patioRepository;
    private final PatioMapper patioMapper;
    private final VeiculoRepository veiculoRepository;
    private final ZonaRepository zonaRepository;
    private final BoxRepository boxRepository;
    private final ContatoRepository contatoRepository;
    private final EnderecoRepository enderecoRepository;
    private final VeiculoPatioRepository veiculoPatioRepository;
    private final ContatoService contatoService;
    private final EnderecoService enderecoService;
    private final EstacionamentoRepository estacionamentoRepository;
    private final MapGlobalService mapGlobalService;

    public PatioService(PatioRepository patioRepository, PatioMapper patioMapper,
                        VeiculoRepository veiculoRepository, ZonaRepository zonaRepository,
                        ContatoRepository contatoRepository, EnderecoRepository enderecoRepository,
                        VeiculoPatioRepository veiculoPatioRepository,
                        BoxRepository boxRepository,
                        ContatoService contatoService, EnderecoService enderecoService,
                        EstacionamentoRepository estacionamentoRepository,
                        MapGlobalService mapGlobalService) {
        this.patioRepository = patioRepository;
        this.patioMapper = patioMapper;
        this.veiculoRepository = veiculoRepository;
        this.zonaRepository = zonaRepository;
        this.boxRepository = boxRepository;
        this.contatoRepository = contatoRepository;
        this.enderecoRepository = enderecoRepository;
        this.veiculoPatioRepository = veiculoPatioRepository;
        this.contatoService = contatoService;
        this.enderecoService = enderecoService;
        this.estacionamentoRepository = estacionamentoRepository;
        this.mapGlobalService = mapGlobalService;
    }

    // LISTAR E BUSCAR
    @Transactional(readOnly = true)
    @Cacheable("patiosList")
    public Page<Patio> listarTodosPatios(Pageable pageable) {
        log.info("Iniciando listagem de pátios", 
            LoggingConfig.LogContext.create()
                .addOperation("listarTodosPatios")
                .addEntityType("Patio")
                .add("page", pageable.getPageNumber())
                .add("size", pageable.getPageSize())
                .build());
        
        try {
            Page<Patio> result = patioRepository.findAll(pageable);
            log.info("Listagem de pátios concluída com sucesso", 
                LoggingConfig.LogContext.create()
                    .addOperation("listarTodosPatios")
                    .addEntityType("Patio")
                    .addCount((int) result.getTotalElements())
                    .addStatus("SUCCESS")
                    .build());
            return result;
        } catch (Exception e) {
            log.error("Erro ao listar pátios", 
                LoggingConfig.LogContext.create()
                    .addOperation("listarTodosPatios")
                    .addEntityType("Patio")
                    .addError(e.getMessage())
                    .addStatus("ERROR")
                    .build(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "patioPorId", key = "#id")
    public Patio buscarPatioPorId(Long id) {
        // CORREÇÃO CRÍTICA: Usando o método que força o carregamento das associações Contato e Endereço.
        return patioRepository.findByIdWithContatoAndEndereco(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", id));
    }

    @Transactional(readOnly = true)
    public Page<Patio> buscarPatiosPorFiltro(PatioFilter filter, Pageable pageable) {
        return patioRepository.findAll(PatioSpecification.withFilters(filter), pageable);
    }

    // CRUD
    @Transactional
    @CacheEvict(value = {"patiosList", "patioPorId"}, allEntries = true)
    public Patio criarPatio(PatioRequestDto dto) {
        String nome = dto.getNomePatio();
        if (patioRepository.findByNomePatioIgnoreCase(nome).isPresent()) {
            throw new DuplicatedResourceException("Pátio", "nomePátio", nome);
        }

        Patio patio = patioMapper.toEntity(dto);

        if (dto.getContatoId() != null) {
            patio.setContato(contatoService.buscarContatoPorId(dto.getContatoId()));
        } else if (dto.getContato() != null) {
            patio.setContato(contatoService.criarContato(dto.getContato()));
        }

        if (dto.getEnderecoId() != null) {
            patio.setEndereco(enderecoService.buscarEnderecoPorId(dto.getEnderecoId()));
        } else if (dto.getEndereco() != null) {
            patio.setEndereco(enderecoService.criarEndereco(dto.getEndereco()).block());
        }

        Patio patioCriado = patioRepository.save(patio);
        
        // Invalidar cache do mapa global quando um novo pátio é criado
        mapGlobalService.invalidarCache();
        log.info("🗑️ Cache do mapa global invalidado após criação do pátio {}", patioCriado.getIdPatio());
        
        return patioCriado;
    }

    @Transactional
    @CachePut(value = "patioPorId", key = "#id")
    @CacheEvict(value = "patiosList", allEntries = true)
    public Patio atualizarPatio(Long id, PatioRequestDto dto) {
        Patio patioExistente = buscarPatioPorId(id);

        String novoNome = dto.getNomePatio();
        if (novoNome != null && !novoNome.isBlank() && !novoNome.equalsIgnoreCase(patioExistente.getNomePatio())) {
            patioRepository.findByNomePatioIgnoreCase(novoNome)
                    .filter(p -> !p.getIdPatio().equals(id))
                    .ifPresent(p -> { throw new DuplicatedResourceException("Pátio", "nomePátio", novoNome); });
        }

        patioMapper.partialUpdate(dto, patioExistente);

        if (dto.getContatoId() != null) {
            patioExistente.setContato(contatoService.buscarContatoPorId(dto.getContatoId()));
        } else if (dto.getContato() != null) {
            patioExistente.setContato(contatoService.criarContato(dto.getContato()));
        }

        if (dto.getEnderecoId() != null) {
            patioExistente.setEndereco(enderecoService.buscarEnderecoPorId(dto.getEnderecoId()));
        } else if (dto.getEndereco() != null) {
            patioExistente.setEndereco(enderecoService.criarEndereco(dto.getEndereco()).block());
        }

        Patio patioAtualizado = patioRepository.save(patioExistente);
        
        // Invalidar cache do mapa global quando um pátio é atualizado
        mapGlobalService.invalidarCache();
        log.info("🗑️ Cache do mapa global invalidado após atualização do pátio {}", patioAtualizado.getIdPatio());
        
        return patioAtualizado;
    }

    @Transactional
    @CacheEvict(value = {"patioPorId", "patiosList", "veiculosDoPatio", "zonasDoPatio", "contatosDoPatio", "enderecosDoPatio", "boxesDoPatio"}, allEntries = true)
    public void deletarPatio(Long id) {
        Patio patio = buscarPatioPorId(id);
        
        // Validar se há estacionamentos ativos no pátio
        long estacionamentosAtivos = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(id);
        if (estacionamentosAtivos > 0) {
            throw new ResourceInUseException(
                "Pátio", 
                "estacionamento(s) ativo(s)", 
                estacionamentosAtivos
            );
        }
        
        // Validar se há veículos associados ao pátio
        long veiculosAssociados = veiculoPatioRepository.countByPatioIdPatio(id);
        if (veiculosAssociados > 0) {
            throw new ResourceInUseException(
                "Pátio",
                "veículo(s)",
                veiculosAssociados
            );
        }
        
        // Validar se há boxes no pátio
        long totalBoxes = boxRepository.countByPatioIdPatio(id);
        if (totalBoxes > 0) {
            throw new ResourceInUseException(
                "Pátio",
                "box(es)",
                totalBoxes
            );
        }
        
        // Validar se há zonas no pátio
        long totalZonas = zonaRepository.countByPatioIdPatio(id);
        if (totalZonas > 0) {
            throw new ResourceInUseException(
                "Pátio",
                "zona(s)",
                totalZonas
            );
        }
        
        log.info("Deletando pátio ID: {} - Nome: {}", id, patio.getNomePatio());
        patioRepository.deleteById(id);
        log.info("Pátio ID {} deletado com sucesso.", id);
        
        // Invalidar cache do mapa global quando um pátio é deletado
        mapGlobalService.invalidarCache();
        log.info("🗑️ Cache do mapa global invalidado após exclusão do pátio {}", id);
    }

    // --- MÉTODOS DE ASSOCIAÇÃO (Veículo) ---
    @Transactional
    @CacheEvict(value = {"patioPorId", "veiculosDoPatio"}, key = "#patioId", allEntries = true)
    public VeiculoPatio associarPatioVeiculo(Long patioId, Long veiculoId) {
        Patio patio = buscarPatioPorId(patioId);
        Veiculo veiculo = veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId));
        VeiculoPatioId idAssociacao = new VeiculoPatioId(veiculoId, patioId);
        if (veiculoPatioRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Pátio-Veículo", "IDs", idAssociacao.toString());
        }
        VeiculoPatio associacao = new VeiculoPatio(veiculo, patio);
        return veiculoPatioRepository.save(associacao);
    }

    @Transactional
    @CacheEvict(value = {"patioPorId", "veiculosDoPatio"}, key = "#patioId", allEntries = true)
    public void desassociarPatioVeiculo(Long patioId, Long veiculoId) {
        buscarPatioPorId(patioId);
        VeiculoPatioId idAssociacao = new VeiculoPatioId(veiculoId, patioId);
        if (!veiculoPatioRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Pátio-Veículo", "IDs", idAssociacao.toString());
        }
        veiculoPatioRepository.deleteById(idAssociacao);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "veiculosDoPatio", key = "#patioId")
    public Set<Veiculo> getVeiculosByPatioId(Long patioId) {
        return buscarPatioPorId(patioId).getVeiculoPatios().stream()
                .map(VeiculoPatio::getVeiculo)
                .collect(Collectors.toSet());
    }

    // --- GETTERS PARA RELACIONAMENTOS DIRETOS ---
    @Transactional(readOnly = true)
    @Cacheable(value = "zonasDoPatio", key = "#patioId")
    public Set<Zona> getZonasByPatioId(Long patioId) {
        return buscarPatioPorId(patioId).getZonas();
    }

    @Transactional(readOnly = true)
    public Contato getContatoByPatioId(Long patioId) {
        return buscarPatioPorId(patioId).getContato();
    }

    @Transactional(readOnly = true)
    public Endereco getEnderecoByPatioId(Long patioId) {
        return buscarPatioPorId(patioId).getEndereco();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "boxesDoPatio", key = "#patioId")
    public Set<Box> getBoxesByPatioId(Long patioId) {
        return buscarPatioPorId(patioId).getBoxes();
    }

    // ======================================================================
    // MÉTODO DO WIZARD: Criar Pátio Completo (Lógica Otimizada)
    // ======================================================================
    @Transactional
    @CacheEvict(value = {"patiosList", "zonasList", "boxesList"}, allEntries = true)
    public Patio criarPatioCompleto(PatioCompletoRequestDto dto) {
        log.info("Iniciando criação de pátio completo via wizard para: {}", dto.patio().nomePatio());

        // Reutiliza contato existente pelo e-mail (normalizado), evitando erro de duplicidade
        String emailNorm = dto.contato().getEmail() == null ? null : dto.contato().getEmail().trim().toLowerCase();
        Contato contato = (emailNorm != null ? contatoRepository.findByEmail(emailNorm) : java.util.Optional.<Contato>empty())
                .orElseGet(() -> contatoService.criarContato(dto.contato()));
        Endereco endereco = enderecoService.criarEndereco(dto.endereco()).block();

        Patio patio = new Patio();
        patio.setNomePatio(dto.patio().nomePatio());
        patio.setObservacao(dto.patio().observacao());
        patio.setStatus(dto.patio().status());
        patio.setContato(contato);
        patio.setEndereco(endereco);
        Patio patioSalvo = patioRepository.save(patio);
        log.info("Pátio, Contato e Endereço salvos. ID do Pátio: {}", patioSalvo.getIdPatio());

        if (dto.zonas() != null && !dto.zonas().isEmpty()) {
            List<Zona> zonasParaSalvar = dto.zonas().stream().map(zonaDto -> {
                Zona zona = new Zona();
                zona.setNome(zonaDto.nome());
                zona.setStatus(zonaDto.status());
                zona.setObservacao(zonaDto.observacao());
                zona.setPatio(patioSalvo);
                return zona;
            }).collect(Collectors.toList());
            zonaRepository.saveAll(zonasParaSalvar);
            log.info("{} zonas foram criadas e associadas ao pátio.", zonasParaSalvar.size());
        }

        if (dto.boxes() != null && !dto.boxes().isEmpty()) {
            List<Box> boxesParaSalvar = dto.boxes().stream().map(boxDto -> {
                Box box = new Box();
                box.setNome(boxDto.nome());
                box.setStatus(boxDto.status());
                box.setObservacao(boxDto.observacao());
                box.setPatio(patioSalvo);
                return box;
            }).collect(Collectors.toList());
            boxRepository.saveAll(boxesParaSalvar);
            log.info("{} boxes foram criados e associados ao pátio.", boxesParaSalvar.size());
        }

        log.info("Criação completa do pátio {} finalizada com sucesso.", patioSalvo.getNomePatio());
        
        // Invalidar cache do mapa global quando um novo pátio completo é criado
        mapGlobalService.invalidarCache();
        log.info("🗑️ Cache do mapa global invalidado após criação completa do pátio {}", patioSalvo.getIdPatio());
        
        return patioSalvo;
    }

    // ==================================================
    // MÉTODOS HIERÁRQUICOS (Refatorados para usar helper)
    // ==================================================

    /**
     * REFATORAÇÃO: Método auxiliar para buscar e validar um pátio pelo ID e status.
     * Evita a repetição de código nos métodos hierárquicos.
     */
    private Patio findAndValidatePatio(Long patioId, String patioStatus) {
        Patio patio = buscarPatioPorId(patioId);
        if (!patio.getStatus().equals(patioStatus)) {
            throw new ResourceNotFoundException("Pátio com ID " + patioId + " não foi encontrado com o status " + patioStatus);
        }
        return patio;
    }

    // --- Métodos para Zonas por Pátio ---
    @Transactional(readOnly = true)
    public Page<ZonaResponseDto> listarZonasPorPatio(Long patioId, String patioStatus, Pageable pageable) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);
        Page<Zona> zonas = zonaRepository.findByPatioIdPatio(patioId, pageable);
        return zonas.map(zona -> new ZonaResponseDto(zona.getIdZona(), zona.getNome(), zona.getStatus(), zona.getObservacao(), patioId, patioStatus, new ZonaResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio())));
    }

    @Transactional
    public ZonaResponseDto criarZonaPorPatio(Long patioId, String patioStatus, ZonaRequestDto dto) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);

        Zona zona = new Zona();
        zona.setNome(dto.getNome());
        zona.setStatus(dto.getStatus());
        zona.setObservacao(dto.getObservacao());
        zona.setPatio(patio);
        Zona zonaSalva = zonaRepository.save(zona);

        return new ZonaResponseDto(zonaSalva.getIdZona(), zonaSalva.getNome(), zonaSalva.getStatus(), zonaSalva.getObservacao(), patioId, patioStatus, new ZonaResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio()));
    }

    @Transactional(readOnly = true)
    public ZonaResponseDto buscarZonaPorPatio(Long patioId, String patioStatus, Long zonaId) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);
        Zona zona = zonaRepository.findById(zonaId)
                .orElseThrow(() -> new ResourceNotFoundException("Zona", zonaId));
        if (!zona.getPatio().getIdPatio().equals(patioId)) {
            throw new ResourceNotFoundException("Zona " + zonaId + " não pertence ao pátio " + patioId);
        }
        return new ZonaResponseDto(zona.getIdZona(), zona.getNome(), zona.getStatus(), zona.getObservacao(), patioId, patioStatus, new ZonaResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio()));
    }

    @Transactional
    public ZonaResponseDto atualizarZonaPorPatio(Long patioId, String patioStatus, Long zonaId, ZonaRequestDto dto) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);
        Zona zona = zonaRepository.findById(zonaId)
                .orElseThrow(() -> new ResourceNotFoundException("Zona", zonaId));
        if (!zona.getPatio().getIdPatio().equals(patioId)) {
            throw new ResourceNotFoundException("Zona " + zonaId + " não pertence ao pátio " + patioId);
        }

        zona.setNome(dto.getNome());
        zona.setStatus(dto.getStatus());
        zona.setObservacao(dto.getObservacao());
        Zona zonaAtualizada = zonaRepository.save(zona);

        return new ZonaResponseDto(zonaAtualizada.getIdZona(), zonaAtualizada.getNome(), zonaAtualizada.getStatus(), zonaAtualizada.getObservacao(), patioId, patioStatus, new ZonaResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio()));
    }

    @Transactional
    public void excluirZonaPorPatio(Long patioId, String patioStatus, Long zonaId) {
        findAndValidatePatio(patioId, patioStatus); // Valida pátio
        Zona zona = zonaRepository.findById(zonaId)
                .orElseThrow(() -> new ResourceNotFoundException("Zona", zonaId));
        if (!zona.getPatio().getIdPatio().equals(patioId)) {
            throw new ResourceNotFoundException("Zona " + zonaId + " não pertence ao pátio " + patioId);
        }
        zonaRepository.delete(zona);
    }

    // --- Métodos para Boxes por Pátio ---
    @Transactional(readOnly = true)
    public Page<BoxResponseDto> listarBoxesPorPatio(Long patioId, String patioStatus, Pageable pageable) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);
        Page<Box> boxes = boxRepository.findByPatioIdPatio(patioId, pageable);
        return boxes.map(box -> new BoxResponseDto(box.getIdBox(), box.getNome(), box.getStatus(), box.getDataEntrada(), box.getDataSaida(), box.getObservacao(), patioId, patioStatus, new BoxResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio())));
    }

    @Transactional
    public BoxResponseDto criarBoxPorPatio(Long patioId, String patioStatus, BoxRequestDto dto) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);

        Box box = new Box();
        box.setNome(dto.getNome());
        box.setStatus(dto.getStatus());
        box.setDataEntrada(dto.getDataEntrada());
        box.setDataSaida(dto.getDataSaida());
        box.setObservacao(dto.getObservacao());
        box.setPatio(patio);
        Box boxSalvo = boxRepository.save(box);

        return new BoxResponseDto(boxSalvo.getIdBox(), boxSalvo.getNome(), boxSalvo.getStatus(), boxSalvo.getDataEntrada(), boxSalvo.getDataSaida(), boxSalvo.getObservacao(), patioId, patioStatus, new BoxResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio()));
    }

    @Transactional(readOnly = true)
    public BoxResponseDto buscarBoxPorPatio(Long patioId, String patioStatus, Long boxId) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);
        Box box = boxRepository.findById(boxId)
                .orElseThrow(() -> new ResourceNotFoundException("Box", boxId));
        if (!box.getPatio().getIdPatio().equals(patioId)) {
            throw new ResourceNotFoundException("Box " + boxId + " não pertence ao pátio " + patioId);
        }
        return new BoxResponseDto(box.getIdBox(), box.getNome(), box.getStatus(), box.getDataEntrada(), box.getDataSaida(), box.getObservacao(), patioId, patioStatus, new BoxResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio()));
    }

    @Transactional
    public BoxResponseDto atualizarBoxPorPatio(Long patioId, String patioStatus, Long boxId, BoxRequestDto dto) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);
        Box box = boxRepository.findById(boxId)
                .orElseThrow(() -> new ResourceNotFoundException("Box", boxId));
        if (!box.getPatio().getIdPatio().equals(patioId)) {
            throw new ResourceNotFoundException("Box " + boxId + " não pertence ao pátio " + patioId);
        }

        box.setNome(dto.getNome());
        box.setStatus(dto.getStatus());
        box.setDataEntrada(dto.getDataEntrada());
        box.setDataSaida(dto.getDataSaida());
        box.setObservacao(dto.getObservacao());
        Box boxAtualizado = boxRepository.save(box);

        return new BoxResponseDto(boxAtualizado.getIdBox(), boxAtualizado.getNome(), boxAtualizado.getStatus(), boxAtualizado.getDataEntrada(), boxAtualizado.getDataSaida(), boxAtualizado.getObservacao(), patioId, patioStatus, new BoxResponseDto.PatioInfo(patio.getIdPatio(), patio.getNomePatio()));
    }

    @Transactional
    public void excluirBoxPorPatio(Long patioId, String patioStatus, Long boxId) {
        findAndValidatePatio(patioId, patioStatus);
        Box box = boxRepository.findById(boxId)
                .orElseThrow(() -> new ResourceNotFoundException("Box", boxId));
        if (!box.getPatio().getIdPatio().equals(patioId)) {
            throw new ResourceNotFoundException("Box " + boxId + " não pertence ao pátio " + patioId);
        }
        boxRepository.delete(box);
    }

    @Transactional
    public void gerarBoxesEmLotePorPatio(Long patioId, String patioStatus, String prefixo, int quantidade) {
        Patio patio = findAndValidatePatio(patioId, patioStatus);
        for (int i = 1; i <= quantidade; i++) {
            Box box = new Box();
            box.setNome(String.format("%s-%03d", prefixo, i));
            box.setStatus("L"); // Livre por padrão
            box.setDataEntrada(java.time.LocalDateTime.now());
            box.setDataSaida(null);
            box.setObservacao("Box gerado automaticamente");
            box.setPatio(patio);
            boxRepository.save(box);
        }
    }
}