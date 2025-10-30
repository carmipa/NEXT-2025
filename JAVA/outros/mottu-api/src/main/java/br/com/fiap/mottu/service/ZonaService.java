package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.zona.ZonaRequestDto; // DTO para entrada de dados de Zona
import br.com.fiap.mottu.filter.ZonaFilter; // Filtros para busca de Zonas
import br.com.fiap.mottu.mapper.ZonaMapper; // Mapper para converter entre Entidade e DTOs de Zona 
import br.com.fiap.mottu.model.Zona; // Entidade Zona 
import br.com.fiap.mottu.repository.ZonaRepository; // Repositório para Zona 
import br.com.fiap.mottu.exception.*; // Importa todas as exceções customizadas
import br.com.fiap.mottu.specification.ZonaSpecification; // Especificações para busca filtrada de Zona 
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict;    // Para invalidar cache
import org.springframework.cache.annotation.CachePut;      // Para atualizar cache
import org.springframework.cache.annotation.Cacheable;     // Para habilitar cache em métodos
import org.springframework.data.domain.Page;          // Para resultados paginados
import org.springframework.data.domain.Pageable;        // Para informações de paginação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações
// import java.util.List; // Não é mais o tipo de retorno público principal para listagens 

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class ZonaService {

    private final ZonaRepository zonaRepository; // Repositório para operações de Zona no banco
    private final ZonaMapper zonaMapper; // Mapper para Zona 

    @Autowired // Injeta as dependências automaticamente pelo Spring
    public ZonaService(ZonaRepository zonaRepository, ZonaMapper zonaMapper) {
        this.zonaRepository = zonaRepository; // 
        this.zonaMapper = zonaMapper; // 
    }

    // Método para listar todas as zonas de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("zonasList") // Armazena em cache o resultado desta listagem paginada
    public Page<Zona> listarTodasZonas(Pageable pageable) {
        return zonaRepository.findAll(pageable); // Busca todas as zonas usando paginação 
    }

    // Método para buscar uma zona por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "zonaPorId", key = "#id") // Armazena em cache a zona buscada pelo ID
    public Zona buscarZonaPorId(Long id) {
        return zonaRepository.findById(id) // Busca a zona pelo ID 
                .orElseThrow(() -> new ResourceNotFoundException("Zona", id)); // Lança exceção se não encontrada 
    }

    // Método para buscar zonas por filtro e com paginação
    @Transactional(readOnly = true)
    // @Cacheable(value = "zonasFiltradas", key = "{#filter, #pageable}") // Considere adicionar se aplicável
    public Page<Zona> buscarZonasPorFiltro(ZonaFilter filter, Pageable pageable) {
        return zonaRepository.findAll(ZonaSpecification.withFilters(filter), pageable); // Busca zonas com filtros e paginação 
    }

    // Método para criar uma nova zona
    @Transactional // Transação de escrita
    @CacheEvict(value = {"zonasList", "zonaPorId"}, allEntries = true) // Invalida caches relevantes
    public Zona criarZona(ZonaRequestDto dto) { // 
        String nome = dto.getNome(); // 
        // Verifica se já existe uma zona com o mesmo nome (ignorando maiúsculas/minúsculas)
        if (zonaRepository.findByNomeIgnoreCase(nome).isPresent()) { // 
            throw new DuplicatedResourceException("Zona", "nome", nome); // Lança exceção se nome duplicado 
        }
        Zona zona = zonaMapper.toEntity(dto); // Mapeia DTO para entidade 
        return zonaRepository.save(zona); // Salva a nova zona 
    }

    // Método para atualizar uma zona existente
    @Transactional
    @CachePut(value = "zonaPorId", key = "#id") // Atualiza o cache 'zonaPorId' com a zona modificada
    @CacheEvict(value = "zonasList", allEntries = true) // Invalida o cache de listagem
    public Zona atualizarZona(Long id, ZonaRequestDto dto) { // 
        return zonaRepository.findById(id) // Busca a zona existente 
                .map(existente -> { // Se encontrada, atualiza
                    String novoNome = dto.getNome(); // 
                    // Verifica se o novo nome (se fornecido e diferente do atual) já existe em outra zona
                    if (novoNome != null && !novoNome.isBlank() && !novoNome.equalsIgnoreCase(existente.getNome())) { // 
                        if (zonaRepository.findByNomeIgnoreCase(novoNome) // 
                                .filter(z -> !z.getIdZona().equals(id)) // Exclui a própria zona da checagem
                                .isPresent()) {
                            throw new DuplicatedResourceException("Zona", "nome", novoNome); // Lança exceção se duplicado 
                        }
                    }
                    zonaMapper.partialUpdate(dto, existente); // Atualiza a entidade com dados do DTO 
                    return zonaRepository.save(existente); // Salva as alterações
                })
                .orElseThrow(() -> new ResourceNotFoundException("Zona", id)); // Lança exceção se não encontrada para atualização 
    }

    // Método para deletar uma zona
    @Transactional
    @CacheEvict(value = {"zonaPorId", "zonasList"}, allEntries = true, key = "#id") // Remove a zona dos caches relevantes
    public void deletarZona(Long id) {
        if (!zonaRepository.existsById(id)) { // Verifica se a zona existe 
            throw new ResourceNotFoundException("Zona", id); // Lança exceção se não encontrada 
        }
        // A exclusão em cascata das associações (VeiculoZona, ZonaBox, ZonaPatio) é geralmente tratada pelo JPA
        // se 'orphanRemoval = true' e 'cascade = CascadeType.ALL' estiverem nas coleções da entidade Zona.
        zonaRepository.deleteById(id); // Deleta a zona 
    }
}