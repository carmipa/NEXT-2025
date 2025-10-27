package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.mapglobal.MapGlobalPatioDto;
import br.com.fiap.mottu.repository.MapGlobalRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service para operações do mapa global
 */
@Service
@Slf4j
@Transactional(readOnly = true)
public class MapGlobalService {
    
    private final MapGlobalRepository mapGlobalRepository;
    
    @Autowired
    public MapGlobalService(MapGlobalRepository mapGlobalRepository) {
        this.mapGlobalRepository = mapGlobalRepository;
    }
    
    /**
     * Busca todos os pátios para o mapa global com cache
     */
    @Cacheable(value = "mapaGlobal", key = "'todos'")
    public List<MapGlobalPatioDto> buscarTodosPatios() {
        log.info("🗺️ MapGlobalService: Buscando todos os pátios para mapa global");
        
        List<MapGlobalPatioDto> patios = mapGlobalRepository.findAllPatiosParaMapa();
        log.info("📊 MapGlobalService: Encontrados {} pátios", patios.size());
        
        return patios;
    }
    
    /**
     * Busca pátios com paginação
     */
    @Cacheable(value = "mapaGlobal", key = "'pagina-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<MapGlobalPatioDto> buscarPatiosPaginados(Pageable pageable) {
        log.info("🗺️ MapGlobalService: Buscando pátios paginados - página {}, tamanho {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        return mapGlobalRepository.findAllPatiosParaMapaPaginado(pageable);
    }
    
    /**
     * Busca pátios por cidade
     */
    @Cacheable(value = "mapaGlobal", key = "'cidade-' + #cidade")
    public List<MapGlobalPatioDto> buscarPatiosPorCidade(String cidade) {
        log.info("🗺️ MapGlobalService: Buscando pátios na cidade: {}", cidade);
        
        List<MapGlobalPatioDto> patios = mapGlobalRepository.findPatiosPorCidade(cidade);
        log.info("📊 MapGlobalService: Encontrados {} pátios na cidade {}", patios.size(), cidade);
        
        return patios;
    }
    
    /**
     * Invalida cache do mapa global
     */
    @CacheEvict(value = "mapaGlobal", allEntries = true)
    public void invalidarCache() {
        log.info("🗑️ MapGlobalService: Invalidando cache do mapa global");
    }

    /**
     * Método para debug - retorna o repository
     */
    public MapGlobalRepository getPatioRepository() {
        return mapGlobalRepository;
    }
}
