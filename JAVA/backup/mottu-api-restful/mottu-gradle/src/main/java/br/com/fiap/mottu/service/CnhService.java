package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.cnh.CnhRequestDto;
import br.com.fiap.mottu.dto.cnh.CnhResponseDto;
import br.com.fiap.mottu.filter.CnhFilter;
import br.com.fiap.mottu.mapper.CnhMapper;
import br.com.fiap.mottu.model.Cnh;
import br.com.fiap.mottu.model.Cliente;
import br.com.fiap.mottu.repository.CnhRepository;
import br.com.fiap.mottu.repository.ClienteRepository;
import br.com.fiap.mottu.specification.CnhSpecification;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.InvalidInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Serviço para operações de CNH (Carteira Nacional de Habilitação)
 */
@Service
public class CnhService {

    private final CnhRepository cnhRepository;
    private final ClienteRepository clienteRepository;
    private final CnhMapper cnhMapper;

    @Autowired
    public CnhService(CnhRepository cnhRepository, 
                     ClienteRepository clienteRepository,
                     CnhMapper cnhMapper) {
        this.cnhRepository = cnhRepository;
        this.clienteRepository = clienteRepository;
        this.cnhMapper = cnhMapper;
    }

    /**
     * Cria uma nova CNH
     * @param cnhRequestDto dados da CNH
     * @return CNH criada
     */
    @Transactional
    @CacheEvict(value = "cnhs", allEntries = true)
    public CnhResponseDto criar(CnhRequestDto cnhRequestDto) {
        // Validar se o cliente existe
        Cliente cliente = clienteRepository.findById(cnhRequestDto.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + cnhRequestDto.getClienteId()));

        // Validar se o cliente já possui CNH
        if (cnhRepository.findByClienteIdCliente(cnhRequestDto.getClienteId()).isPresent()) {
            throw new DuplicatedResourceException("Cliente já possui uma CNH cadastrada");
        }

        // Validar se o número de registro já existe
        if (cnhRepository.existsByNumeroRegistro(cnhRequestDto.getNumeroRegistro())) {
            throw new DuplicatedResourceException("Número de registro da CNH já existe: " + cnhRequestDto.getNumeroRegistro());
        }

        // Criar entidade CNH
        Cnh cnh = cnhMapper.toEntity(cnhRequestDto, cliente);
        
        // Salvar no banco
        Cnh cnhSalva = cnhRepository.save(cnh);
        
        return cnhMapper.toResponseDto(cnhSalva);
    }

    /**
     * Busca CNH por ID
     * @param id ID da CNH
     * @return CNH encontrada
     */
    @Cacheable(value = "cnhs", key = "#id")
    public CnhResponseDto buscarPorId(Long id) {
        Cnh cnh = cnhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CNH não encontrada com ID: " + id));
        
        return cnhMapper.toResponseDto(cnh);
    }

    /**
     * Busca CNH por número de registro
     * @param numeroRegistro número de registro
     * @return CNH encontrada
     */
    @Cacheable(value = "cnhs", key = "'numero_' + #numeroRegistro")
    public CnhResponseDto buscarPorNumeroRegistro(String numeroRegistro) {
        Cnh cnh = cnhRepository.findByNumeroRegistro(numeroRegistro)
                .orElseThrow(() -> new ResourceNotFoundException("CNH não encontrada com número de registro: " + numeroRegistro));
        
        return cnhMapper.toResponseDto(cnh);
    }

    /**
     * Busca CNH por cliente
     * @param clienteId ID do cliente
     * @return CNH do cliente
     */
    @Cacheable(value = "cnhs", key = "'cliente_' + #clienteId")
    public CnhResponseDto buscarPorCliente(Long clienteId) {
        Cnh cnh = cnhRepository.findByClienteIdCliente(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("CNH não encontrada para o cliente ID: " + clienteId));
        
        return cnhMapper.toResponseDto(cnh);
    }

    /**
     * Lista todas as CNHs com paginação
     * @param pageable informações de paginação
     * @return página de CNHs
     */
    @Cacheable(value = "cnhs", key = "'page_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<CnhResponseDto> listar(Pageable pageable) {
        Page<Cnh> cnhs = cnhRepository.findAll(pageable);
        return cnhs.map(cnhMapper::toResponseDto);
    }

    /**
     * Busca CNHs com filtros e paginação
     * @param filter filtros de busca
     * @param pageable informações de paginação
     * @return página de CNHs filtradas
     */
    public Page<CnhResponseDto> buscarComFiltros(CnhFilter filter, Pageable pageable) {
        Specification<Cnh> spec = CnhSpecification.withFilters(filter);
        Page<Cnh> cnhs = cnhRepository.findAll(spec, pageable);
        return cnhs.map(cnhMapper::toResponseDto);
    }

    /**
     * Busca CNHs por categoria
     * @param categoria categoria da CNH
     * @param pageable informações de paginação
     * @return página de CNHs da categoria
     */
    public Page<CnhResponseDto> buscarPorCategoria(String categoria, Pageable pageable) {
        Page<Cnh> cnhs = cnhRepository.findByCategoria(categoria, pageable);
        return cnhs.map(cnhMapper::toResponseDto);
    }

    /**
     * Busca CNHs vencidas
     * @param pageable informações de paginação
     * @return página de CNHs vencidas
     */
    public Page<CnhResponseDto> buscarVencidas(Pageable pageable) {
        LocalDate hoje = LocalDate.now();
        Page<Cnh> cnhs = cnhRepository.findCnhsVencidas(hoje, pageable);
        return cnhs.map(cnhMapper::toResponseDto);
    }

    /**
     * Busca CNHs próximas do vencimento (30 dias)
     * @param pageable informações de paginação
     * @return página de CNHs próximas do vencimento
     */
    public Page<CnhResponseDto> buscarProximasVencimento(Pageable pageable) {
        LocalDate hoje = LocalDate.now();
        LocalDate proximoVencimento = hoje.plusDays(30);
        Page<Cnh> cnhs = cnhRepository.findCnhsProximasVencimento(hoje, proximoVencimento, pageable);
        return cnhs.map(cnhMapper::toResponseDto);
    }

    /**
     * Busca CNHs que permitem dirigir motos
     * @param pageable informações de paginação
     * @return página de CNHs que permitem dirigir motos
     */
    public Page<CnhResponseDto> buscarPermitemMotos(Pageable pageable) {
        Page<Cnh> cnhs = cnhRepository.findCnhsPermitemMotos(pageable);
        return cnhs.map(cnhMapper::toResponseDto);
    }

    /**
     * Busca CNHs que permitem dirigir carros
     * @param pageable informações de paginação
     * @return página de CNHs que permitem dirigir carros
     */
    public Page<CnhResponseDto> buscarPermitemCarros(Pageable pageable) {
        Page<Cnh> cnhs = cnhRepository.findCnhsPermitemCarros(pageable);
        return cnhs.map(cnhMapper::toResponseDto);
    }

    /**
     * Atualiza uma CNH existente
     * @param id ID da CNH
     * @param cnhRequestDto novos dados da CNH
     * @return CNH atualizada
     */
    @Transactional
    @CachePut(value = "cnhs", key = "#id")
    public CnhResponseDto atualizar(Long id, CnhRequestDto cnhRequestDto) {
        // Buscar CNH existente
        Cnh cnhExistente = cnhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CNH não encontrada com ID: " + id));

        // Validar se o cliente existe
        Cliente cliente = clienteRepository.findById(cnhRequestDto.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + cnhRequestDto.getClienteId()));

        // Validar se o número de registro já existe em outra CNH
        Optional<Cnh> cnhComMesmoNumero = cnhRepository.findByNumeroRegistro(cnhRequestDto.getNumeroRegistro());
        if (cnhComMesmoNumero.isPresent() && !cnhComMesmoNumero.get().getIdCnh().equals(id)) {
            throw new DuplicatedResourceException("Número de registro da CNH já existe: " + cnhRequestDto.getNumeroRegistro());
        }

        // Atualizar entidade
        Cnh cnhAtualizada = cnhMapper.updateEntity(cnhExistente, cnhRequestDto, cliente);
        
        // Salvar no banco
        Cnh cnhSalva = cnhRepository.save(cnhAtualizada);
        
        return cnhMapper.toResponseDto(cnhSalva);
    }

    /**
     * Exclui uma CNH
     * @param id ID da CNH
     */
    @Transactional
    @CacheEvict(value = "cnhs", allEntries = true)
    public void excluir(Long id) {
        if (!cnhRepository.existsById(id)) {
            throw new ResourceNotFoundException("CNH não encontrada com ID: " + id);
        }
        
        cnhRepository.deleteById(id);
    }

    /**
     * Conta CNHs vencidas
     * @return número de CNHs vencidas
     */
    public long contarVencidas() {
        LocalDate hoje = LocalDate.now();
        return cnhRepository.countCnhsVencidas(hoje);
    }

    /**
     * Conta CNHs próximas do vencimento
     * @return número de CNHs próximas do vencimento
     */
    public long contarProximasVencimento() {
        LocalDate hoje = LocalDate.now();
        LocalDate proximoVencimento = hoje.plusDays(30);
        return cnhRepository.countCnhsProximasVencimento(hoje, proximoVencimento);
    }

    /**
     * Verifica se um cliente possui CNH
     * @param clienteId ID do cliente
     * @return true se possui CNH, false caso contrário
     */
    public boolean clientePossuiCnh(Long clienteId) {
        return cnhRepository.findByClienteIdCliente(clienteId).isPresent();
    }

    /**
     * Verifica se uma CNH está vencida
     * @param id ID da CNH
     * @return true se está vencida, false caso contrário
     */
    public boolean isCnhVencida(Long id) {
        Cnh cnh = cnhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CNH não encontrada com ID: " + id));
        return cnh.isVencida();
    }

    /**
     * Verifica se uma CNH está próxima do vencimento
     * @param id ID da CNH
     * @return true se está próxima do vencimento, false caso contrário
     */
    public boolean isCnhProximaVencimento(Long id) {
        Cnh cnh = cnhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CNH não encontrada com ID: " + id));
        return cnh.isProximaVencimento();
    }
}
