package br.com.fiap.mottu.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de cache para a aplicação MOTTU
 * Define os caches utilizados pelos serviços para melhorar performance
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Configura o gerenciador de cache
     * Utiliza ConcurrentMapCacheManager para simplicidade
     * Em produção, considere usar Redis ou Hazelcast
     */
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        
        // Define os caches utilizados na aplicação
        cacheManager.setCacheNames(java.util.Arrays.asList(
                // Caches de listagem
                "clientesList",
                "patiosList", 
                "boxesList",
                "zonasList",
                "veiculosList",
                "enderecosList",
                "contatosList",
                "rastreamentosList",
                "cnhsList",
                "cnhs",
                
                // Caches de listagem completa (sem paginação)
                "enderecosListAll",
                "contatosListAll",
                
                // Caches por ID
                "clientePorId",
                "patioPorId",
                "boxPorId", 
                "zonaPorId",
                "veiculoPorId",
                "enderecoPorId",
                "contatoPorId",
                "rastreamentoPorId",
                "cnhPorId",
                
                // Caches de relacionamentos
                "veiculosDoCliente",
                "veiculosDoPatio",
                "boxesDoPatio",
                "zonasDoPatio",
                "contatosDoPatio",
                "enderecosDoPatio",
                "cnhDoCliente",
                "boxesDisponiveis",
                "boxesOcupados",
                "veiculosDoBox",
                "veiculosDaZona",
                
                // Caches de filtros
                "clientesFiltrados",
                "patiosFiltrados",
                "boxesFiltrados",
                "zonasFiltrados",
                "enderecosFiltrados",
                "contatosFiltrados",
                "cnhsFiltrados",
                
                // Caches específicos de veículos
                "veiculoLocalizacao",
                "veiculosEstacionados"
        ));
        
        return cacheManager;
    }
}
