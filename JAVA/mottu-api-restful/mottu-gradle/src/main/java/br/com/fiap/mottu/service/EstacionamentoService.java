package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.datatable.DataTableRequest;
import br.com.fiap.mottu.dto.datatable.DataTableResponse;
import br.com.fiap.mottu.dto.estacionamento.EstacionamentoRequestDto;
import br.com.fiap.mottu.dto.estacionamento.EstacionamentoResponseDto;
import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.filter.EstacionamentoFilter;
import br.com.fiap.mottu.mapper.EstacionamentoMapper;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Estacionamento;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Veiculo;
import br.com.fiap.mottu.repository.BoxRepository;
import br.com.fiap.mottu.repository.EstacionamentoRepository;
import br.com.fiap.mottu.repository.PatioRepository;
import br.com.fiap.mottu.repository.VeiculoRepository;
import br.com.fiap.mottu.service.ocr.PlateUtils;
import br.com.fiap.mottu.specification.EstacionamentoSpecification;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço para operações de Estacionamento
 * Gerencia estacionamentos usando a nova tabela TB_ESTACIONAMENTO
 */
@Service
@Slf4j
@Transactional(readOnly = true)
public class EstacionamentoService {

    private final EstacionamentoRepository estacionamentoRepository;
    private final EstacionamentoMapper estacionamentoMapper;
    private final VeiculoRepository veiculoRepository;
    private final BoxRepository boxRepository;
    private final PatioRepository patioRepository;
    private final LogMovimentacaoService logMovimentacaoService;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public EstacionamentoService(
            EstacionamentoRepository estacionamentoRepository,
            EstacionamentoMapper estacionamentoMapper,
            VeiculoRepository veiculoRepository,
            BoxRepository boxRepository,
            PatioRepository patioRepository,
            LogMovimentacaoService logMovimentacaoService,
            JdbcTemplate jdbcTemplate) {
        this.estacionamentoRepository = estacionamentoRepository;
        this.estacionamentoMapper = estacionamentoMapper;
        this.veiculoRepository = veiculoRepository;
        this.boxRepository = boxRepository;
        this.patioRepository = patioRepository;
        this.logMovimentacaoService = logMovimentacaoService;
        this.jdbcTemplate = jdbcTemplate;
    }

    // ================== LISTAR E BUSCAR ==================

    /**
     * Lista todos os estacionamentos com paginação
     */
    @Cacheable(value = "estacionamentos", key = "'page-' + #pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort")
    public Page<EstacionamentoResponseDto> listarTodos(Pageable pageable) {
        log.info("📋 Listando estacionamentos - página: {}, tamanho: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<Estacionamento> page = estacionamentoRepository.findAll(pageable);
        return estacionamentoMapper.toResponseDtoPage(page);
    }

    /**
     * Busca estacionamento por ID
     */
    @Cacheable(value = "estacionamentoPorId", key = "#id")
    public EstacionamentoResponseDto buscarPorId(Long id) {
        log.info("🔍 Buscando estacionamento com ID: {}", id);
        Estacionamento estacionamento = estacionamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estacionamento", id));
        return estacionamentoMapper.toResponseDto(estacionamento);
    }

    /**
     * Busca estacionamentos por filtros com paginação
     */
    public Page<EstacionamentoResponseDto> buscarPorFiltro(EstacionamentoFilter filter, Pageable pageable) {
        log.info("🔍 Buscando estacionamentos com filtro: {} e paginação: {}", filter, pageable);
        Specification<Estacionamento> spec = EstacionamentoSpecification.withFilters(filter);
        Page<Estacionamento> page = estacionamentoRepository.findAll(spec, pageable);
        return estacionamentoMapper.toResponseDtoPage(page);
    }

    /**
     * Busca estacionamentos ativos (veículos estacionados no momento)
     */
    @Cacheable(value = "estacionamentosAtivos", key = "'page-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<EstacionamentoResponseDto> listarAtivos(Pageable pageable) {
        log.info("📋 Listando estacionamentos ativos - página: {}, tamanho: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<Estacionamento> page = estacionamentoRepository.findByEstaEstacionadoTrue(pageable);
        return estacionamentoMapper.toResponseDtoPage(page);
    }

    /**
     * Lista todos os estacionamentos ativos (para SSE - Server-Sent Events)
     */
    @Cacheable(value = "estacionamentosAtivosSSE", key = "'todos'")
    public List<EstacionamentoResponseDto> listarTodosAtivos() {
        log.info("📋 Listando todos os estacionamentos ativos para SSE");
        List<Estacionamento> estacionamentos = estacionamentoRepository.findByEstaEstacionadoTrueOrderByDataUltimaAtualizacaoDesc();
        return estacionamentoMapper.toResponseDtoList(estacionamentos);
    }

    /**
     * Busca estacionamento ativo de um veículo por placa
     */
    @Cacheable(value = "estacionamentoPorPlaca", key = "#placa")
    public EstacionamentoResponseDto buscarAtivoPorPlaca(String placa) {
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            throw new InvalidInputException("Placa inválida.");
        }

        log.info("🔍 Buscando estacionamento ativo para placa: {}", normalized);
        
        // Buscar sem cache primeiro para garantir dados atualizados
        Estacionamento estacionamento = estacionamentoRepository.findByPlacaAndEstaEstacionadoTrue(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Estacionamento", "placa", normalized));

        return estacionamentoMapper.toResponseDto(estacionamento);
    }

    /**
     * Verifica se um veículo está estacionado
     */
    public boolean verificarSeVeiculoEstaEstacionado(String placa) {
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            return false;
        }
        return estacionamentoRepository.existsByPlacaAndEstaEstacionadoTrue(normalized);
    }

    /**
     * Busca estacionamentos ativos em um pátio
     */
    @Cacheable(value = "estacionamentosPorPatio", key = "#patioId")
    public List<EstacionamentoResponseDto> listarAtivosPorPatio(Long patioId) {
        log.info("📋 Listando estacionamentos ativos no pátio: {}", patioId);
        List<Estacionamento> estacionamentos = estacionamentoRepository
                .findByPatioIdPatioAndEstaEstacionadoTrueOrderByDataUltimaAtualizacaoDesc(patioId);
        return estacionamentoMapper.toResponseDtoList(estacionamentos);
    }

    /**
     * Histórico de estacionamentos de um veículo
     */
    public Page<EstacionamentoResponseDto> buscarHistoricoPorVeiculo(Long veiculoId, Pageable pageable) {
        log.info("📋 Buscando histórico de estacionamentos do veículo: {}", veiculoId);
        Page<Estacionamento> page = estacionamentoRepository.findByVeiculoIdVeiculoOrderByDataEntradaDesc(veiculoId, pageable);
        return estacionamentoMapper.toResponseDtoPage(page);
    }

    /**
     * Histórico de estacionamentos por placa
     */
    public Page<EstacionamentoResponseDto> buscarHistoricoPorPlaca(String placa, Pageable pageable) {
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            throw new InvalidInputException("Placa inválida.");
        }

        log.info("📋 Buscando histórico de estacionamentos da placa: {}", normalized);
        Page<Estacionamento> page = estacionamentoRepository.findByPlacaOrderByDataEntradaDesc(normalized, pageable);
        return estacionamentoMapper.toResponseDtoPage(page);
    }

    // ================== CRUD OPERATIONS ==================

    /**
     * Estaciona um veículo (cria novo estacionamento)
     * @param placa Placa do veículo
     * @param preferidoBoxId ID do box preferido (opcional)
     * @param preferidoPatioId ID do pátio preferido para busca automática (opcional, usado apenas se preferidoBoxId for null)
     * @param observacoes Observações do estacionamento
     */
    @Transactional
    @CacheEvict(value = {
            "estacionamentos", "estacionamentosAtivos", "estacionamentosAtivosSSE",
            "estacionamentoPorPlaca", "estacionamentosPorPatio"
    }, allEntries = true)
    public EstacionamentoResponseDto estacionarVeiculo(String placa, Long preferidoBoxId, Long preferidoPatioId, String observacoes) {
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            throw new InvalidInputException("Placa inválida.");
        }

        log.info("🚗 Estacionando veículo com placa: {}, box preferido: {}", normalized, preferidoBoxId);

        // Busca o veículo
        Veiculo veiculo = veiculoRepository.findByPlacaIgnoreCase(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", "placa", normalized));

        // CRÍTICO: Verificar e corrigir múltiplos estacionamentos ativos para o mesmo veículo
        // Isso pode acontecer por bugs anteriores ou problemas de concorrência
        List<Estacionamento> estacionamentosAtivosDuplicados = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculo.getIdVeiculo());
        
        if (!estacionamentosAtivosDuplicados.isEmpty()) {
            log.warn("⚠️ Encontrados {} estacionamento(s) ativo(s) duplicado(s) para o veículo {} (placa: {})", 
                    estacionamentosAtivosDuplicados.size(), veiculo.getIdVeiculo(), normalized);
            
            // CRÍTICO: Coletar IDs ANTES de fazer flush/clear
            List<Long> estacionamentoIdsDuplicados = new java.util.ArrayList<>();
            List<Long> boxIdsDuplicados = new java.util.ArrayList<>();
            
            for (Estacionamento estacionamentoDuplicado : estacionamentosAtivosDuplicados) {
                estacionamentoIdsDuplicados.add(estacionamentoDuplicado.getIdEstacionamento());
                boxIdsDuplicados.add(estacionamentoDuplicado.getBox().getIdBox());
                log.warn("🔄 Estacionamento duplicado encontrado: box {} (ID: {}), estacionamento ID: {}", 
                        estacionamentoDuplicado.getBox().getNome(), 
                        estacionamentoDuplicado.getBox().getIdBox(), 
                        estacionamentoDuplicado.getIdEstacionamento());
            }
            
            // Liberar TODOS os estacionamentos duplicados usando JdbcTemplate para garantir commit imediato
            for (int i = 0; i < estacionamentoIdsDuplicados.size(); i++) {
                Long estacionamentoIdDuplicado = estacionamentoIdsDuplicados.get(i);
                Long boxIdDuplicado = boxIdsDuplicados.get(i);
                
                // Liberar estacionamento usando JdbcTemplate
                int rowsUpdated = jdbcTemplate.update(
                        "UPDATE TB_ESTACIONAMENTO SET ESTA_ESTACIONADO = 0, DATA_SAIDA = CURRENT_TIMESTAMP, DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP " +
                        "WHERE ID_ESTACIONAMENTO = ? AND ESTA_ESTACIONADO = 1",
                        estacionamentoIdDuplicado
                );
                
                log.info("📝 UPDATE TB_ESTACIONAMENTO (duplicado): {} linhas atualizadas para ID {}", rowsUpdated, estacionamentoIdDuplicado);
                
                // Liberar o box também usando JdbcTemplate
                int boxRowsUpdated = jdbcTemplate.update(
                        "UPDATE TB_BOX SET STATUS = 'L', DATA_SAIDA = CURRENT_TIMESTAMP WHERE ID_BOX = ?",
                        boxIdDuplicado
                );
                
                log.info("📝 UPDATE TB_BOX (duplicado): {} linhas atualizadas para box ID {}", boxRowsUpdated, boxIdDuplicado);
            }
            
            log.info("✅ {} estacionamento(s) duplicado(s) liberado(s) para o veículo {}", 
                    estacionamentosAtivosDuplicados.size(), normalized);
        }

        // Busca ou seleciona box
        Box box;
        if (preferidoBoxId != null) {
            box = boxRepository.findById(preferidoBoxId)
                    .orElseThrow(() -> new ResourceNotFoundException("Box", preferidoBoxId));
            
            if (!box.isDisponivel()) {
                throw new InvalidInputException("Box " + box.getNome() + " não está disponível.");
            }

            // Verifica se box já está ocupado (via TB_ESTACIONAMENTO)
            if (estacionamentoRepository.existsByBoxIdBoxAndEstaEstacionadoTrue(preferidoBoxId)) {
                throw new InvalidInputException("Box " + box.getNome() + " já está ocupado por outro veículo.");
            }
        } else {
            // Busca primeiro box disponível
            List<Box> boxesLivres;
            
            // Se preferidoPatioId foi informado, buscar apenas boxes desse pátio
            if (preferidoPatioId != null) {
                log.info("🔍 Buscando vagas livres no pátio {}", preferidoPatioId);
                boxesLivres = boxRepository.findByPatioIdPatioAndStatus(preferidoPatioId, "L");
            } else {
                // Se não foi informado pátio, buscar em todos os pátios (comportamento antigo)
                log.warn("⚠️ Buscando vagas livres em TODOS os pátios (nenhum pátio foi especificado)");
                boxesLivres = boxRepository.findByStatus("L");
            }
            
            if (boxesLivres.isEmpty()) {
                String mensagem = preferidoPatioId != null 
                    ? String.format("Nenhuma vaga livre encontrada no pátio %d.", preferidoPatioId)
                    : "Nenhuma vaga livre encontrada.";
                throw new ResourceNotFoundException(mensagem);
            }

            // Filtra boxes que não estão ocupados em TB_ESTACIONAMENTO
            box = boxesLivres.stream()
                    .filter(b -> !estacionamentoRepository.existsByBoxIdBoxAndEstaEstacionadoTrue(b.getIdBox()))
                    .findFirst()
                    .orElseThrow(() -> {
                        String mensagem = preferidoPatioId != null 
                            ? String.format("Nenhuma vaga realmente livre encontrada no pátio %d (todas estão ocupadas em TB_ESTACIONAMENTO).", preferidoPatioId)
                            : "Nenhuma vaga realmente livre encontrada (todas estão ocupadas em TB_ESTACIONAMENTO).";
                        return new ResourceNotFoundException(mensagem);
                    });
            
            log.info("✅ Box selecionado automaticamente: {} (ID: {}) no pátio {}", box.getNome(), box.getIdBox(), preferidoPatioId);
        }

        // CRÍTICO: No novo sistema com TB_ESTACIONAMENTO, o status de ocupação é gerenciado pela tabela
        // O Box.status ainda é atualizado para compatibilidade com código legado, mas não é crítico
        // SOLUÇÃO: Obter o ID do Patio e Box ANTES de fazer qualquer operação que possa carregar coleções lazy
        Long boxId = box.getIdBox();
        
        // CRÍTICO: Obter o patioId usando query nativa para evitar carregar o Patio na sessão
        // Isso evita problemas com orphanRemoval quando fazemos flush/clear depois
        Long patioId;
        try {
            Object patioIdResult = entityManager.createNativeQuery(
                    "SELECT TB_PATIO_ID_PATIO FROM TB_BOX WHERE ID_BOX = :boxId"
            )
            .setParameter("boxId", boxId)
            .getSingleResult();
            
            if (patioIdResult == null) {
                throw new ResourceNotFoundException("Pátio do box não encontrado.");
            }
            patioId = ((Number) patioIdResult).longValue();
        } catch (Exception e) {
            log.error("Erro ao buscar patioId do box {}: {}", boxId, e.getMessage());
            throw new ResourceNotFoundException("Pátio do box não encontrado.");
        }
        
        // CRÍTICO: Fazer flush e clear da sessão ANTES de criar novas entidades
        // Isso remove todas as entidades gerenciadas da sessão, evitando conflitos de referência
        entityManager.flush();
        entityManager.clear();
        
        // Recarregar apenas as entidades necessárias usando referências proxy
        Veiculo veiculoProxy = entityManager.getReference(Veiculo.class, veiculo.getIdVeiculo());
        Box boxProxy = entityManager.getReference(Box.class, boxId);
        Patio patioReference = entityManager.getReference(Patio.class, patioId);
        
        // IMPORTANTE: Atualizar Box usando query nativa para evitar conflitos de referência
        // Isso não carrega o objeto Patio na sessão, evitando o erro de orphanRemoval
        entityManager.createNativeQuery(
                "UPDATE TB_BOX SET STATUS = 'O', DATA_ENTRADA = CURRENT_TIMESTAMP, DATA_SAIDA = NULL WHERE ID_BOX = :boxId"
        )
        .setParameter("boxId", boxId)
        .executeUpdate();

        // Cria o estacionamento usando apenas referências proxy (sem carregar objetos completos)
        // Isso garante que não estamos modificando ou inicializando coleções lazy
        Estacionamento estacionamento = Estacionamento.builder()
                .veiculo(veiculoProxy)
                .box(boxProxy)
                .patio(patioReference) // Usar referência proxy para evitar inicialização de coleções
                .estaEstacionado(true)
                .dataEntrada(LocalDateTime.now())
                .dataSaida(null)
                .dataUltimaAtualizacao(LocalDateTime.now())
                .observacoes(observacoes)
                .build();

        // Salvar o estacionamento usando apenas referências proxy
        Estacionamento estacionamentoSalvo = estacionamentoRepository.save(estacionamento);

        // Registra log de movimentação usando o patioId diretamente (evita box.getPatio())
        logMovimentacaoService.registrarEntrada(veiculoProxy, boxProxy, patioId);

        // CRÍTICO: Não buscar o Box ou Patio após o clear() para evitar carregar coleções orphanRemoval
        // Ao invés disso, buscar apenas os dados necessários usando queries nativas
        String boxNome = null;
        String patioNome = null;
        String patioStatus = null;
        try {
            // Buscar nome do box usando query nativa (não carrega Patio)
            Object boxNomeResult = entityManager.createNativeQuery(
                    "SELECT NOME FROM TB_BOX WHERE ID_BOX = :boxId"
            )
            .setParameter("boxId", boxId)
            .getSingleResult();
            boxNome = boxNomeResult != null ? boxNomeResult.toString() : "Box " + boxId;
            
            // Buscar nome e status do pátio usando query nativa (não carrega coleções)
            Object[] patioInfo = (Object[]) entityManager.createNativeQuery(
                    "SELECT NOME_PATIO, STATUS FROM TB_PATIO WHERE ID_PATIO = :patioId"
            )
            .setParameter("patioId", patioId)
            .getSingleResult();
            if (patioInfo != null && patioInfo.length >= 2) {
                patioNome = patioInfo[0] != null ? patioInfo[0].toString() : "Pátio " + patioId;
                patioStatus = patioInfo[1] != null ? patioInfo[1].toString() : "A";
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar nomes do box/pátio via query nativa: {}", e.getMessage());
            boxNome = "Box " + boxId;
            patioNome = "Pátio " + patioId;
        }
        
        log.info("✅ Veículo {} estacionado no box {} (pátio ID: {})", normalized, boxNome, patioId);
        
        // Construir DTO manualmente usando dados já disponíveis (evita carregar entidades após clear)
        // Isso evita completamente o problema de orphanRemoval
        EstacionamentoResponseDto.VeiculoInfo veiculoInfo = EstacionamentoResponseDto.VeiculoInfo.builder()
                .idVeiculo(veiculo.getIdVeiculo())
                .placa(normalized)
                .modelo(veiculo.getModelo())
                .fabricante(veiculo.getFabricante())
                .tagBleId(veiculo.getTagBleId())
                .status(veiculo.getStatus())
                .build();
        
        EstacionamentoResponseDto.BoxInfo boxInfo = EstacionamentoResponseDto.BoxInfo.builder()
                .idBox(boxId)
                .nome(boxNome)
                .status("O") // Box foi ocupado
                .dataEntrada(LocalDateTime.now())
                .dataSaida(null)
                .build();
        
        EstacionamentoResponseDto.PatioInfo patioInfoDto = EstacionamentoResponseDto.PatioInfo.builder()
                .idPatio(patioId)
                .nomePatio(patioNome != null ? patioNome : "Pátio " + patioId)
                .status(patioStatus != null ? patioStatus : "A")
                .build();
        
        EstacionamentoResponseDto responseDto = EstacionamentoResponseDto.builder()
                .idEstacionamento(estacionamentoSalvo.getIdEstacionamento())
                .veiculo(veiculoInfo)
                .box(boxInfo)
                .patio(patioInfoDto)
                .estaEstacionado(true)
                .dataEntrada(estacionamentoSalvo.getDataEntrada())
                .dataSaida(null)
                .dataUltimaAtualizacao(estacionamentoSalvo.getDataUltimaAtualizacao())
                .observacoes(observacoes)
                .tempoEstacionadoMinutos(0L) // Ainda não tem tempo estacionado
                .build();
        
        return responseDto;
    }

    /**
     * Libera um box específico (desativa estacionamento do box)
     * CRÍTICO: Libera apenas o box especificado, não todos os estacionamentos da placa
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @CacheEvict(value = {
            "estacionamentos", "estacionamentosAtivos", "estacionamentosAtivosSSE",
            "estacionamentoPorPlaca", "estacionamentosPorPatio"
    }, allEntries = true)
    public EstacionamentoResponseDto liberarPorBoxId(Long boxId, String observacoes) {
        log.info("🔓 Liberando box ID: {}", boxId);
        
        // Buscar estacionamento ativo do box específico
        Estacionamento estacionamento = estacionamentoRepository
                .findByBoxIdBoxAndEstaEstacionadoTrue(boxId)
                .orElseThrow(() -> new ResourceNotFoundException("Estacionamento", "boxId", boxId.toString()));
        
        Long estacionamentoId = estacionamento.getIdEstacionamento();
        Long veiculoId = estacionamento.getVeiculo().getIdVeiculo();
        Long patioId = estacionamento.getPatio().getIdPatio();
        LocalDateTime dataEntrada = estacionamento.getDataEntrada();
        
        // Calcular tempo de estacionamento antes de desativar
        Long tempoMinutos = null;
        if (dataEntrada != null) {
            tempoMinutos = java.time.Duration.between(dataEntrada, LocalDateTime.now()).toMinutes();
        }
        
        log.info("🔄 Liberando estacionamento ID: {} no box ID: {}", estacionamentoId, boxId);
        
        // CRÍTICO: Liberar apenas este box específico usando JdbcTemplate
        int rowsUpdated = jdbcTemplate.update(
                "UPDATE TB_ESTACIONAMENTO SET ESTA_ESTACIONADO = 0, DATA_SAIDA = CURRENT_TIMESTAMP, DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP " +
                "WHERE ID_ESTACIONAMENTO = ? AND ESTA_ESTACIONADO = 1",
                estacionamentoId
        );
        
        log.info("📝 UPDATE TB_ESTACIONAMENTO (via JdbcTemplate) executado: {} linhas atualizadas para ID {}", rowsUpdated, estacionamentoId);
        
        if (rowsUpdated == 0) {
            log.warn("⚠️ Nenhuma linha atualizada. Tentando UPDATE direto por ID...");
            rowsUpdated = jdbcTemplate.update(
                    "UPDATE TB_ESTACIONAMENTO SET ESTA_ESTACIONADO = 0, DATA_SAIDA = CURRENT_TIMESTAMP, DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP " +
                    "WHERE ID_ESTACIONAMENTO = ?",
                    estacionamentoId
            );
            log.info("🔧 UPDATE direto executado: {} linhas atualizadas", rowsUpdated);
        }
        
        // Libera o box usando JdbcTemplate
        int boxRowsUpdated = jdbcTemplate.update(
                "UPDATE TB_BOX SET STATUS = 'L', DATA_SAIDA = CURRENT_TIMESTAMP WHERE ID_BOX = ?",
                boxId
        );
        
        log.info("📝 UPDATE TB_BOX (via JdbcTemplate) executado: {} linhas atualizadas para box ID {}", boxRowsUpdated, boxId);
        
        // Registra log de movimentação usando referências proxy
        Veiculo veiculoProxy = entityManager.getReference(Veiculo.class, veiculoId);
        Box boxProxy = entityManager.getReference(Box.class, boxId);
        logMovimentacaoService.registrarSaida(veiculoProxy, boxProxy, patioId);
        
        // Buscar o estacionamento atualizado para retornar
        Estacionamento estacionamentoAtualizado = estacionamentoRepository.findById(estacionamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Estacionamento", estacionamentoId));
        
        log.info("✅ Box {} liberado com sucesso após {} minutos", boxId, tempoMinutos != null ? tempoMinutos : "N/A");
        
        return estacionamentoMapper.toResponseDto(estacionamentoAtualizado);
    }

    /**
     * Libera um veículo (desativa estacionamento)
     * ATENÇÃO: Este método libera TODOS os estacionamentos ativos do veículo!
     * Use liberarPorBoxId() se quiser liberar apenas um box específico.
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @CacheEvict(value = {
            "estacionamentos", "estacionamentosAtivos", "estacionamentosAtivosSSE",
            "estacionamentoPorPlaca", "estacionamentosPorPatio"
    }, allEntries = true)
    public EstacionamentoResponseDto liberarVeiculo(String placa, String observacoes) {
        String normalized = PlateUtils.normalizeMercosul(placa);
        if (normalized.isEmpty()) {
            throw new InvalidInputException("Placa inválida.");
        }

        log.info("🚗 Liberando veículo com placa: {}", normalized);

        // Busca o veículo primeiro para obter o ID
        Veiculo veiculo = veiculoRepository.findByPlacaIgnoreCase(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", "placa", normalized));
        
        Long veiculoId = veiculo.getIdVeiculo();

        // CRÍTICO: Buscar TODOS os estacionamentos ativos (pode haver múltiplos por bug anterior)
        List<Estacionamento> estacionamentosAtivos = estacionamentoRepository
                .findAllByVeiculoIdVeiculoAndEstaEstacionadoTrue(veiculoId);
        
        if (estacionamentosAtivos.isEmpty()) {
            throw new ResourceNotFoundException("Veículo", "placa", normalized);
        }
        
        log.info("🔍 Encontrados {} estacionamento(s) ativo(s) para a placa {}", estacionamentosAtivos.size(), normalized);
        
        // Obter informações do primeiro estacionamento para logs e retorno
        Estacionamento primeiroEstacionamento = estacionamentosAtivos.get(0);
        Long primeiroBoxId = primeiroEstacionamento.getBox().getIdBox();
        LocalDateTime dataEntrada = primeiroEstacionamento.getDataEntrada();
        
        // Calcular tempo de estacionamento antes de desativar
        Long tempoMinutos = null;
        if (dataEntrada != null) {
            tempoMinutos = java.time.Duration.between(dataEntrada, LocalDateTime.now()).toMinutes();
        }
        
        // CRÍTICO: Obter TODOS os IDs ANTES de fazer flush/clear
        // Isso garante que temos os dados necessários antes de limpar a sessão
        List<Long> estacionamentoIds = new java.util.ArrayList<>();
        List<Long> boxIds = new java.util.ArrayList<>();
        List<Long> patioIds = new java.util.ArrayList<>();
        
        for (Estacionamento estacionamento : estacionamentosAtivos) {
            estacionamentoIds.add(estacionamento.getIdEstacionamento());
            boxIds.add(estacionamento.getBox().getIdBox());
            patioIds.add(estacionamento.getPatio().getIdPatio());
        }
        
        // CRÍTICO: Fazer flush e clear da sessão ANTES de atualizar
        // Isso remove todas as entidades gerenciadas da sessão, evitando conflitos de referência
        entityManager.flush();
        entityManager.clear();
        
        // Liberar TODOS os estacionamentos ativos usando os IDs coletados
        int totalLiberados = 0;
        for (int i = 0; i < estacionamentoIds.size(); i++) {
            Long estacionamentoId = estacionamentoIds.get(i);
            Long boxId = boxIds.get(i);
            Long patioId = patioIds.get(i);
            
            log.info("🔄 Liberando estacionamento ID: {} no box ID: {}", estacionamentoId, boxId);
            
            // CRÍTICO: Usar JdbcTemplate para garantir commit imediato
            // Primeiro tentar UPDATE com WHERE ESTA_ESTACIONADO = 1
            int rowsUpdated = jdbcTemplate.update(
                    "UPDATE TB_ESTACIONAMENTO SET ESTA_ESTACIONADO = 0, DATA_SAIDA = CURRENT_TIMESTAMP, DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP " +
                    "WHERE ID_ESTACIONAMENTO = ? AND ESTA_ESTACIONADO = 1",
                    estacionamentoId
            );
            
            log.info("📝 UPDATE TB_ESTACIONAMENTO (via JdbcTemplate) executado: {} linhas atualizadas para ID {}", rowsUpdated, estacionamentoId);
            
            // Se não atualizou nenhuma linha, tentar sem a condição ESTA_ESTACIONADO = 1 (pode estar em estado inconsistente)
            if (rowsUpdated == 0) {
                log.warn("⚠️ Nenhuma linha atualizada com WHERE ESTA_ESTACIONADO = 1. Tentando UPDATE direto por ID...");
                
                // Verificar o estado atual no banco
                try {
                    Integer estadoAtual = jdbcTemplate.queryForObject(
                            "SELECT ESTA_ESTACIONADO FROM TB_ESTACIONAMENTO WHERE ID_ESTACIONAMENTO = ?",
                            Integer.class,
                            estacionamentoId
                    );
                    log.warn("🔍 Estado atual do estacionamento ID {} no banco: ESTA_ESTACIONADO = {}", estacionamentoId, estadoAtual);
                    
                    // Tentar UPDATE direto por ID sem verificar ESTA_ESTACIONADO
                    int rowsUpdatedDireto = jdbcTemplate.update(
                            "UPDATE TB_ESTACIONAMENTO SET ESTA_ESTACIONADO = 0, DATA_SAIDA = CURRENT_TIMESTAMP, DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP " +
                            "WHERE ID_ESTACIONAMENTO = ?",
                            estacionamentoId
                    );
                    
                    log.info("🔧 UPDATE direto (via JdbcTemplate) executado: {} linhas atualizadas para ID {}", rowsUpdatedDireto, estacionamentoId);
                    rowsUpdated = rowsUpdatedDireto; // Atualizar contador
                } catch (Exception e) {
                    log.error("❌ Erro ao verificar/atualizar estado do estacionamento: {}", e.getMessage());
                }
            }

            // Libera o box usando JdbcTemplate para garantir commit imediato
            int boxRowsUpdated = jdbcTemplate.update(
                    "UPDATE TB_BOX SET STATUS = 'L', DATA_SAIDA = CURRENT_TIMESTAMP WHERE ID_BOX = ?",
                    boxId
            );
            
            log.info("📝 UPDATE TB_BOX (via JdbcTemplate) executado: {} linhas atualizadas para box ID {}", boxRowsUpdated, boxId);
            
            if (boxRowsUpdated == 0) {
                log.warn("⚠️ Nenhuma linha atualizada para box ID: {}", boxId);
            }

            // Registra log de movimentação usando apenas IDs e referências proxy
            Veiculo veiculoProxy = entityManager.getReference(Veiculo.class, veiculoId);
            Box boxProxy = entityManager.getReference(Box.class, boxId);
            logMovimentacaoService.registrarSaida(veiculoProxy, boxProxy, patioId);
            
            totalLiberados++;
        }
        
        log.info("💾 {} estacionamento(s) marcado(s) como liberado(s) (via JdbcTemplate - commit automático)", totalLiberados);
        
        // CRÍTICO: Verificar se realmente foram liberados usando JdbcTemplate
        // Fazer um pequeno delay para garantir que o banco processou
        try {
            Thread.sleep(100); // Pequeno delay para garantir que o banco processou
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        Long estacionamentosAindaAtivos = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                Long.class,
                veiculoId
        );
        
        if (estacionamentosAindaAtivos == null) {
            estacionamentosAindaAtivos = 0L;
        }
        
        log.info("🔍 Verificação pós-liberação: {} estacionamento(s) ainda ativo(s) para veículo {}", 
                estacionamentosAindaAtivos, normalized);
        
        if (estacionamentosAindaAtivos > 0) {
            log.error("❌ ERRO CRÍTICO: Ainda há {} estacionamento(s) ativo(s) após liberação! Possível problema de transação ou commit.", 
                    estacionamentosAindaAtivos);
            
            // Tentar liberar novamente usando UPDATE direto sem WHERE ESTA_ESTACIONADO = 1 (via JdbcTemplate)
            log.warn("🔄 Tentando liberação forçada (sem verificação de ESTA_ESTACIONADO = 1)...");
            int rowsForcadas = jdbcTemplate.update(
                    "UPDATE TB_ESTACIONAMENTO SET ESTA_ESTACIONADO = 0, DATA_SAIDA = CURRENT_TIMESTAMP, DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP " +
                    "WHERE TB_VEICULO_ID_VEICULO = ? AND ESTA_ESTACIONADO = 1",
                    veiculoId
            );
            
            log.info("🔧 Liberação forçada (via JdbcTemplate) executada: {} linhas atualizadas", rowsForcadas);
        }
        
        // Buscar o estacionamento atualizado para retornar (usando paginação)
        Page<Estacionamento> estacionamentosPage = estacionamentoRepository.findByPlacaOrderByDataEntradaDesc(
                normalized, PageRequest.of(0, 1));
        Estacionamento estacionamentoAtualizado = estacionamentosPage.getContent().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Estacionamento", "placa", normalized));

        // Buscar box para log usando query nativa
        String boxNome = null;
        try {
            Object boxNomeResult = entityManager.createNativeQuery(
                    "SELECT NOME FROM TB_BOX WHERE ID_BOX = :boxId"
            )
            .setParameter("boxId", primeiroBoxId)
            .getSingleResult();
            boxNome = boxNomeResult != null ? boxNomeResult.toString() : "Box " + primeiroBoxId;
        } catch (Exception e) {
            log.warn("Erro ao buscar nome do box: {}", e.getMessage());
            boxNome = "Box " + primeiroBoxId;
        }
        
        log.info("✅ Veículo {} liberado do box {} após {} minutos", 
                normalized, boxNome, tempoMinutos != null ? tempoMinutos : "N/A");

        return estacionamentoMapper.toResponseDto(estacionamentoAtualizado);
    }

    /**
     * Cria um estacionamento (método genérico)
     */
    @Transactional
    @CacheEvict(value = {
            "estacionamentos", "estacionamentosAtivos", "estacionamentosAtivosSSE",
            "estacionamentoPorPlaca", "estacionamentosPorPatio"
    }, allEntries = true)
    public EstacionamentoResponseDto criar(EstacionamentoRequestDto dto) {
        log.info("➕ Criando estacionamento: {}", dto);

        // Validações
        Veiculo veiculo = veiculoRepository.findById(dto.getVeiculoId())
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", dto.getVeiculoId()));

        Box box = boxRepository.findById(dto.getBoxId())
                .orElseThrow(() -> new ResourceNotFoundException("Box", dto.getBoxId()));

        Patio patio = patioRepository.findByIdPatio(dto.getPatioId())
                .orElseThrow(() -> new ResourceNotFoundException("Pátio", dto.getPatioId()));

        // Verifica se veículo já está estacionado
        if (estacionamentoRepository.existsByVeiculoIdVeiculoAndEstaEstacionadoTrue(dto.getVeiculoId())) {
            throw new DuplicatedResourceException("Veículo", "ID", dto.getVeiculoId().toString());
        }

        // Verifica se box está disponível
        if (estacionamentoRepository.existsByBoxIdBoxAndEstaEstacionadoTrue(dto.getBoxId())) {
            throw new InvalidInputException("Box já está ocupado.");
        }

        // Cria estacionamento
        Estacionamento estacionamento = estacionamentoMapper.toEntity(dto);
        estacionamento.setVeiculo(veiculo);
        estacionamento.setBox(box);
        estacionamento.setPatio(patio);
        estacionamento.ativar();

        estacionamento = estacionamentoRepository.save(estacionamento);

        // Atualiza box
        box.ocupar();
        boxRepository.save(box);

        // Registra log - usar o patioId já obtido anteriormente
        logMovimentacaoService.registrarEntrada(veiculo, box, patio.getIdPatio());

        log.info("✅ Estacionamento criado com ID: {}", estacionamento.getIdEstacionamento());
        return estacionamentoMapper.toResponseDto(estacionamento);
    }

    /**
     * Atualiza um estacionamento
     */
    @Transactional
    @CachePut(value = "estacionamentoPorId", key = "#id")
    @CacheEvict(value = {
            "estacionamentos", "estacionamentosAtivos", "estacionamentosAtivosSSE",
            "estacionamentoPorPlaca", "estacionamentosPorPatio"
    }, allEntries = true)
    public EstacionamentoResponseDto atualizar(Long id, EstacionamentoRequestDto dto) {
        log.info("✏️ Atualizando estacionamento ID: {}", id);

        Estacionamento estacionamento = estacionamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estacionamento", id));

        // Atualiza campos básicos
        estacionamentoMapper.partialUpdate(dto, estacionamento);

        // Atualiza relacionamentos se fornecidos
        if (dto.getVeiculoId() != null && !dto.getVeiculoId().equals(estacionamento.getVeiculo().getIdVeiculo())) {
            Veiculo veiculo = veiculoRepository.findById(dto.getVeiculoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Veículo", dto.getVeiculoId()));
            estacionamento.setVeiculo(veiculo);
        }

        if (dto.getBoxId() != null && !dto.getBoxId().equals(estacionamento.getBox().getIdBox())) {
            Box box = boxRepository.findById(dto.getBoxId())
                    .orElseThrow(() -> new ResourceNotFoundException("Box", dto.getBoxId()));
            estacionamento.setBox(box);
        }

        if (dto.getPatioId() != null && !dto.getPatioId().equals(estacionamento.getPatio().getIdPatio())) {
            Patio patio = patioRepository.findByIdPatio(dto.getPatioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pátio", dto.getPatioId()));
            estacionamento.setPatio(patio);
        }

        estacionamento = estacionamentoRepository.save(estacionamento);

        log.info("✅ Estacionamento ID: {} atualizado", id);
        return estacionamentoMapper.toResponseDto(estacionamento);
    }

    /**
     * Deleta um estacionamento (soft delete - marca como inativo)
     */
    @Transactional
    @CacheEvict(value = {
            "estacionamentoPorId", "estacionamentos", "estacionamentosAtivos", 
            "estacionamentosAtivosSSE", "estacionamentoPorPlaca", "estacionamentosPorPatio"
    }, allEntries = true)
    public void deletar(Long id) {
        log.info("🗑️ Deletando estacionamento ID: {}", id);

        Estacionamento estacionamento = estacionamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estacionamento", id));

        // Se estiver ativo, libera primeiro
        if (estacionamento.isAtivo()) {
            Long boxId = estacionamento.getBox().getIdBox();
            Long veiculoId = estacionamento.getVeiculo().getIdVeiculo();
            Long patioId = estacionamento.getPatio().getIdPatio();
            
            estacionamento.desativar();
            
            // Libera o box usando query nativa
            entityManager.createNativeQuery(
                    "UPDATE TB_BOX SET STATUS = 'L', DATA_SAIDA = CURRENT_TIMESTAMP WHERE ID_BOX = :boxId"
            )
            .setParameter("boxId", boxId)
            .executeUpdate();
            
            // Registra log usando referências proxy
            Veiculo veiculoProxy = entityManager.getReference(Veiculo.class, veiculoId);
            Box boxProxy = entityManager.getReference(Box.class, boxId);
            logMovimentacaoService.registrarSaida(veiculoProxy, boxProxy, patioId);
        }

        estacionamentoRepository.delete(estacionamento);
        log.info("✅ Estacionamento ID: {} deletado", id);
    }

    // ================== DATATABLE SUPPORT ==================

    /**
     * Busca estacionamentos para DataTable
     */
    public DataTableResponse<EstacionamentoResponseDto> buscarParaDataTable(DataTableRequest request, EstacionamentoFilter filter) {
        long startTime = System.currentTimeMillis();
        log.info("📊 Buscando estacionamentos para DataTable - draw: {}, start: {}, length: {}", 
                request.getDraw(), request.getStart(), request.getLength());

        try {
            // Converte DataTableRequest para Pageable
            int page = request.getStart() / request.getLength();
            Sort sort = criarSortParaDataTable(request);
            Pageable pageable = PageRequest.of(page, request.getLength(), sort);

            // Aplica filtro de busca global se fornecido
            if (request.getSearchValue() != null && !request.getSearchValue().isBlank()) {
                filter = aplicarBuscaGlobal(filter, request.getSearchValue());
            }

            // Busca com filtros e paginação
            Specification<Estacionamento> spec = EstacionamentoSpecification.withFilters(filter);
            Page<Estacionamento> pageResult = estacionamentoRepository.findAll(spec, pageable);

            // Converte para DTOs
            List<EstacionamentoResponseDto> data = pageResult.getContent().stream()
                    .map(estacionamentoMapper::toResponseDto)
                    .collect(Collectors.toList());

            long processingTime = System.currentTimeMillis() - startTime;

            return DataTableResponse.<EstacionamentoResponseDto>builder()
                    .draw(request.getDraw())
                    .recordsTotal(pageResult.getTotalElements())
                    .recordsFiltered(pageResult.getTotalElements())
                    .data(data)
                    .processingTime(processingTime)
                    .build();

        } catch (Exception e) {
            log.error("❌ Erro ao buscar estacionamentos para DataTable", e);
            return DataTableResponse.error(request.getDraw(), 
                    "Erro ao buscar estacionamentos: " + e.getMessage());
        }
    }

    /**
     * Cria Sort baseado nos parâmetros do DataTable
     */
    private Sort criarSortParaDataTable(DataTableRequest request) {
        if (request.getOrderColumn() == null || request.getOrderDirection() == null) {
            return Sort.by(Sort.Direction.DESC, "dataUltimaAtualizacao");
        }

        String campo = obterCampoPorIndice(request.getOrderColumn());
        Sort.Direction direction = "desc".equalsIgnoreCase(request.getOrderDirection()) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;

        return Sort.by(direction, campo);
    }

    /**
     * Mapeia índice da coluna do DataTable para campo da entidade
     */
    private String obterCampoPorIndice(Integer indice) {
        return switch (indice) {
            case 0 -> "idEstacionamento";
            case 1 -> "veiculo.placa";
            case 2 -> "box.nome";
            case 3 -> "patio.nomePatio";
            case 4 -> "dataEntrada";
            case 5 -> "dataSaida";
            case 6 -> "estaEstacionado";
            default -> "dataUltimaAtualizacao";
        };
    }

    /**
     * Aplica busca global nos campos principais
     */
    private EstacionamentoFilter aplicarBuscaGlobal(EstacionamentoFilter filter, String searchValue) {
        // A busca global pode ser aplicada em placa, box nome ou patio nome
        // Por enquanto, vamos buscar por placa
        return new EstacionamentoFilter(
                filter.veiculoId(),
                searchValue, // placa
                filter.modelo(),
                filter.fabricante(),
                filter.boxId(),
                filter.boxNome(),
                filter.boxStatus(),
                filter.patioId(),
                filter.patioNome(),
                filter.estaEstacionado(),
                filter.dataEntradaInicio(),
                filter.dataEntradaFim(),
                filter.dataSaidaInicio(),
                filter.dataSaidaFim(),
                filter.observacoes(),
                filter.tempoMinimoMinutos(),
                filter.tempoMaximoMinutos()
        );
    }

    // ================== ESTATÍSTICAS ==================

    /**
     * Conta total de veículos estacionados
     */
    @Cacheable(value = "estatisticasEstacionamento", key = "'totalAtivos'")
    public long contarEstacionados() {
        return estacionamentoRepository.countByEstaEstacionadoTrue();
    }

    /**
     * Conta veículos estacionados em um pátio
     */
    @Cacheable(value = "estatisticasEstacionamento", key = "'totalAtivosPatio-' + #patioId")
    public long contarEstacionadosPorPatio(Long patioId) {
        return estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patioId);
    }
}
