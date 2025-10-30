package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.box.BoxRequestDto; // DTO para entrada de dados de Box
import br.com.fiap.mottu.filter.BoxFilter; // Filtros para busca de Boxes
import br.com.fiap.mottu.mapper.BoxMapper; // Mapper para converter entre Entidade e DTOs de Box
import br.com.fiap.mottu.model.Box; // Entidade Box
import br.com.fiap.mottu.repository.BoxRepository; // Repositório para Box
import br.com.fiap.mottu.exception.DuplicatedResourceException; // Exceção para recursos duplicados
import br.com.fiap.mottu.exception.ResourceNotFoundException; // Exceção para recursos não encontrados
import br.com.fiap.mottu.specification.BoxSpecification; // Especificações para busca filtrada de Box
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict; // Para remover entradas do cache
import org.springframework.cache.annotation.CachePut; // Para atualizar entradas no cache
import org.springframework.cache.annotation.Cacheable; // Para armazenar resultados de métodos em cache
import org.springframework.data.domain.Page; // Para resultados paginados
import org.springframework.data.domain.Pageable; // Para informações de paginação e ordenação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações
import java.util.List; // Usado internamente, mas os métodos públicos retornarão Page

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class BoxService {

    private final BoxRepository boxRepository; // Repositório para operações de Box no banco
    private final BoxMapper boxMapper; // Mapper para converter entre DTOs e Entidade Box 

    @Autowired // Injeta as dependências automaticamente pelo Spring
    public BoxService(BoxRepository boxRepository, BoxMapper boxMapper) {
        this.boxRepository = boxRepository; // 
        this.boxMapper = boxMapper; // 
    }

    // Método para listar todos os boxes de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("boxesList") // Armazena em cache o resultado desta listagem paginada
    public Page<Box> listarTodosBoxes(Pageable pageable) {
        return boxRepository.findAll(pageable); // Busca todos os boxes usando paginação
    }

    // Método para buscar um box por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "boxPorId", key = "#id") // Armazena em cache o box buscado pelo ID
    public Box buscarBoxPorId(Long id) {
        return boxRepository.findById(id) // Busca o box pelo ID 
                .orElseThrow(() -> new ResourceNotFoundException("Box", id)); // Lança exceção se não encontrado 
    }

    // Método para buscar boxes por filtro e com paginação
    @Transactional(readOnly = true)
    public Page<Box> buscarBoxesPorFiltro(BoxFilter filter, Pageable pageable) {
        return boxRepository.findAll(BoxSpecification.withFilters(filter), pageable); // Busca boxes com filtros e paginação 
    }

    // Método para criar um novo box
    @Transactional // Transação de escrita
    @CacheEvict(value = {"boxesList", "boxPorId"}, allEntries = true) // Remove todas as entradas dos caches 'boxesList' e 'boxPorId' após criar um novo box
    public Box criarBox(BoxRequestDto boxRequestDto) {
        String nome = boxRequestDto.getNome(); // 
        // Verifica se já existe um box com o mesmo nome (ignorando maiúsculas/minúsculas)
        if (boxRepository.findByNomeIgnoreCase(nome).isPresent()) { // 
            throw new DuplicatedResourceException("Box", "nome", nome); // Lança exceção se nome duplicado 
        }
        Box box = boxMapper.toEntity(boxRequestDto); // Mapeia DTO para entidade 
        return boxRepository.save(box); // Salva o novo box 
    }

    // Método para atualizar um box existente
    @Transactional
    @CachePut(value = "boxPorId", key = "#id") // Atualiza o cache 'boxPorId' com o box modificado
    @CacheEvict(value = "boxesList", allEntries = true) // Invalida o cache de listagem
    public Box atualizarBox(Long id, BoxRequestDto boxRequestDto) {
        return boxRepository.findById(id) // Busca o box existente 
                .map(boxExistente -> { // Se encontrado, atualiza
                    String novoNome = boxRequestDto.getNome(); // 
                    // Verifica se o novo nome (se fornecido e diferente do atual) já existe em outro box
                    if (novoNome != null && !novoNome.isBlank() && !novoNome.equalsIgnoreCase(boxExistente.getNome())) {
                        if (boxRepository.findByNomeIgnoreCase(novoNome) // 
                                .filter(b -> !b.getIdBox().equals(id)) // Exclui o próprio box da checagem
                                .isPresent()) {
                            throw new DuplicatedResourceException("Box", "nome", novoNome); // Lança exceção se duplicado 
                        }
                    }
                    boxMapper.partialUpdate(boxRequestDto, boxExistente); // Atualiza a entidade com dados do DTO 
                    return boxRepository.save(boxExistente); // Salva as alterações
                })
                .orElseThrow(() -> new ResourceNotFoundException("Box", id)); // Lança exceção se não encontrado para atualização 
    }

    // Método para deletar um box
    @Transactional
    @CacheEvict(value = {"boxPorId", "boxesList"}, allEntries = true, key = "#id") // Remove o box dos caches relevantes
    public void deletarBox(Long id) {
        if (!boxRepository.existsById(id)) { // Verifica se o box existe 
            throw new ResourceNotFoundException("Box", id); // Lança exceção se não encontrado 
        }
        boxRepository.deleteById(id); // Deleta o box 
    }
}