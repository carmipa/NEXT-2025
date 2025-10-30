package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto; // DTO para entrada de dados de Endereço
import br.com.fiap.mottu.external.viacep.ViaCepService; // Serviço para consulta ao ViaCEP
import br.com.fiap.mottu.model.Endereco; // Entidade Endereço
import br.com.fiap.mottu.mapper.EnderecoMapper; // Mapper para Endereço
import br.com.fiap.mottu.repository.EnderecoRepository; // Repositório para Endereço
import br.com.fiap.mottu.exception.ResourceNotFoundException; // Exceção para recursos não encontrados
import br.com.fiap.mottu.exception.InvalidInputException; // Exceção para entrada inválida
import br.com.fiap.mottu.filter.EnderecoFilter; // Filtros para busca de Endereços
import br.com.fiap.mottu.specification.EnderecoSpecification; // Especificações para busca filtrada de Endereços
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict;    // Para invalidar cache
import org.springframework.cache.annotation.CachePut;      // Para atualizar cache
import org.springframework.cache.annotation.Cacheable;     // Para habilitar cache em métodos
import org.springframework.data.domain.Page;          // Para resultados paginados
import org.springframework.data.domain.Pageable;        // Para informações de paginação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações
import reactor.core.publisher.Mono; // Para programação reativa (ViaCEP)
import java.util.List; // Para listagem simples

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class EnderecoService {

    private final EnderecoRepository enderecoRepository; // Repositório para Endereço
    private final EnderecoMapper enderecoMapper; // Mapper para Endereço
    private final ViaCepService viaCepService; // Serviço para consulta ao ViaCEP

    @Autowired // Construtor para injeção de dependências
    public EnderecoService(EnderecoRepository enderecoRepository,
                           EnderecoMapper enderecoMapper,
                           ViaCepService viaCepService) { //
        this.enderecoRepository = enderecoRepository;
        this.enderecoMapper = enderecoMapper; //
        this.viaCepService = viaCepService; //
    }

    // Método para listar todos os endereços sem paginação
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("enderecosListAll") // Armazena em cache o resultado desta listagem
    public List<Endereco> listarTodosEnderecos() {
        return enderecoRepository.findAll(); // Busca todos os endereços sem paginação
    }

    // Método para listar todos os endereços de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("enderecosList") // Armazena em cache o resultado desta listagem paginada
    public Page<Endereco> listarTodosEnderecos(Pageable pageable) {
        return enderecoRepository.findAll(pageable); // Busca todos os endereços usando paginação
    }

    // Método para buscar um endereço por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "enderecoPorId", key = "#id") // Armazena em cache o endereço buscado pelo ID
    public Endereco buscarEnderecoPorId(Long id) {
        return enderecoRepository.findById(id) // Busca o endereço pelo ID
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", id)); // Lança exceção se não encontrado
    }

    // NOVO: Método para buscar endereços por filtro e com paginação
    @Transactional(readOnly = true)
    // @Cacheable(value = "enderecosFiltrados", key = "{#filter, #pageable}") // Considere adicionar se aplicável
    public Page<Endereco> buscarEnderecosPorFiltro(EnderecoFilter filter, Pageable pageable) {
        return enderecoRepository.findAll(EnderecoSpecification.withFilters(filter), pageable); // Busca endereços com filtros e paginação
    }

    // Método para criar um novo endereço (reativo devido à chamada ao ViaCEP)
    @Transactional
    // Invalidar caches de listagem ao criar um novo endereço. O cache individual não faz sentido para criar.
    @CacheEvict(value = {"enderecosList", "enderecoPorId", "enderecosFiltrados"}, allEntries = true)
    public Mono<Endereco> criarEndereco(EnderecoRequestDto dto) { //
        // Validação básica do CEP
        if (dto.getCep() == null || dto.getCep().isBlank()) { //
            return Mono.error(new InvalidInputException("CEP não pode ser nulo ou vazio.")); //
        }

        // Consulta o ViaCEP de forma reativa
        return viaCepService.buscarEnderecoPorCep(dto.getCep()) //
                .flatMap(viaCepResponse -> { // Se o CEP for encontrado no ViaCEP
                    Endereco endereco = enderecoMapper.toEntity(dto); // Mapeia o DTO para a entidade Endereco
                    // Preenche os campos do endereço com os dados retornados pelo ViaCEP
                    endereco.setLogradouro(viaCepResponse.getLogradouro()); //
                    endereco.setBairro(viaCepResponse.getBairro()); //
                    endereco.setCidade(viaCepResponse.getLocalidade()); //
                    endereco.setEstado(viaCepResponse.getUf()); //
                    endereco.setPais("Brasil"); // Define o país como Brasil (ViaCEP é nacional)
                    // Salva o endereço preenchido no banco de dados
                    return Mono.just(enderecoRepository.save(endereco)); //
                })
                // Se o CEP não for encontrado no ViaCEP (switchIfEmpty é acionado se o Mono anterior estiver vazio)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Dados de CEP", "cep", dto.getCep()))) //
                .onErrorResume(e -> { // Trata erros que podem ocorrer durante o processo
                    // Se for uma exceção já conhecida (ResourceNotFoundException ou InvalidInputException), repassa
                    if (e instanceof ResourceNotFoundException || e instanceof InvalidInputException) { //
                        return Mono.error(e);
                    }
                    // Para outras exceções, encapsula em InvalidInputException
                    return Mono.error(new InvalidInputException("Erro ao consultar ViaCEP ou salvar endereço: " + e.getMessage())); //
                });
    }


    // Método para atualizar um endereço existente (reativo)
    @Transactional
    @CacheEvict(value = {"enderecosList", "enderecosFiltrados"}, allEntries = true) // Invalida caches de listagem
    @CachePut(value = "enderecoPorId", key = "#id") // Atualiza o cache específico do endereço
    public Mono<Endereco> atualizarEndereco(Long id, EnderecoRequestDto dto) { //
        return Mono.justOrEmpty(enderecoRepository.findById(id)) // Busca o endereço existente
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Endereço", id))) // Se não encontrar, lança erro
                .flatMap(enderecoExistente -> {
                    // Se um novo CEP foi fornecido no DTO, consulta o ViaCEP para atualizar os dados
                    if (dto.getCep() != null && !dto.getCep().isBlank() && !dto.getCep().equals(enderecoExistente.getCep())) { //
                        return viaCepService.buscarEnderecoPorCep(dto.getCep()) //
                                .flatMap(viaCepResponse -> {
                                    enderecoMapper.partialUpdate(dto, enderecoExistente); // Atualiza campos básicos do DTO
                                    // Preenche com os novos dados do ViaCEP
                                    enderecoExistente.setLogradouro(viaCepResponse.getLogradouro()); //
                                    enderecoExistente.setBairro(viaCepResponse.getBairro()); //
                                    enderecoExistente.setCidade(viaCepResponse.getLocalidade()); //
                                    enderecoExistente.setEstado(viaCepResponse.getUf()); //
                                    enderecoExistente.setPais("Brasil"); //
                                    return Mono.just(enderecoRepository.save(enderecoExistente)); // Salva o endereço atualizado
                                })
                                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Dados de CEP para atualização", "CEP", dto.getCep()))); //
                    } else {
                        // Se o CEP não mudou ou não foi fornecido, apenas atualiza os outros campos do DTO
                        enderecoMapper.partialUpdate(dto, enderecoExistente); //
                        return Mono.just(enderecoRepository.save(enderecoExistente)); // Salva o endereço atualizado
                    }
                })
                .onErrorResume(e -> { // Tratamento de erro
                    if (e instanceof ResourceNotFoundException || e instanceof InvalidInputException) { //
                        return Mono.error(e);
                    }
                    return Mono.error(new InvalidInputException("Erro inesperado ao atualizar endereço: " + e.getMessage())); //
                });
    }

    // Método para deletar um endereço
    @Transactional
    @CacheEvict(value = {"enderecoPorId", "enderecosList", "enderecosFiltrados"}, allEntries = true, key = "#id") // Remove o endereço dos caches relevantes
    public void deletarEndereco(Long id) {
        if (!enderecoRepository.existsById(id)) { // Verifica se o endereço existe
            throw new ResourceNotFoundException("Endereço", id); // Lança exceção se não encontrado
        }
        enderecoRepository.deleteById(id); // Deleta o endereço
    }
}