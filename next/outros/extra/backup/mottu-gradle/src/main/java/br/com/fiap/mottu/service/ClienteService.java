// java\br\com\fiap\mottu\service\ClienteService.java   |   package br.com.fiap.mottu.service   |   class ClienteService
//――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.cliente.ClienteRequestDto; // DTO para entrada de dados de Cliente
// import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto; // Não usado diretamente aqui, mas sim dentro do ClienteRequestDto
// import br.com.fiap.mottu.dto.contato.ContatoRequestDto; // Não usado diretamente aqui, mas sim dentro do ClienteRequestDto
import br.com.fiap.mottu.dto.contato.ContatoRequestDto;
import br.com.fiap.mottu.filter.ClienteFilter; // Filtros para busca de Clientes
import br.com.fiap.mottu.model.Cliente; // Entidade Cliente
import br.com.fiap.mottu.model.Contato; // Entidade Contato
import br.com.fiap.mottu.model.Endereco; // Entidade Endereco
import br.com.fiap.mottu.model.Veiculo; // Entidade Veiculo
import br.com.fiap.mottu.model.relacionamento.ClienteVeiculo; // Entidade de junção Cliente-Veiculo
import br.com.fiap.mottu.model.relacionamento.ClienteVeiculoId; // ID composto para ClienteVeiculo
import br.com.fiap.mottu.repository.ClienteRepository; // Repositório para Cliente
import br.com.fiap.mottu.repository.relacionamento.ClienteVeiculoRepository; // Repositório para ClienteVeiculo
import br.com.fiap.mottu.repository.ContatoRepository; // Repositório para Contato
import br.com.fiap.mottu.repository.EnderecoRepository; // Repositório para Endereco
import br.com.fiap.mottu.repository.VeiculoRepository; // Repositório para Veiculo
import br.com.fiap.mottu.specification.ClienteSpecification; // Especificações para busca filtrada de Cliente
import br.com.fiap.mottu.exception.ResourceNotFoundException; // Exceção para recursos não encontrados
import br.com.fiap.mottu.exception.DuplicatedResourceException; // Exceção para recursos duplicados
import br.com.fiap.mottu.exception.InvalidInputException; // Exceção para entrada inválida
import br.com.fiap.mottu.mapper.ClienteMapper; // Mapper para Cliente
import br.com.fiap.mottu.mapper.ContatoMapper; // Mapper para Contato
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict; // Para invalidar cache
import org.springframework.cache.annotation.CachePut;   // Para atualizar cache
import org.springframework.cache.annotation.Cacheable;  // Para habilitar cache em métodos
import org.springframework.data.domain.Page; // Para resultados paginados
import org.springframework.data.domain.Pageable; // Para informações de paginação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações
import reactor.core.publisher.Mono; // Para programação reativa (usado em criar/atualizar devido ao ViaCEP)

import java.util.Set; // Para coleções como Set de Veículos
import java.util.stream.Collectors; // Para operações com streams

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class ClienteService {

    private final ClienteRepository clienteRepository; // Repositório para Cliente
    private final EnderecoRepository enderecoRepository; // Repositório para Endereco
    private final ContatoRepository contatoRepository; // Repositório para Contato
    private final VeiculoRepository veiculoRepository; // Repositório para Veiculo
    private final ClienteVeiculoRepository clienteVeiculoRepository; // Repositório para a relação Cliente-Veiculo
    private final EnderecoService enderecoService; // Serviço de Endereco (para criar/atualizar endereço com ViaCEP)
    private final ClienteMapper clienteMapper; // Mapper para Cliente
    private final ContatoMapper contatoMapper; // Mapper para Contato

    @Autowired // Construtor para injeção de dependências
    public ClienteService(
            ClienteRepository clienteRepository,
            EnderecoRepository enderecoRepository,
            ContatoRepository contatoRepository,
            VeiculoRepository veiculoRepository,
            ClienteVeiculoRepository clienteVeiculoRepository,
            EnderecoService enderecoService, //
            ClienteMapper clienteMapper,
            ContatoMapper contatoMapper //
    ) {
        this.clienteRepository = clienteRepository;
        this.enderecoRepository = enderecoRepository; //
        this.contatoRepository = contatoRepository; //
        this.veiculoRepository = veiculoRepository; //
        this.clienteVeiculoRepository = clienteVeiculoRepository; //
        this.enderecoService = enderecoService; //
        this.clienteMapper = clienteMapper; //
        this.contatoMapper = contatoMapper; //
    }

    // Método para listar todos os clientes de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("clientesList") // Armazena em cache o resultado desta listagem paginada
    public Page<Cliente> listarTodosClientes(Pageable pageable) {
        return clienteRepository.findAll(pageable); // Busca todos os clientes usando paginação
    }

    // Método para buscar um cliente por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "clientePorId", key = "#id") // Armazena em cache o cliente buscado pelo ID
    public Cliente buscarClientePorId(Long id) {
        return clienteRepository.findById(id) // Busca o cliente pelo ID
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id)); // Lança exceção se não encontrado
    }

    // Método para buscar clientes por filtro e com paginação
    @Transactional(readOnly = true)
    // Considerar adicionar caching aqui também se os filtros forem usados frequentemente com os mesmos parâmetros
    // Ex: @Cacheable(value = "clientesFiltrados", key = "{#filter, #pageable}")
    public Page<Cliente> buscarClientesPorFiltro(ClienteFilter filter, Pageable pageable) {
        return clienteRepository.findAll(ClienteSpecification.withFilters(filter), pageable); // Busca clientes com filtros e paginação
    }

    // Método para criar um novo cliente (reativo devido à chamada ao ViaCEP)
    @Transactional
    @CacheEvict(value = {"clientesList", "clientePorId", "veiculosDoCliente"}, allEntries = true) // Invalida caches relevantes
    public Mono<Cliente> criarCliente(ClienteRequestDto dto) { //
        // Verifica se já existe um cliente com o mesmo CPF
        if (clienteRepository.findByCpf(dto.getCpf()).isPresent()) { //
            return Mono.error(new DuplicatedResourceException("Cliente", "CPF", dto.getCpf())); //
        }

        // Lógica para obter ou criar Endereço (reativa)
        Mono<Endereco> enderecoMono = (dto.getEnderecoRequestDto().getIdEndereco() != null) //
                ? Mono.justOrEmpty(enderecoRepository.findById(dto.getEnderecoRequestDto().getIdEndereco())) //
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Endereço", dto.getEnderecoRequestDto().getIdEndereco()))) //
                : enderecoService.criarEndereco(dto.getEnderecoRequestDto()); // Chama o serviço de endereço (reativo)

        // Lógica para obter ou criar Contato (síncrona, mas envolvida no fluxo reativo)
        Mono<Contato> contatoMono = Mono.defer(() -> { // Envolve a lógica síncrona em Mono.defer para integrá-la corretamente ao fluxo reativo
            ContatoRequestDto contatoDto = dto.getContatoRequestDto(); //
            if (contatoDto.getIdContato() != null) { //
                return Mono.justOrEmpty(contatoRepository.findById(contatoDto.getIdContato())) //
                        .switchIfEmpty(Mono.error(new ResourceNotFoundException("Contato", contatoDto.getIdContato()))); //
            } else {
                // Checagem de duplicação de e-mail para novos contatos
                if (contatoDto.getEmail() != null && contatoRepository.findByEmail(contatoDto.getEmail()).isPresent()) { //
                    return Mono.error(new DuplicatedResourceException("Contato", "email", contatoDto.getEmail()));
                }
                return Mono.just(contatoRepository.save(contatoMapper.toEntity(contatoDto))); //
            }
        });

        // Combina os resultados reativos de endereço e contato para criar o cliente
        return Mono.zip(enderecoMono, contatoMono) //
                .flatMap(tuple -> {
                    Cliente cliente = clienteMapper.toEntity(dto); // Mapeia DTO para entidade
                    cliente.setEndereco(tuple.getT1()); // Associa o endereço
                    cliente.setContato(tuple.getT2()); // Associa o contato
                    return Mono.just(clienteRepository.save(cliente)); // Salva o cliente
                })
                .onErrorResume(e -> { // Tratamento de erro para o fluxo reativo
                    if (e instanceof ResourceNotFoundException || e instanceof DuplicatedResourceException || e instanceof InvalidInputException) { //
                        return Mono.error(e); // Repassa exceções conhecidas
                    }
                    // Para outras exceções, encapsula em InvalidInputException
                    return Mono.error(new InvalidInputException("Erro inesperado ao criar cliente: " + e.getMessage())); //
                });
    }

    // Método para atualizar um cliente existente (reativo)
    @Transactional
    @CacheEvict(value = {"clientesList", "veiculosDoCliente"}, allEntries = true) // Invalida caches de listagem
    @CachePut(value = "clientePorId", key = "#id") // Atualiza o cache específico do cliente
    public Mono<Cliente> atualizarCliente(Long id, ClienteRequestDto dto) { //
        return Mono.justOrEmpty(clienteRepository.findById(id)) // Busca o cliente existente
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Cliente", id))) // Se não encontrar, lança erro
                .flatMap(clienteExistente -> {
                    // Verifica duplicação de CPF se estiver sendo alterado
                    if (dto.getCpf() != null && !dto.getCpf().equals(clienteExistente.getCpf()) && clienteRepository.findByCpf(dto.getCpf()).isPresent()) { //
                        return Mono.error(new DuplicatedResourceException("Cliente", "CPF", dto.getCpf())); //
                    }

                    clienteMapper.partialUpdate(dto, clienteExistente); // Atualiza campos básicos do cliente

                    // Lógica para atualizar ou criar Endereço (reativa)
                    Mono<Endereco> enderecoMono;
                    if (dto.getEnderecoRequestDto() != null) { //
                        if (dto.getEnderecoRequestDto().getIdEndereco() != null) { //
                            // Atualiza endereço existente
                            enderecoMono = enderecoService.atualizarEndereco(dto.getEnderecoRequestDto().getIdEndereco(), dto.getEnderecoRequestDto()); //
                        } else {
                            // Cria novo endereço
                            enderecoMono = enderecoService.criarEndereco(dto.getEnderecoRequestDto()); //
                        }
                        enderecoMono = enderecoMono.doOnNext(clienteExistente::setEndereco); // Associa o endereço atualizado/criado ao cliente
                    } else {
                        enderecoMono = Mono.just(clienteExistente.getEndereco()); // Mantém o endereço existente se não houver DTO de endereço
                    }

                    // Lógica para atualizar ou criar Contato (reativa)
                    Mono<Contato> contatoMono;
                    if (dto.getContatoRequestDto() != null) { //
                        ContatoRequestDto contatoDto = dto.getContatoRequestDto();
                        if (contatoDto.getIdContato() != null) { //
                            // Atualiza contato existente
                            contatoMono = Mono.justOrEmpty(contatoRepository.findById(contatoDto.getIdContato())) //
                                    .switchIfEmpty(Mono.error(new ResourceNotFoundException("Contato", contatoDto.getIdContato()))) //
                                    .flatMap(contatoExistente -> {
                                        // Checagem de duplicação de e-mail se estiver sendo alterado para um e-mail que já existe em outro contato
                                        if (contatoDto.getEmail() != null && !contatoDto.getEmail().equals(contatoExistente.getEmail()) &&
                                                contatoRepository.findByEmail(contatoDto.getEmail()).filter(c -> !c.getIdContato().equals(contatoExistente.getIdContato())).isPresent()) { //
                                            return Mono.error(new DuplicatedResourceException("Contato", "email", contatoDto.getEmail()));
                                        }
                                        contatoMapper.partialUpdate(contatoDto, contatoExistente); //
                                        return Mono.just(contatoRepository.save(contatoExistente)); //
                                    });
                        } else {
                            // Cria novo contato
                            // Checagem de duplicação de e-mail para novos contatos
                            if (contatoDto.getEmail() != null && contatoRepository.findByEmail(contatoDto.getEmail()).isPresent()) { //
                                return Mono.error(new DuplicatedResourceException("Contato", "email", contatoDto.getEmail()));
                            }
                            contatoMono = Mono.just(contatoRepository.save(contatoMapper.toEntity(contatoDto))); //
                        }
                        contatoMono = contatoMono.doOnNext(clienteExistente::setContato); // Associa o contato atualizado/criado ao cliente
                    } else {
                        contatoMono = Mono.just(clienteExistente.getContato()); // Mantém o contato existente
                    }

                    // Espera a conclusão das operações de endereço e contato, depois salva o cliente
                    return Mono.when(enderecoMono, contatoMono).then(Mono.fromCallable(() -> clienteRepository.save(clienteExistente)));
                })
                .onErrorResume(e -> { // Tratamento de erro para o fluxo reativo
                    if (e instanceof ResourceNotFoundException || e instanceof DuplicatedResourceException || e instanceof InvalidInputException) { //
                        return Mono.error(e);
                    }
                    return Mono.error(new InvalidInputException("Erro inesperado ao atualizar cliente: " + e.getMessage())); //
                });
    }

    // Método para deletar um cliente
    @Transactional
    @CacheEvict(value = {"clientesList", "clientePorId", "veiculosDoCliente"}, allEntries = true, key = "#id") // Remove o cliente de todos os caches relevantes
    public void deletarCliente(Long id) {
        if (!clienteRepository.existsById(id)) { // Verifica se o cliente existe
            throw new ResourceNotFoundException("Cliente", id); // Lança exceção se não encontrado
        }
        // Considerar a lógica de desassociação ou o que acontece com Endereco e Contato se forem exclusivos deste cliente
        // Atualmente, Endereco e Contato não são excluídos automaticamente aqui, apenas o Cliente e suas associações diretas (ClienteVeiculo).
        clienteRepository.deleteById(id); // Deleta o cliente
    }

    // Método para associar um veículo a um cliente
    @Transactional
    @CacheEvict(value = {"clientePorId", "veiculosDoCliente"}, key = "#clienteId", allEntries = true) // Invalida caches do cliente específico
    public ClienteVeiculo associarClienteVeiculo(Long clienteId, Long enderecoId, Long contatoId, Long veiculoId) {
        // Busca o cliente ou lança exceção
        Cliente cliente = clienteRepository.findById(clienteId) //
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", clienteId)); //
        // Busca o veículo ou lança exceção
        Veiculo veiculo = veiculoRepository.findById(veiculoId) //
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId)); //

        // Valida se os IDs de endereço e contato no ClienteVeiculoId correspondem aos do Cliente buscado
        if (!cliente.getEndereco().getIdEndereco().equals(enderecoId)) {
            throw new InvalidInputException("ID do endereço fornecido (" + enderecoId + ") não corresponde ao endereço associado ao cliente (" + cliente.getEndereco().getIdEndereco() + ").");
        }
        if (!cliente.getContato().getIdContato().equals(contatoId)) {
            throw new InvalidInputException("ID do contato fornecido (" + contatoId + ") não corresponde ao contato associado ao cliente (" + cliente.getContato().getIdContato() + ").");
        }

        ClienteVeiculoId id = new ClienteVeiculoId(clienteId, enderecoId, contatoId, veiculoId); // Cria o ID composto
        if (clienteVeiculoRepository.existsById(id)) { // Verifica se a associação já existe
            throw new DuplicatedResourceException("Associação Cliente-Veículo", "IDs", id.toString()); //
        }
        ClienteVeiculo associacao = new ClienteVeiculo(cliente, veiculo); // Cria a entidade de relacionamento
        return clienteVeiculoRepository.save(associacao); // Salva a associação
    }

    // Método para desassociar um veículo de um cliente
    @Transactional
    @CacheEvict(value = {"clientePorId", "veiculosDoCliente"}, key = "#clienteId", allEntries = true) // Invalida caches do cliente
    public void desassociarClienteVeiculo(Long clienteId, Long enderecoId, Long contatoId, Long veiculoId) { //
        ClienteVeiculoId id = new ClienteVeiculoId(clienteId, enderecoId, contatoId, veiculoId); // Cria o ID composto
        if (!clienteVeiculoRepository.existsById(id)) { // Verifica se a associação existe para ser removida
            throw new ResourceNotFoundException("Associação Cliente-Veículo", "IDs", id.toString()); //
        }
        clienteVeiculoRepository.deleteById(id); // Remove a associação
    }

    // Método para listar os veículos de um cliente
    @Transactional(readOnly = true)
    @Cacheable(value = "veiculosDoCliente", key = "#clienteId") // Armazena em cache a lista de veículos do cliente
    public Set<Veiculo> getVeiculosByClienteId(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId) // Busca o cliente
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", clienteId)); // Lança exceção se não encontrado
        // Mapeia as associações ClienteVeiculo para obter apenas as entidades Veiculo
        return cliente.getClienteVeiculos().stream() //
                .map(ClienteVeiculo::getVeiculo) //
                .collect(Collectors.toSet()); //
    }
}