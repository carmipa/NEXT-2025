package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.patio.PatioRequestDto; // DTO para entrada de dados de Pátio
import br.com.fiap.mottu.filter.PatioFilter; // Filtros para busca de Pátios
import br.com.fiap.mottu.mapper.PatioMapper; // Mapper para Pátio
import br.com.fiap.mottu.model.Patio; // Entidade Pátio
import br.com.fiap.mottu.model.Veiculo; // Entidade Veículo
import br.com.fiap.mottu.model.Zona; // Entidade Zona
import br.com.fiap.mottu.model.Box; // Entidade Box
import br.com.fiap.mottu.model.Contato; // Entidade Contato
import br.com.fiap.mottu.model.Endereco; // Entidade Endereço
// Entidades de Relacionamento e IDs
import br.com.fiap.mottu.model.relacionamento.*; // Importa todas as entidades de relacionamento
import br.com.fiap.mottu.repository.PatioRepository; // Repositório para Pátio
import br.com.fiap.mottu.repository.VeiculoRepository; // Repositório para Veículo
import br.com.fiap.mottu.repository.ZonaRepository; // Repositório para Zona
import br.com.fiap.mottu.repository.BoxRepository;          // Repositório para Box
import br.com.fiap.mottu.repository.ContatoRepository; // Repositório para Contato
import br.com.fiap.mottu.repository.EnderecoRepository; // Repositório para Endereço
// Repositórios de Relacionamento
import br.com.fiap.mottu.repository.relacionamento.*; // Importa todos os repositórios de relacionamento
import br.com.fiap.mottu.exception.DuplicatedResourceException; // Exceção para recursos duplicados
import br.com.fiap.mottu.exception.ResourceNotFoundException; // Exceção para recursos não encontrados
import br.com.fiap.mottu.specification.PatioSpecification; // Especificações para busca filtrada de Pátios
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict;    // Para invalidar cache
import org.springframework.cache.annotation.CachePut;      // Para atualizar cache
import org.springframework.cache.annotation.Cacheable;     // Para habilitar cache em métodos
import org.springframework.data.domain.Page;          // Para resultados paginados
import org.springframework.data.domain.Pageable;        // Para informações de paginação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações
import java.util.Set; // Para coleções
import java.util.stream.Collectors; // Para operações com streams

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class PatioService {

    private final PatioRepository patioRepository; // Repositório para Pátio
    private final PatioMapper patioMapper; // Mapper para Pátio
    private final VeiculoRepository veiculoRepository; // Repositório para Veículo
    private final ZonaRepository zonaRepository; // Repositório para Zona
    private final BoxRepository boxRepository; // Repositório para Box
    private final ContatoRepository contatoRepository; // Repositório para Contato
    private final EnderecoRepository enderecoRepository; // Repositório para Endereço
    // Repositórios das tabelas de junção
    private final VeiculoPatioRepository veiculoPatioRepository; //
    private final ZonaPatioRepository zonaPatioRepository; //
    private final ContatoPatioRepository contatoPatioRepository; //
    private final EnderecoPatioRepository enderecoPatioRepository; //
    private final PatioBoxRepository patioBoxRepository; //


    @Autowired // Construtor para injeção de dependências
    public PatioService(PatioRepository patioRepository, PatioMapper patioMapper,
                        VeiculoRepository veiculoRepository, ZonaRepository zonaRepository,
                        ContatoRepository contatoRepository, EnderecoRepository enderecoRepository,
                        VeiculoPatioRepository veiculoPatioRepository, ZonaPatioRepository zonaPatioRepository,
                        ContatoPatioRepository contatoPatioRepository, EnderecoPatioRepository enderecoPatioRepository,
                        BoxRepository boxRepository, PatioBoxRepository patioBoxRepository) { //
        this.patioRepository = patioRepository;
        this.patioMapper = patioMapper; //
        this.veiculoRepository = veiculoRepository;
        this.zonaRepository = zonaRepository;
        this.boxRepository = boxRepository; //
        this.contatoRepository = contatoRepository;
        this.enderecoRepository = enderecoRepository;
        this.veiculoPatioRepository = veiculoPatioRepository;
        this.zonaPatioRepository = zonaPatioRepository; //
        this.contatoPatioRepository = contatoPatioRepository;
        this.enderecoPatioRepository = enderecoPatioRepository;
        this.patioBoxRepository = patioBoxRepository; //
    }

    // Método para listar todos os pátios de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("patiosList") // Armazena em cache o resultado desta listagem paginada
    public Page<Patio> listarTodosPatios(Pageable pageable) {
        return patioRepository.findAll(pageable); // Busca todos os pátios usando paginação
    }

    // Método para buscar um pátio por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "patioPorId", key = "#id") // Armazena em cache o pátio buscado pelo ID
    public Patio buscarPatioPorId(Long id) {
        return patioRepository.findById(id) // Busca o pátio pelo ID
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", id)); // Lança exceção se não encontrado
    }

    // Método para buscar pátios por filtro e com paginação
    @Transactional(readOnly = true)
    // @Cacheable(value = "patiosFiltrados", key = "{#filter, #pageable}") // Considere adicionar se aplicável
    public Page<Patio> buscarPatiosPorFiltro(PatioFilter filter, Pageable pageable) {
        return patioRepository.findAll(PatioSpecification.withFilters(filter), pageable); // Busca pátios com filtros e paginação
    }

    // Método para criar um novo pátio
    @Transactional // Transação de escrita
    @CacheEvict(value = {"patiosList", "patioPorId"}, allEntries = true) // Invalida caches relevantes
    public Patio criarPatio(PatioRequestDto dto) { //
        String nome = dto.getNomePatio(); //
        // Verifica se já existe um pátio com o mesmo nome (ignorando maiúsculas/minúsculas)
        if (patioRepository.findByNomePatioIgnoreCase(nome).isPresent()) { //
            throw new DuplicatedResourceException("Pátio", "nomePátio", nome); // Lança exceção se nome duplicado
        }
        Patio patio = patioMapper.toEntity(dto); // Mapeia DTO para entidade
        return patioRepository.save(patio); // Salva o novo pátio
    }

    // Método para atualizar um pátio existente
    @Transactional
    @CachePut(value = "patioPorId", key = "#id") // Atualiza o cache 'patioPorId' com o pátio modificado
    @CacheEvict(value = "patiosList", allEntries = true) // Invalida o cache de listagem
    public Patio atualizarPatio(Long id, PatioRequestDto dto) { //
        return patioRepository.findById(id) // Busca o pátio existente
                .map(existente -> { // Se encontrado, atualiza
                    String novoNome = dto.getNomePatio(); //
                    // Verifica se o novo nome (se fornecido e diferente do atual) já existe em outro pátio
                    if (novoNome != null && !novoNome.isBlank() && !novoNome.equalsIgnoreCase(existente.getNomePatio())) { //
                        if (patioRepository.findByNomePatioIgnoreCase(novoNome) //
                                .filter(p -> !p.getIdPatio().equals(id)) // Exclui o próprio pátio da checagem
                                .isPresent()) {
                            throw new DuplicatedResourceException("Pátio", "nomePátio", novoNome); // Lança exceção se duplicado
                        }
                    }
                    patioMapper.partialUpdate(dto, existente); // Atualiza a entidade com dados do DTO
                    return patioRepository.save(existente); // Salva as alterações
                })
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", id)); // Lança exceção se não encontrado para atualização
    }

    // Método para deletar um pátio
    @Transactional
    @CacheEvict(value = {"patioPorId", "patiosList", "veiculosDoPatio", "zonasDoPatio", "contatosDoPatio", "enderecosDoPatio", "boxesDoPatio"}, allEntries = true, key = "#id")
    public void deletarPatio(Long id) {
        if (!patioRepository.existsById(id)) { // Verifica se o pátio existe
            throw new ResourceNotFoundException("Pátio", id); // Lança exceção se não encontrado
        }
        // A exclusão em cascata das associações (VeiculoPatio, ZonaPatio, etc.) é geralmente tratada pelo JPA
        // se 'orphanRemoval = true' e 'cascade = CascadeType.ALL' estiverem nas coleções da entidade Patio.
        patioRepository.deleteById(id); // Deleta o pátio
    }

    // --- Métodos de Associação ---
    // A invalidação de cache aqui é importante para dados derivados, como listas de veículos/zonas/etc. por pátio.

    // --- VeiculoPatio ---
    @Transactional
    @CacheEvict(value = {"patioPorId", "veiculosDoPatio"}, key = "#patioId", allEntries = true) // Invalida cache do pátio e da lista de veículos dele
    public VeiculoPatio associarPatioVeiculo(Long patioId, Long veiculoId) {
        Patio patio = buscarPatioPorId(patioId); // Reutiliza o método que já lança exceção e usa cache
        Veiculo veiculo = veiculoRepository.findById(veiculoId) //
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId)); //
        VeiculoPatioId idAssociacao = new VeiculoPatioId(veiculoId, patioId); //
        if (veiculoPatioRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Pátio-Veículo", "IDs", idAssociacao.toString()); //
        }
        VeiculoPatio associacao = new VeiculoPatio(veiculo, patio); //
        return veiculoPatioRepository.save(associacao); //
    }

    @Transactional
    @CacheEvict(value = {"patioPorId", "veiculosDoPatio"}, key = "#patioId", allEntries = true)
    public void desassociarPatioVeiculo(Long patioId, Long veiculoId) {
        VeiculoPatioId idAssociacao = new VeiculoPatioId(veiculoId, patioId); //
        if (!veiculoPatioRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Pátio-Veículo", "IDs", idAssociacao.toString()); //
        }
        veiculoPatioRepository.deleteById(idAssociacao); //
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "veiculosDoPatio", key = "#patioId") // Cacheia a lista de veículos de um pátio
    public Set<Veiculo> getVeiculosByPatioId(Long patioId) {
        Patio patio = buscarPatioPorId(patioId); //
        return patio.getVeiculoPatios().stream() //
                .map(VeiculoPatio::getVeiculo) //
                .collect(Collectors.toSet()); //
    }

    // --- ZonaPatio ---
    @Transactional
    @CacheEvict(value = {"patioPorId", "zonasDoPatio"}, key = "#patioId", allEntries = true)
    public ZonaPatio associarPatioZona(Long patioId, Long zonaId) {
        Patio patio = buscarPatioPorId(patioId);
        Zona zona = zonaRepository.findById(zonaId) //
                .orElseThrow(() -> new ResourceNotFoundException("Zona", zonaId)); //
        ZonaPatioId idAssociacao = new ZonaPatioId(patioId, zonaId); //
        if (zonaPatioRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Pátio-Zona", "IDs", idAssociacao.toString()); //
        }
        ZonaPatio associacao = new ZonaPatio(patio, zona); //
        return zonaPatioRepository.save(associacao); //
    }

    @Transactional
    @CacheEvict(value = {"patioPorId", "zonasDoPatio"}, key = "#patioId", allEntries = true)
    public void desassociarPatioZona(Long patioId, Long zonaId) {
        ZonaPatioId idAssociacao = new ZonaPatioId(patioId, zonaId); //
        if (!zonaPatioRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Pátio-Zona", "IDs", idAssociacao.toString()); //
        }
        zonaPatioRepository.deleteById(idAssociacao); //
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "zonasDoPatio", key = "#patioId")
    public Set<Zona> getZonasByPatioId(Long patioId) {
        Patio patio = buscarPatioPorId(patioId); //
        return patio.getZonaPatios().stream() //
                .map(ZonaPatio::getZona) //
                .collect(Collectors.toSet()); //
    }

    // --- ContatoPatio ---
    @Transactional
    @CacheEvict(value = {"patioPorId", "contatosDoPatio"}, key = "#patioId", allEntries = true)
    public ContatoPatio associarPatioContato(Long patioId, Long contatoId) {
        Patio patio = buscarPatioPorId(patioId);
        Contato contato = contatoRepository.findById(contatoId) //
                .orElseThrow(() -> new ResourceNotFoundException("Contato", contatoId)); //
        ContatoPatioId idAssociacao = new ContatoPatioId(patioId, contatoId); //
        if (contatoPatioRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Pátio-Contato", "IDs", idAssociacao.toString()); //
        }
        ContatoPatio associacao = new ContatoPatio(patio, contato); //
        return contatoPatioRepository.save(associacao); //
    }

    @Transactional
    @CacheEvict(value = {"patioPorId", "contatosDoPatio"}, key = "#patioId", allEntries = true)
    public void desassociarPatioContato(Long patioId, Long contatoId) {
        ContatoPatioId idAssociacao = new ContatoPatioId(patioId, contatoId); //
        if (!contatoPatioRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Pátio-Contato", "IDs", idAssociacao.toString()); //
        }
        contatoPatioRepository.deleteById(idAssociacao); //
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "contatosDoPatio", key = "#patioId")
    public Set<Contato> getContatosByPatioId(Long patioId) {
        Patio patio = buscarPatioPorId(patioId); //
        return patio.getContatoPatios().stream() //
                .map(ContatoPatio::getContato) //
                .collect(Collectors.toSet()); //
    }

    // --- EnderecoPatio ---
    @Transactional
    @CacheEvict(value = {"patioPorId", "enderecosDoPatio"}, key = "#patioId", allEntries = true)
    public EnderecoPatio associarPatioEndereco(Long patioId, Long enderecoId) {
        Patio patio = buscarPatioPorId(patioId);
        Endereco endereco = enderecoRepository.findById(enderecoId) //
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", enderecoId)); //
        EnderecoPatioId idAssociacao = new EnderecoPatioId(enderecoId, patioId); //
        if (enderecoPatioRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Pátio-Endereço", "IDs", idAssociacao.toString()); //
        }
        EnderecoPatio associacao = new EnderecoPatio(endereco, patio); //
        return enderecoPatioRepository.save(associacao); //
    }

    @Transactional
    @CacheEvict(value = {"patioPorId", "enderecosDoPatio"}, key = "#patioId", allEntries = true)
    public void desassociarPatioEndereco(Long patioId, Long enderecoId) {
        EnderecoPatioId idAssociacao = new EnderecoPatioId(enderecoId, patioId); //
        if (!enderecoPatioRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Pátio-Endereço", "IDs", idAssociacao.toString()); //
        }
        enderecoPatioRepository.deleteById(idAssociacao); //
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "enderecosDoPatio", key = "#patioId")
    public Set<Endereco> getEnderecosByPatioId(Long patioId) {
        Patio patio = buscarPatioPorId(patioId); //
        return patio.getEnderecoPatios().stream() //
                .map(EnderecoPatio::getEndereco) //
                .collect(Collectors.toSet()); //
    }

    // --- PatioBox ---
    @Transactional
    @CacheEvict(value = {"patioPorId", "boxesDoPatio"}, key = "#patioId", allEntries = true)
    public PatioBox associarPatioBox(Long patioId, Long boxId) {
        Patio patio = buscarPatioPorId(patioId);
        Box box = boxRepository.findById(boxId) //
                .orElseThrow(() -> new ResourceNotFoundException("Box", boxId)); //
        PatioBoxId idAssociacao = new PatioBoxId(patioId, boxId); //
        if (patioBoxRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Pátio-Box", "IDs", idAssociacao.toString()); //
        }
        PatioBox associacao = new PatioBox(patio, box); //
        return patioBoxRepository.save(associacao); //
    }

    @Transactional
    @CacheEvict(value = {"patioPorId", "boxesDoPatio"}, key = "#patioId", allEntries = true)
    public void desassociarPatioBox(Long patioId, Long boxId) {
        PatioBoxId idAssociacao = new PatioBoxId(patioId, boxId); //
        if (!patioBoxRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Pátio-Box", "IDs", idAssociacao.toString()); //
        }
        patioBoxRepository.deleteById(idAssociacao); //
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "boxesDoPatio", key = "#patioId")
    public Set<Box> getBoxesByPatioId(Long patioId) {
        Patio patio = buscarPatioPorId(patioId); //
        return patio.getPatioBoxes().stream() //
                .map(PatioBox::getBox) //
                .collect(Collectors.toSet()); //
    }
}