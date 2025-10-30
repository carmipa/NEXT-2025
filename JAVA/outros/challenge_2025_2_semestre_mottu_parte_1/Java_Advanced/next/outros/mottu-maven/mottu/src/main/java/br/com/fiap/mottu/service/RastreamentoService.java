package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.rastreamento.RastreamentoRequestDto; // DTO para entrada de dados de Rastreamento
import br.com.fiap.mottu.filter.RastreamentoFilter; // Filtros para busca de Rastreamentos
import br.com.fiap.mottu.mapper.RastreamentoMapper; // Mapper para Rastreamento
import br.com.fiap.mottu.model.Rastreamento; // Entidade Rastreamento
import br.com.fiap.mottu.repository.RastreamentoRepository; // Repositório para Rastreamento
import br.com.fiap.mottu.exception.*; // Exceções customizadas (ResourceNotFoundException, InvalidInputException)
import br.com.fiap.mottu.specification.RastreamentoSpecification; // Especificações para busca filtrada
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict;    // Para invalidar cache
import org.springframework.cache.annotation.CachePut;      // Para atualizar cache
import org.springframework.cache.annotation.Cacheable;     // Para habilitar cache em métodos
import org.springframework.data.domain.Page;          // Para resultados paginados
import org.springframework.data.domain.Pageable;        // Para informações de paginação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações
// import java.util.List; // Listas internas, mas retorno público será Page
// import java.math.BigDecimal; // Já importado na classe original

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class RastreamentoService {

    private final RastreamentoRepository rastreamentoRepository; // Repositório para Rastreamento
    private final RastreamentoMapper rastreamentoMapper; // Mapper para Rastreamento

    @Autowired // Injeta as dependências automaticamente pelo Spring
    public RastreamentoService(RastreamentoRepository rastreamentoRepository,
                               RastreamentoMapper rastreamentoMapper) { //
        this.rastreamentoRepository = rastreamentoRepository;
        this.rastreamentoMapper = rastreamentoMapper; //
    }

    // Método para listar todos os rastreamentos de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura
    @Cacheable("rastreamentosList") // Armazena em cache o resultado desta listagem paginada
    public Page<Rastreamento> listarTodosRastreamentos(Pageable pageable) {
        return rastreamentoRepository.findAll(pageable); // Busca todos os rastreamentos usando paginação
    }

    // Método para buscar um rastreamento por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "rastreamentoPorId", key = "#id") // Armazena em cache o rastreamento buscado pelo ID
    public Rastreamento buscarRastreamentoPorId(Long id) {
        return rastreamentoRepository.findById(id) // Busca o rastreamento pelo ID
                .orElseThrow(() -> new ResourceNotFoundException("Rastreamento", id)); // Lança exceção se não encontrado
    }

    // Método para buscar rastreamentos por filtro e com paginação
    @Transactional(readOnly = true)
    // @Cacheable(value = "rastreamentosFiltrados", key = "{#filter, #pageable}") // Considere adicionar se aplicável
    public Page<Rastreamento> buscarRastreamentosPorFiltro(RastreamentoFilter filter, Pageable pageable) {
        return rastreamentoRepository.findAll(RastreamentoSpecification.withFilters(filter), pageable); // Busca rastreamentos com filtros e paginação
    }

    // Método para criar um novo rastreamento
    @Transactional // Transação de escrita
    @CacheEvict(value = {"rastreamentosList", "rastreamentoPorId"}, allEntries = true) // Invalida caches relevantes
    public Rastreamento criarRastreamento(RastreamentoRequestDto dto) { //
        // Validação para garantir que todas as coordenadas obrigatórias foram fornecidas
        if (dto.getIpsX() == null || dto.getIpsY() == null || dto.getIpsZ() == null ||
                dto.getGprsLatitude() == null || dto.getGprsLongitude() == null || dto.getGprsAltitude() == null) { //
            throw new InvalidInputException("Todas as coordenadas (IPS_X, IPS_Y, IPS_Z, GPRS_LATITUDE, GPRS_LONGITUDE, GPRS_ALTITUDE) são obrigatórias."); //
        }
        Rastreamento rastreamento = rastreamentoMapper.toEntity(dto); // Mapeia DTO para entidade
        return rastreamentoRepository.save(rastreamento); // Salva o novo rastreamento
    }

    // Método para atualizar um rastreamento existente
    @Transactional
    @CachePut(value = "rastreamentoPorId", key = "#id") // Atualiza o cache 'rastreamentoPorId' com o rastreamento modificado
    @CacheEvict(value = "rastreamentosList", allEntries = true) // Invalida o cache de listagem
    public Rastreamento atualizarRastreamento(Long id, RastreamentoRequestDto dto) { //
        return rastreamentoRepository.findById(id) // Busca o rastreamento existente
                .map(existente -> { // Se encontrado, atualiza
                    // Validação similar à de criarRastreamento pode ser adicionada aqui se as coordenadas puderem se tornar nulas na atualização
                    if (dto.getIpsX() == null || dto.getIpsY() == null || dto.getIpsZ() == null ||
                            dto.getGprsLatitude() == null || dto.getGprsLongitude() == null || dto.getGprsAltitude() == null) {
                        throw new InvalidInputException("Na atualização, todas as coordenadas (IPS_X, IPS_Y, IPS_Z, GPRS_LATITUDE, GPRS_LONGITUDE, GPRS_ALTITUDE) devem ser fornecidas se a intenção for alterá-las para valores não nulos. Para manter o valor existente, não envie o campo ou envie o valor atual.");
                    }
                    rastreamentoMapper.partialUpdate(dto, existente); // Atualiza a entidade com dados do DTO
                    return rastreamentoRepository.save(existente); // Salva as alterações
                })
                .orElseThrow(() -> new ResourceNotFoundException("Rastreamento", id)); // Lança exceção se não encontrado para atualização
    }

    // Método para deletar um rastreamento
    @Transactional
    @CacheEvict(value = {"rastreamentoPorId", "rastreamentosList"}, allEntries = true, key = "#id") // Remove o rastreamento dos caches relevantes
    public void deletarRastreamento(Long id) {
        if (!rastreamentoRepository.existsById(id)) { // Verifica se o rastreamento existe
            throw new ResourceNotFoundException("Rastreamento", id); // Lança exceção se não encontrado
        }
        // A exclusão da associação em VeiculoRastreamento é tratada por 'orphanRemoval=true' na entidade Rastreamento (campo veiculoRastreamentos)
        rastreamentoRepository.deleteById(id); // Deleta o rastreamento
    }
}