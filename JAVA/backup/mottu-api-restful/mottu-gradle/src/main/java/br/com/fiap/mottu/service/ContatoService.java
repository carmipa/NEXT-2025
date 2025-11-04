package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.contato.ContatoRequestDto; // DTO para entrada de dados de Contato
import br.com.fiap.mottu.filter.ContatoFilter; // Filtros para busca de Contatos
import br.com.fiap.mottu.mapper.ContatoMapper; // Mapper para converter entre Entidade e DTOs de Contato 
import br.com.fiap.mottu.model.Contato; // Entidade Contato 
import br.com.fiap.mottu.repository.ContatoRepository; // Repositório para Contato 
import br.com.fiap.mottu.exception.*; // Importa todas as exceções customizadas (DuplicatedResourceException, ResourceNotFoundException, etc.)
import br.com.fiap.mottu.specification.ContatoSpecification; // Especificações para busca filtrada de Contato 
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict; // Para invalidar cache
import org.springframework.cache.annotation.CachePut;   // Para atualizar cache
import org.springframework.cache.annotation.Cacheable;  // Para habilitar cache em métodos
import org.springframework.data.domain.Page; // Para resultados paginados
import org.springframework.data.domain.Pageable; // Para informações de paginação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações
import java.util.List; // Para listagem simples

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class ContatoService {

    private final ContatoRepository contatoRepository; // Repositório para operações de Contato no banco
    private final ContatoMapper contatoMapper; // Mapper para Contato 

    @Autowired // Injeta as dependências automaticamente pelo Spring
    public ContatoService(ContatoRepository contatoRepository, ContatoMapper contatoMapper) {
        this.contatoRepository = contatoRepository; // 
        this.contatoMapper = contatoMapper; // 
    }

    // Método para listar todos os contatos sem paginação
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("contatosListAll") // Armazena em cache o resultado desta listagem
    public List<Contato> listarTodosContatos() {
        return contatoRepository.findAll(); // Busca todos os contatos sem paginação
    }

    // Método para listar todos os contatos de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("contatosList") // Armazena em cache o resultado desta listagem paginada
    public Page<Contato> listarTodosContatos(Pageable pageable) {
        return contatoRepository.findAll(pageable); // Busca todos os contatos usando paginação
    }

    // Método para buscar um contato por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "contatoPorId", key = "#id") // Armazena em cache o contato buscado pelo ID
    public Contato buscarContatoPorId(Long id) {
        return contatoRepository.findById(id) // Busca o contato pelo ID 
                .orElseThrow(() -> new ResourceNotFoundException("Contato", id)); // Lança exceção se não encontrado 
    }

    // Método para buscar contatos por filtro e com paginação
    @Transactional(readOnly = true)
    // @Cacheable(value = "contatosFiltrados", key = "{#filter, #pageable}") // Considere adicionar se aplicável
    public Page<Contato> buscarContatosPorFiltro(ContatoFilter filter, Pageable pageable) {
        return contatoRepository.findAll(ContatoSpecification.withFilters(filter), pageable); // Busca contatos com filtros e paginação 
    }

    // Método para criar um novo contato
    @Transactional // Transação de escrita
    @CacheEvict(value = {"contatosList", "contatoPorId"}, allEntries = true) // Invalida caches relevantes
    public Contato criarContato(ContatoRequestDto dto) { // 
        String rawEmail = dto.getEmail();
        String email = rawEmail == null ? null : rawEmail.trim().toLowerCase();
        // Verifica se já existe um contato com o mesmo e-mail (normalizado)
        if (email != null && contatoRepository.findByEmail(email).isPresent()) {
            throw new DuplicatedResourceException("Contato", "email", email);
        }
        Contato contato = contatoMapper.toEntity(dto);
        if (email != null) {
            contato.setEmail(email);
        }
        return contatoRepository.save(contato);
    }

    // Método para atualizar um contato existente
    @Transactional
    @CachePut(value = "contatoPorId", key = "#id") // Atualiza o cache 'contatoPorId' com o contato modificado
    @CacheEvict(value = "contatosList", allEntries = true) // Invalida o cache de listagem
    public Contato atualizarContato(Long id, ContatoRequestDto dto) { // 
        return contatoRepository.findById(id) // Busca o contato existente 
                .map(existente -> { // Se encontrado, atualiza
                    String novoEmail = dto.getEmail(); // 
                    // Verifica se o novo e-mail (se fornecido e diferente do atual) já existe em outro contato
                    if (novoEmail != null && !novoEmail.isBlank() && !novoEmail.equalsIgnoreCase(existente.getEmail())) {
                        String norm = novoEmail.trim().toLowerCase();
                        if (contatoRepository.findByEmail(norm) // 
                                .filter(c -> !c.getIdContato().equals(id)) // Exclui o próprio contato da checagem
                                .isPresent()) {
                            throw new DuplicatedResourceException("Contato", "email", novoEmail); // Lança exceção se duplicado 
                        }
                        existente.setEmail(norm);
                    }
                    contatoMapper.partialUpdate(dto, existente); // Atualiza a entidade com dados do DTO 
                    return contatoRepository.save(existente); // Salva as alterações
                })
                .orElseThrow(() -> new ResourceNotFoundException("Contato", id)); // Lança exceção se não encontrado para atualização 
    }

    // Método para deletar um contato
    @Transactional
    @CacheEvict(value = {"contatoPorId", "contatosList"}, allEntries = true, key = "#id") // Remove o contato dos caches relevantes
    public void deletarContato(Long id) {
        if (!contatoRepository.existsById(id)) { // Verifica se o contato existe 
            throw new ResourceNotFoundException("Contato", id); // Lança exceção se não encontrado 
        }
        contatoRepository.deleteById(id); // Deleta o contato 
    }
}