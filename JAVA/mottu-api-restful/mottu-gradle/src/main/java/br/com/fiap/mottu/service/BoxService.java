package br.com.fiap.mottu.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.OperationNotAllowedException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.filter.BoxFilter;
import br.com.fiap.mottu.mapper.BoxMapper;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.model.relacionamento.VeiculoBox;
import br.com.fiap.mottu.model.relacionamento.VeiculoBoxId;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.repository.relacionamento.VeiculoBoxRepository;
import br.com.fiap.mottu.specification.BoxSpecification;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BoxService {

    private final BoxRepository boxRepository;
    private final BoxMapper boxMapper;
    private final PatioRepository patioRepository;
    private final VeiculoRepository veiculoRepository;
    private final VeiculoBoxRepository veiculoBoxRepository;

    public BoxService(BoxRepository boxRepository, BoxMapper boxMapper,
                      PatioRepository patioRepository, VeiculoRepository veiculoRepository,
                      VeiculoBoxRepository veiculoBoxRepository) {
        this.boxRepository = boxRepository;
        this.boxMapper = boxMapper;
        this.patioRepository = patioRepository;
        this.veiculoRepository = veiculoRepository;
        this.veiculoBoxRepository = veiculoBoxRepository;
    }

    // LISTAR E BUSCAR
    @Transactional(readOnly = true)
    @Cacheable("boxesList")
    public Page<Box> listarTodosBoxes(Pageable pageable) {
        return boxRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "boxPorId", key = "#id")
    public Box buscarBoxPorId(Long id) {
        return boxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Box", id));
    }

    @Transactional(readOnly = true)
    public Page<Box> buscarBoxesPorFiltro(BoxFilter filter, Pageable pageable) {
        return boxRepository.findAll(BoxSpecification.withFilters(filter), pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "boxesDoPatio", key = "#patioId")
    public Set<Box> getBoxesByPatioId(Long patioId) {
        Patio patio = patioRepository.findByIdPatio(patioId)
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", patioId));
        return patio.getBoxes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "boxesDisponiveis", key = "#patioId")
    public Set<Box> getBoxesDisponiveisByPatioId(Long patioId) {
        Patio patio = patioRepository.findByIdPatio(patioId)
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", patioId));
        return patio.getBoxes().stream()
                .filter(Box::isDisponivel)
                .collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "boxesOcupados", key = "#patioId")
    public Set<Box> getBoxesOcupadosByPatioId(Long patioId) {
        Patio patio = patioRepository.findByIdPatio(patioId)
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", patioId));
        return patio.getBoxes().stream()
                .filter(Box::isOcupado)
                .collect(Collectors.toSet());
    }

    // CRUD OPERATIONS
    @Transactional
    @CacheEvict(value = {"boxesList", "boxPorId", "boxesDoPatio", "boxesDisponiveis", "boxesOcupados"}, allEntries = true)
    public Box criarBox(BoxRequestDto dto) {
        String nome = dto.getNome();
        Long patioId = dto.getPatioId();
        
        if (patioId == null) {
            throw new IllegalArgumentException("ID do Pátio é obrigatório");
        }

        // Verifica se o pátio existe
        Patio patio = patioRepository.findByIdPatio(patioId)
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", patioId));

        // Verifica se já existe box com mesmo nome no mesmo pátio
        if (boxRepository.existsByNomeIgnoreCaseAndPatioIdPatio(nome, patioId)) {
            String mensagem = String.format("Box com nome '%s' já existe no pátio '%s'. Por favor, remova o box existente ou escolha um nome diferente.", nome, patio.getNomePatio());
            throw new DuplicatedResourceException(mensagem);
        }

        // Mapeia a entidade Box
        Box box = boxMapper.toEntity(dto);
        box.setPatio(patio);
        box.setStatus("D"); // Disponível por padrão

        log.info("Criando box: Nome={}, Pátio={}", nome, patio.getNomePatio());
        return boxRepository.save(box);
    }

    @Transactional
    @CachePut(value = "boxPorId", key = "#id")
    @CacheEvict(value = {"boxesList", "boxesDoPatio", "boxesDisponiveis", "boxesOcupados"}, allEntries = true)
    public Box atualizarBox(Long id, BoxRequestDto dto) {
        Box boxExistente = buscarBoxPorId(id);

        // Validação de nome
        String novoNome = dto.getNome();
        if (novoNome == null || novoNome.isBlank()) {
            throw new InvalidInputException("O nome do box não pode ser vazio.");
        }
        
        if (!novoNome.equalsIgnoreCase(boxExistente.getNome())) {
            // Verifica se existe outro box com o mesmo nome no mesmo pátio
            Optional<Box> boxExistenteComMesmoNome = boxRepository.findByPatioIdAndNome(boxExistente.getPatio().getIdPatio(), novoNome);
            if (boxExistenteComMesmoNome.isPresent() && !boxExistenteComMesmoNome.get().getIdBox().equals(id)) {
                throw new DuplicatedResourceException("Box", "nome", novoNome);
            }
        }

        // Validação de datas
        if (dto.getDataEntrada() != null && dto.getDataSaida() != null) {
            if (dto.getDataSaida().isBefore(dto.getDataEntrada())) {
                throw new InvalidInputException("A data de saída não pode ser anterior à data de entrada.");
            }
        }

        // Validação de status
        String novoStatus = dto.getStatus();
        if (novoStatus != null && !novoStatus.equals("L") && !novoStatus.equals("O") && !novoStatus.equals("M")) {
            throw new InvalidInputException(String.format("Status inválido: '%s'. Os valores permitidos são: L (Livre), O (Ocupado), M (Manutenção).", novoStatus));
        }

        // Atualiza os dados básicos do box
        boxMapper.partialUpdate(dto, boxExistente);

        // Atualiza pátio se fornecido
        if (dto.getPatioId() != null && !dto.getPatioId().equals(boxExistente.getPatio().getIdPatio())) {
            Patio novoPatio = patioRepository.findByIdPatio(dto.getPatioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pátio", dto.getPatioId()));
            boxExistente.setPatio(novoPatio);
        }

        return boxRepository.save(boxExistente);
    }

    @Transactional
    @CacheEvict(value = {"boxPorId", "boxesList", "boxesDoPatio", "boxesDisponiveis", "boxesOcupados", "veiculosDoBox"}, allEntries = true)
    public void deletarBox(Long id) {
        Box box = buscarBoxPorId(id);
        
        // Verifica se é o último box do pátio
        long totalBoxesDoPatio = boxRepository.countByPatioIdPatio(box.getPatio().getIdPatio());
        if (totalBoxesDoPatio <= 1) {
            throw new OperationNotAllowedException(
                String.format(
                    "Não é possível excluir o box '%s' (ID: %d) pois ele é o único box do pátio '%s'. " +
                    "Um pátio deve ter pelo menos um box. Para remover este box, você deve primeiro adicionar outros boxes ao pátio.",
                    box.getNome(), box.getIdBox(), box.getPatio().getNomePatio()
                )
            );
        }
        
        // Verifica se o box está ocupado
        if (box.isOcupado()) {
            throw new ResourceInUseException(
                String.format("Box '%s' (ID: %d)", box.getNome(), box.getIdBox()),
                "Não é possível excluir um box que está ocupado. Libere o box antes de excluí-lo."
            );
        }
        
        // Verifica se há veículos associados ao box
        long quantidadeVeiculos = veiculoBoxRepository.countByBoxIdBox(id);
        if (quantidadeVeiculos > 0) {
            throw new ResourceInUseException(
                String.format("Box '%s' (ID: %d)", box.getNome(), box.getIdBox()),
                "veículos",
                quantidadeVeiculos
            );
        }
        
        log.info("Deletando box ID: {}, Nome: {}", box.getIdBox(), box.getNome());
        boxRepository.delete(box);
    }

    // MÉTODOS DE CONTROLE DE OCUPAÇÃO
    @Transactional
    @CacheEvict(value = {"boxPorId", "boxesDisponiveis", "boxesOcupados"}, key = "#id", allEntries = true)
    public Box ocuparBox(Long id) {
        Box box = buscarBoxPorId(id);
        if (box.isOcupado()) {
            throw new IllegalStateException("Box já está ocupado");
        }
        box.ocupar();
        log.info("Box {} ocupado às {}", box.getNome(), box.getDataEntrada());
        return boxRepository.save(box);
    }

    @Transactional
    @CacheEvict(value = {"boxPorId", "boxesDisponiveis", "boxesOcupados"}, key = "#id", allEntries = true)
    public Box liberarBox(Long id) {
        Box box = buscarBoxPorId(id);
        if (box.isDisponivel()) {
            throw new IllegalStateException("Box já está disponível");
        }
        box.liberar();
        log.info("Box {} liberado às {}", box.getNome(), box.getDataSaida());
        return boxRepository.save(box);
    }

    // MÉTODOS DE ASSOCIAÇÃO VeiculoBox
    @Transactional
    @CacheEvict(value = {"boxPorId", "veiculosDoBox"}, key = "#boxId", allEntries = true)
    public VeiculoBox associarBoxVeiculo(Long boxId, Long veiculoId) {
        Box box = buscarBoxPorId(boxId);
        Veiculo veiculo = veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", veiculoId));
        
        VeiculoBoxId idAssociacao = new VeiculoBoxId(veiculoId, boxId);
        if (veiculoBoxRepository.existsById(idAssociacao)) {
            throw new DuplicatedResourceException("Associação Box-Veículo", "IDs", idAssociacao.toString());
        }
        
        VeiculoBox associacao = new VeiculoBox(veiculo, box);
        return veiculoBoxRepository.save(associacao);
    }

    @Transactional
    @CacheEvict(value = {"boxPorId", "veiculosDoBox"}, key = "#boxId", allEntries = true)
    public void desassociarBoxVeiculo(Long boxId, Long veiculoId) {
        // Valida se o box existe
        buscarBoxPorId(boxId);
        
        VeiculoBoxId idAssociacao = new VeiculoBoxId(veiculoId, boxId);
        if (!veiculoBoxRepository.existsById(idAssociacao)) {
            throw new ResourceNotFoundException("Associação Box-Veículo", "IDs", idAssociacao.toString());
        }
        veiculoBoxRepository.deleteById(idAssociacao);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "veiculosDoBox", key = "#boxId")
    public Set<Veiculo> getVeiculosByBoxId(Long boxId) {
        Box box = buscarBoxPorId(boxId);
        return box.getVeiculoBoxes().stream()
                .map(VeiculoBox::getVeiculo)
                .collect(Collectors.toSet());
    }

    // MÉTODOS DE ESTATÍSTICAS
    @Transactional(readOnly = true)
    public Long contarBoxesPorPatio(Long patioId) {
        return boxRepository.countByPatioIdPatio(patioId);
    }

    @Transactional(readOnly = true)
    public Long contarBoxesDisponiveisPorPatio(Long patioId) {
        return boxRepository.countByPatioIdPatioAndStatus(patioId, "D");
    }

    @Transactional(readOnly = true)
    public Long contarBoxesOcupadosPorPatio(Long patioId) {
        return boxRepository.countByPatioIdPatioAndStatus(patioId, "O");
    }

    @Transactional(readOnly = true)
    public Long contarVeiculosPorBox(Long boxId) {
        return veiculoBoxRepository.countByBoxIdBox(boxId);
    }

    // MÉTODOS DE RELATÓRIO
    @Transactional(readOnly = true)
    public Double calcularTaxaOcupacaoPorPatio(Long patioId) {
        Long totalBoxes = contarBoxesPorPatio(patioId);
        if (totalBoxes == 0) return 0.0;
        
        Long boxesOcupados = contarBoxesOcupadosPorPatio(patioId);
        return (double) boxesOcupados / totalBoxes * 100;
    }

    @Transactional(readOnly = true)
    public Set<Box> getBoxesPorPeriodo(Long patioId, LocalDateTime inicio, LocalDateTime fim) {
        return boxRepository.findByPatioIdPatioAndDataEntradaBetween(patioId, inicio, fim);
    }

    /**
     * Encontra o próximo nome disponível para um box com base em um prefixo
     */
    @Transactional(readOnly = true)
    public String findProximoNomeDisponivel(String prefixo) {
        // Busca todos os boxes que contêm o prefixo
        List<Box> boxesComPrefixo = boxRepository.findByNomeContainingIgnoreCase(prefixo);
        
        if (boxesComPrefixo.isEmpty()) {
            return prefixo + "-001";
        }
        
        // Filtra apenas os que começam com o prefixo exato
        List<Box> boxesComPrefixoExato = boxesComPrefixo.stream()
                .filter(box -> box.getNome().toLowerCase().startsWith(prefixo.toLowerCase()))
                .collect(Collectors.toList());
        
        if (boxesComPrefixoExato.isEmpty()) {
            return prefixo + "-001";
        }
        
        // Extrai os números sequenciais e encontra o próximo
        int proximoNumero = boxesComPrefixoExato.stream()
                .mapToInt(box -> {
                    String nome = box.getNome();
                    String sufixo = nome.substring(prefixo.length());
                    if (sufixo.startsWith("-") && sufixo.length() > 1) {
                        try {
                            return Integer.parseInt(sufixo.substring(1));
                        } catch (NumberFormatException e) {
                            return 0;
                        }
                    }
                    return 0;
                })
                .max()
                .orElse(0) + 1;
        
        return String.format("%s-%03d", prefixo, proximoNumero);
    }

    /**
     * Cria múltiplos boxes em lote com nomes sequenciais
     */
    @Transactional
    @CacheEvict(value = {"boxesList", "boxesDoPatio", "boxesDisponiveis", "boxesOcupados"}, allEntries = true)
    public void criarBoxesEmLote(String prefixo, int quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("A quantidade deve ser maior que zero");
        }
        
        if (quantidade > 100) {
            throw new IllegalArgumentException("A quantidade máxima por lote é 100");
        }
        
        List<Box> boxesParaCriar = new ArrayList<>();
        
        for (int i = 0; i < quantidade; i++) {
            String nome = findProximoNomeDisponivel(prefixo);
            
            Box box = Box.builder()
                    .nome(nome)
                    .status("L") // Livre
                    .observacao("Box gerado em lote")
                    .build();
            
            boxesParaCriar.add(box);
        }
        
        boxRepository.saveAll(boxesParaCriar);
    }
}