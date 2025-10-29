package br.com.fiap.mottu.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import com.github.benmanes.caffeine.cache.Caffeine;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .expireAfterAccess(Duration.ofMinutes(5))
                .recordStats());
        return cacheManager;
    }

    /**
     * Cache para relatórios de ocupação
     */
    @Bean("ocupacaoCacheManager")
    public CacheManager ocupacaoCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("ocupacao");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(Duration.ofMinutes(5))
                .recordStats());
        return cacheManager;
    }

    /**
     * Cache para relatórios de movimentação
     */
    @Bean("movimentacaoCacheManager")
    public CacheManager movimentacaoCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("movimentacao");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(Duration.ofMinutes(3))
                .recordStats());
        return cacheManager;
    }

    /**
     * Cache para relatórios de performance
     */
    @Bean("performanceCacheManager")
    public CacheManager performanceCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("performance");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(50)
                .expireAfterWrite(Duration.ofMinutes(15))
                .recordStats());
        return cacheManager;
    }
}