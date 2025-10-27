package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.veiculo.VeiculoRequestDto; // DTO para criar/atualizar Veiculo
import br.com.fiap.mottu.dto.veiculo.VeiculoLocalizacaoResponseDto; // DTO para resposta de localização
import br.com.fiap.mottu.filter.VeiculoFilter; // DTO para filtros de busca de Veiculo
import br.com.fiap.mottu.mapper.VeiculoMapper; // Mapper para Veiculo
import br.com.fiap.mottu.mapper.RastreamentoMapper; // Mapper para Rastreamento
import br.com.fiap.mottu.mapper.PatioMapper;       // Mapper para Patio
import br.com.fiap.mottu.mapper.ZonaMapper;       // Mapper para Zona
import br.com.fiap.mottu.mapper.BoxMapper;           // Mapper para Box
import br.com.fiap.mottu.model.Veiculo; // Entidade Veiculo
import br.com.fiap.mottu.model.Rastreamento; // Entidade Rastreamento
import br.com.fiap.mottu.model.Patio;       // Entidade Patio
import br.com.fiap.mottu.model.Zona;         // Entidade Zona
import br.com.fiap.mottu.model.Box;           // Entidade Box
import br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento; // Entidade de junção Veiculo-Rastreamento
import br.com.fiap.mottu.model.relacionamento.VeiculoPatio; // Entidade de junção Veiculo-Patio
import br.com.fiap.mottu.model.relacionamento.VeiculoZona; // Entidade de junção Veiculo-Zona
import br.com.fiap.mottu.model.relacionamento.VeiculoBox; // Entidade de junção Veiculo-Box
import br.com.fiap.mottu.repository.VeiculoRepository; // Repositório para Veiculo
import br.com.fiap.mottu.exception.DuplicatedResourceException; // Exceção para recursos duplicados
import br.com.fiap.mottu.exception.ResourceNotFoundException; // Exceção para recursos não encontrados
import br.com.fiap.mottu.specification.VeiculoSpecification; // Especificações para busca filtrada de Veiculo
import org.springframework.beans.factory.annotation.Autowired; // Para injeção de dependência
import org.springframework.cache.annotation.CacheEvict; // Para remover entradas do cache
import org.springframework.cache.annotation.CachePut; // Para atualizar entradas no cache
import org.springframework.cache.annotation.Cacheable; // Para armazenar resultados de métodos em cache
import org.springframework.data.domain.Page; // Para resultados paginados
import org.springframework.data.domain.Pageable; // Para informações de paginação e ordenação
import org.springframework.stereotype.Service; // Marca a classe como um serviço do Spring
import org.springframework.transaction.annotation.Transactional; // Para gerenciamento de transações

import java.time.LocalDateTime; // Para registrar o momento da consulta de localização
import java.util.Comparator; // Para comparar e encontrar o maior/menor elemento em uma stream
import java.util.List; // Interface para listas
import java.util.Optional; // Para lidar com valores que podem ser nulos

@Service // Indica que esta classe é um componente de serviço gerenciado pelo Spring
public class VeiculoService {

    private final VeiculoRepository veiculoRepository; // Repositório para operações de Veiculo no banco
    private final VeiculoMapper veiculoMapper; // Mapper para converter entre DTOs e Entidade Veiculo
    private final RastreamentoMapper rastreamentoMapper; // Mapper para Rastreamento
    private final PatioMapper patioMapper; // Mapper para Patio
    private final ZonaMapper zonaMapper; // Mapper para Zona
    private final BoxMapper boxMapper; // Mapper para Box

    @Autowired // Injeta as dependências automaticamente pelo Spring
    public VeiculoService(VeiculoRepository veiculoRepository,
                          VeiculoMapper veiculoMapper,
                          RastreamentoMapper rastreamentoMapper,
                          PatioMapper patioMapper,
                          ZonaMapper zonaMapper,
                          BoxMapper boxMapper) {
        this.veiculoRepository = veiculoRepository;
        this.veiculoMapper = veiculoMapper;
        this.rastreamentoMapper = rastreamentoMapper;
        this.patioMapper = patioMapper;
        this.zonaMapper = zonaMapper;
        this.boxMapper = boxMapper;
    }

    // Método para listar todos os veículos de forma paginada
    @Transactional(readOnly = true) // Transação apenas de leitura, otimiza a performance
    @Cacheable("veiculosList") // Armazena em cache o resultado desta listagem paginada
    public Page<Veiculo> listarTodosVeiculos(Pageable pageable) {
        return veiculoRepository.findAll(pageable); // Busca todos os veículos usando paginação
    }

    // Método para buscar um veículo por ID
    @Transactional(readOnly = true)
    @Cacheable(value = "veiculoPorId", key = "#id") // Armazena em cache o veículo buscado pelo ID
    public Veiculo buscarVeiculoPorId(Long id) {
        return veiculoRepository.findById(id) // Busca o veículo pelo ID
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id)); // Lança exceção se não encontrado
    }

    // Método para buscar veículos por filtro e com paginação
    @Transactional(readOnly = true)
    public Page<Veiculo> buscarVeiculosPorFiltro(VeiculoFilter filter, Pageable pageable) {
        return veiculoRepository.findAll(VeiculoSpecification.withFilters(filter), pageable); // Busca veículos com filtros e paginação
    }

    // Método para criar um novo veículo
    @Transactional // Transação de escrita (pode modificar o banco)
    @CacheEvict(value = {"veiculosList", "veiculoLocalizacao"}, allEntries = true) // Remove todas as entradas dos caches 'veiculosList' e 'veiculoLocalizacao' após criar um novo veículo
    public Veiculo criarVeiculo(VeiculoRequestDto dto) {
        // Validações de duplicidade: placa, RENAVAM e chassi
        if (veiculoRepository.findByPlaca(dto.getPlaca()).isPresent()) { //
            throw new DuplicatedResourceException("Veículo", "placa", dto.getPlaca()); //
        }
        if (veiculoRepository.findByRenavam(dto.getRenavam()).isPresent()) { //
            throw new DuplicatedResourceException("Veículo", "RENAVAM", dto.getRenavam()); //
        }
        if (veiculoRepository.findByChassi(dto.getChassi()).isPresent()) { //
            throw new DuplicatedResourceException("Veículo", "chassi", dto.getChassi()); //
        }
        Veiculo veiculo = veiculoMapper.toEntity(dto); // Mapeia DTO para entidade
        return veiculoRepository.save(veiculo); // Salva o novo veículo
    }

    // Método para atualizar um veículo existente
    @Transactional
    @CachePut(value = "veiculoPorId", key = "#id") // Atualiza o cache 'veiculoPorId' com o veículo modificado
    @CacheEvict(value = {"veiculosList", "veiculoLocalizacao"}, allEntries = true) // Invalida outros caches relevantes
    public Veiculo atualizarVeiculo(Long id, VeiculoRequestDto dto) {
        Veiculo existente = veiculoRepository.findById(id) // Busca o veículo existente
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id)); //

        // Validação de placa duplicada (se alterada e diferente da placa de outro veículo)
        if (dto.getPlaca() != null && !dto.getPlaca().isBlank() && !dto.getPlaca().equals(existente.getPlaca())) {
            if (veiculoRepository.findByPlaca(dto.getPlaca()) //
                    .filter(v -> !v.getIdVeiculo().equals(id)) // Exclui o próprio veículo da checagem
                    .isPresent()) {
                throw new DuplicatedResourceException("Veículo", "placa", dto.getPlaca()); //
            }
        }

        // Validação de RENAVAM duplicado (se alterado e diferente do RENAVAM de outro veículo)
        if (dto.getRenavam() != null && !dto.getRenavam().isBlank() && !dto.getRenavam().equals(existente.getRenavam())) {
            if (veiculoRepository.findByRenavam(dto.getRenavam()) //
                    .filter(v -> !v.getIdVeiculo().equals(id)) // Exclui o próprio veículo
                    .isPresent()) {
                throw new DuplicatedResourceException("Veículo", "RENAVAM", dto.getRenavam()); //
            }
        }

        // Validação de chassi duplicado (se alterado e diferente do chassi de outro veículo)
        if (dto.getChassi() != null && !dto.getChassi().isBlank() && !dto.getChassi().equals(existente.getChassi())) {
            if (veiculoRepository.findByChassi(dto.getChassi()) //
                    .filter(v -> !v.getIdVeiculo().equals(id)) // Exclui o próprio veículo
                    .isPresent()) {
                throw new DuplicatedResourceException("Veículo", "chassi", dto.getChassi()); //
            }
        }

        veiculoMapper.partialUpdate(dto, existente); // Atualiza a entidade com dados do DTO
        return veiculoRepository.save(existente); // Salva as alterações
    }

    // Método para deletar um veículo
    @Transactional
    @CacheEvict(value = {"veiculoPorId", "veiculosList", "veiculoLocalizacao"}, allEntries = true, key = "#id") // Remove o veículo dos caches relevantes
    public void deletarVeiculo(Long id) {
        if (!veiculoRepository.existsById(id)) { // Verifica se o veículo existe
            throw new ResourceNotFoundException("Veículo", id); //
        }
        veiculoRepository.deleteById(id); // Deleta o veículo
    }

    /**
     * Retorna o último ponto de rastreamento de um veículo e suas associações atuais
     * com Pátio, Zona e Box.
     * @param veiculoId ID do veículo.
     * @return DTO com informações de localização do veículo.
     * @throws ResourceNotFoundException se o veículo não for encontrado.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "veiculoLocalizacao", key = "#veiculoId") // Armazena em cache o resultado da localização
    public VeiculoLocalizacaoResponseDto getLocalizacaoVeiculo(Long veiculoId) {
        Veiculo veiculo = veiculoRepository.findById(veiculoId) // Busca o veículo
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId)); //

        Rastreamento ultimoRastreamento = null; // Inicializa o último rastreamento como nulo

        // Encontrar o último rastreamento associado ao veículo usando o novo campo dataHoraRegistro.
        Optional<VeiculoRastreamento> ultimaAssociacaoRastreamento = veiculo.getVeiculoRastreamentos().stream() // Obtém o stream das associações de rastreamento
                .filter(va -> va.getRastreamento() != null && va.getRastreamento().getDataHoraRegistro() != null) // Garante que rastreamento e dataHoraRegistro não sejam nulos
                .max(Comparator.comparing(va -> va.getRastreamento().getDataHoraRegistro())); // Encontra o mais recente pela dataHoraRegistro

        if (ultimaAssociacaoRastreamento.isPresent()) {
            ultimoRastreamento = ultimaAssociacaoRastreamento.get().getRastreamento(); // Obtém a entidade Rastreamento
        }

        // Encontrar Patio associado (um veículo pode estar em um Patio via VeiculoPatio)
        Patio patioAssociado = veiculo.getVeiculoPatios().stream() //
                .map(VeiculoPatio::getPatio) // Mapeia para a entidade Patio
                .findFirst() // Pega o primeiro pátio associado (ou nenhum)
                .orElse(null); // Retorna null se não houver pátio associado

        // Encontrar Zona associada (um veículo pode estar em uma Zona via VeiculoZona)
        Zona zonaAssociada = veiculo.getVeiculoZonas().stream() //
                .map(VeiculoZona::getZona) // Mapeia para a entidade Zona
                .findFirst() // Pega a primeira zona associada
                .orElse(null); // Retorna null se não houver zona associada

        // Encontrar Box associado (um veículo pode estar em um Box via VeiculoBox)
        Box boxAssociado = veiculo.getVeiculoBoxes().stream() //
                .map(VeiculoBox::getBox) // Mapeia para a entidade Box
                .findFirst() // Pega o primeiro box associado
                .orElse(null); // Retorna null se não houver box associado

        // Constrói e retorna o DTO de localização do veículo
        return new VeiculoLocalizacaoResponseDto( //
                veiculo.getIdVeiculo(), //
                veiculo.getPlaca(), //
                veiculo.getModelo(), //
                veiculo.getFabricante(), //
                (ultimoRastreamento != null) ? rastreamentoMapper.toResponseDto(ultimoRastreamento) : null, // Mapeia o último rastreamento para DTO, se existir
                (patioAssociado != null) ? patioMapper.toResponseDto(patioAssociado) : null, // Mapeia pátio para DTO, se existir
                (zonaAssociada != null) ? zonaMapper.toResponseDto(zonaAssociada) : null, // Mapeia zona para DTO, se existir
                (boxAssociado != null) ? boxMapper.toResponseDto(boxAssociado) : null, // Mapeia box para DTO, se existir
                LocalDateTime.now() // Timestamp da consulta
        );
    }
}