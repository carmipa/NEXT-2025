package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.zona.ZonaRequestDto;
import br.com.fiap.mottu.filter.ZonaFilter;
import br.com.fiap.mottu.mapper.ZonaMapper;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.model.Zona;
import br.com.fiap.mottu.model.relacionamento.VeiculoZona;
import br.com.fiap.mottu.model.relacionamento.VeiculoZonaId;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.ZonaRepository;
import br.com.fiap.mottu.repository.relacionamento.VeiculoZonaRepository;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.specification.ZonaSpecification;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ZonaService {

    private final ZonaRepository zonaRepository;
    private final ZonaMapper zonaMapper;
    private final PatioRepository patioRepository;
    private final VeiculoRepository veiculoRepository;
    private final VeiculoZonaRepository veiculoZonaRepository;

    public ZonaService(ZonaRepository zonaRepository, ZonaMapper zonaMapper,
                       PatioRepository patioRepository, VeiculoRepository veiculoRepository,
                       VeiculoZonaRepository veiculoZonaRepository) {
        this.zonaRepository = zonaRepository;
        this.zonaMapper = zonaMapper;
        this.patioRepository = patioRepository;
        this.veiculoRepository = veiculoRepository;
        this.veiculoZonaRepository = veiculoZonaRepository;
    }

    // LISTAR E BUSCAR
    @Transactional(readOnly = true)
    @Cacheable("zonasList")
    public Page<Zona> listarTodasZonas(Pageable pageable) {
        return zonaRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "zonaPorId", key = "#id")
    public Zona buscarZonaPorId(Long id) {
        return zonaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona", id));
    }

    @Transactional(readOnly = true)
    public Page<Zona> buscarZonasPorFiltro(ZonaFilter filter, Pageable pageable) {
        return zonaRepository.findAll(ZonaSpecification.withFilters(filter), pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "zonasDoPatio", key = "#patioId")
    public Set<Zona> getZonasByPatioId(Long patioId) {
        Patio patio = patioRepository.findByIdPatio(patioId)
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", patioId));
        return patio.getZonas();
    }

    // CRUD OPERATIONS
    @Transactional
    @CacheEvict(value = {"zonasList", "zonaPorId", "zonasDoPatio"}, allEntries = true)
    public Zona criarZona(ZonaRequestDto dto) {
        String nome = dto.getNome();
        Long patioId = dto.getPatioId();
        
        if (patioId == null) {
            throw new IllegalArgumentException("ID do Pátio é obrigatório");
        }

        // Verifica se o pátio existe
        Patio patio = patioRepository.findByIdPatio(patioId)
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", patioId));

        // Verifica se já existe zona com mesmo nome no mesmo pátio
        if (zonaRepository.existsByNomeIgnoreCaseAndPatioIdPatio(nome, patioId)) {
            throw new DuplicatedResourceException("Zona", "nome", nome);
        }

        // Mapeia a entidade Zona
        Zona zona = zonaMapper.toEntity(dto);
        zona.setPatio(patio);

        log.info("Criando zona: Nome={}, Pátio={}", nome, patio.getNomePatio());
        return zonaRepository.save(zona);
    }

    @Transactional
    @CachePut(value = "zonaPorId", key = "#id")
    @CacheEvict(value = {"zonasList", "zonasDoPatio"}, allEntries = true)
    public Zona atualizarZona(Long id, ZonaRequestDto dto) {
        Zona zonaExistente = buscarZonaPorId(id);

        String novoNome = dto.getNome();
        if (novoNome != null && !novoNome.isBlank() && !novoNome.equalsIgnoreCase(zonaExistente.getNome())) {
            // Verifica se existe outra zona com o mesmo nome no mesmo pátio
            Optional<Zona> zonaExistenteComMesmoNome = zonaRepository.findByPatioIdAndNome(zonaExistente.getPatio().getIdPatio(), novoNome);
            if (zonaExistenteComMesmoNome.isPresent() && !zonaExistenteComMesmoNome.get().getIdZona().equals(id)) {
                throw new DuplicatedResourceException("Zona", "nome", novoNome);
            }
        }

        // Atualiza os dados básicos da zona
        zonaMapper.partialUpdate(dto, zonaExistente);

        // Atualiza pátio se fornecido
        if (dto.getPatioId() != null && !dto.getPatioId().equals(zonaExistente.getPatio().getIdPatio())) {
            Patio novoPatio = patioRepository.findByIdPatio(dto.getPatioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pátio", dto.getPatioId()));
            zonaExistente.setPatio(novoPatio);
        }

        return zonaRepository.save(zonaExistente);
    }

    @Transactional
    @CacheEvict(value = {"zonaPorId", "zonasList", "zonasDoPatio", "veiculosDaZona"}, allEntries = true)
    public void deletarZona(Long id) {
        Zona zona = buscarZonaPorId(id);
        zonaRepository.delete(zona);
    }

    // MÉTODOS DE ASSOCIAÇÃO VeiculoZona
    @Transactional
    @CacheEvict(value = {"zonaPorId", "veiculosDaZona"}, key = "#zonaId", allEntries = true)
    public VeiculoZona associarZonaVeiculo(Long zonaId, Long veiculoId) {
        Zona zona = buscarZonaPorId(zonaId);
        Veiculo veiculo = veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId));
        
        VeiculoZonaId idAssociacao = new VeiculoZonaId(veiculoId, zonaId);
        if (veiculoZonaRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Zona-Veículo", "IDs", idAssociacao.toString());
        }
        
        VeiculoZona associacao = new VeiculoZona(veiculo, zona);
        return veiculoZonaRepository.save(associacao);
    }

    @Transactional
    @CacheEvict(value = {"zonaPorId", "veiculosDaZona"}, key = "#zonaId", allEntries = true)
    public void desassociarZonaVeiculo(Long zonaId, Long veiculoId) {
        Zona zona = buscarZonaPorId(zonaId);
        VeiculoZonaId idAssociacao = new VeiculoZonaId(veiculoId, zonaId);
        if (!veiculoZonaRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Zona-Veículo", "IDs", idAssociacao.toString());
        }
        veiculoZonaRepository.deleteById(idAssociacao);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "veiculosDaZona", key = "#zonaId")
    public Set<Veiculo> getVeiculosByZonaId(Long zonaId) {
        Zona zona = buscarZonaPorId(zonaId);
        return zona.getVeiculoZonas().stream()
                .map(VeiculoZona::getVeiculo)
                .collect(Collectors.toSet());
    }

    // MÉTODOS DE ESTATÍSTICAS
    @Transactional(readOnly = true)
    public Long contarZonasPorPatio(Long patioId) {
        return zonaRepository.countByPatioIdPatio(patioId);
    }

    @Transactional(readOnly = true)
    public Long contarVeiculosPorZona(Long zonaId) {
        return veiculoZonaRepository.countByZonaIdZona(zonaId);
    }
}