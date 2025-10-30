package br.com.fiap.mottu.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.HashMap;

/**
 * Configuração centralizada de logging estruturado para o sistema MOTTU
 * 
 * Esta classe fornece utilitários para logging estruturado com contexto
 * e informações relevantes para debugging e monitoramento.
 */
@Configuration
public class LoggingConfig {

    /**
     * Logger principal do sistema MOTTU
     */
    @Bean
    public Logger mottuLogger() {
        return LoggerFactory.getLogger("MOTTU");
    }

    /**
     * Utilitário para criar mapas de contexto para logging estruturado
     */
    public static class LogContext {
        
        private final Map<String, Object> context = new HashMap<>();
        
        public static LogContext create() {
            return new LogContext();
        }
        
        public LogContext add(String key, Object value) {
            if (value != null) {
                context.put(key, value);
            }
            return this;
        }
        
        public LogContext addUserId(Long userId) {
            return add("userId", userId);
        }
        
        public LogContext addEntityId(Long id) {
            return add("entityId", id);
        }
        
        public LogContext addEntityType(String type) {
            return add("entityType", type);
        }
        
        public LogContext addOperation(String operation) {
            return add("operation", operation);
        }
        
        public LogContext addDuration(long durationMs) {
            return add("durationMs", durationMs);
        }
        
        public LogContext addError(String error) {
            return add("error", error);
        }
        
        public LogContext addCount(int count) {
            return add("count", count);
        }
        
        public LogContext addStatus(String status) {
            return add("status", status);
        }
        
        public Map<String, Object> build() {
            return new HashMap<>(context);
        }
    }
}





