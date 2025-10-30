package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.config.LoggingConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller para Health Checks do sistema MOTTU
 * 
 * Endpoints disponíveis:
 * - GET /api/health - Health check geral
 * - GET /api/health/database - Health check do banco de dados
 * - GET /api/health/system - Informações do sistema
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    @Autowired
    private DataSource dataSource;

    /**
     * Health check geral do sistema
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Health check geral solicitado", 
            LoggingConfig.LogContext.create()
                .addOperation("healthCheck")
                .addEntityType("System")
                .build());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("application", "MOTTU - Sistema de Gestão de Pátios");
        response.put("version", "2.0.0");
        response.put("environment", "development");

        log.info("Health check geral concluído", 
            LoggingConfig.LogContext.create()
                .addOperation("healthCheck")
                .addEntityType("System")
                .addStatus("UP")
                .build());

        return ResponseEntity.ok(response);
    }

    /**
     * Health check específico do banco de dados
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        log.info("Health check do banco de dados solicitado", 
            LoggingConfig.LogContext.create()
                .addOperation("databaseHealthCheck")
                .addEntityType("Database")
                .build());

        Map<String, Object> response = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(1)) {
                // Testar uma query simples
                boolean isValid = connection.createStatement()
                    .execute("SELECT 1 FROM DUAL");
                
                if (isValid) {
                    response.put("status", "UP");
                    response.put("database", "Oracle");
                    response.put("url", connection.getMetaData().getURL());
                    response.put("driver", connection.getMetaData().getDriverName());
                    response.put("version", connection.getMetaData().getDatabaseProductVersion());
                    
                    log.info("Health check do banco de dados concluído com sucesso", 
                        LoggingConfig.LogContext.create()
                            .addOperation("databaseHealthCheck")
                            .addEntityType("Database")
                            .addStatus("UP")
                            .build());
                } else {
                    response.put("status", "DOWN");
                    response.put("error", "Query test failed");
                    
                    log.warn("Query de teste falhou no banco de dados", 
                        LoggingConfig.LogContext.create()
                            .addOperation("databaseHealthCheck")
                            .addEntityType("Database")
                            .addStatus("DOWN")
                            .addError("Query test failed")
                            .build());
                }
            } else {
                response.put("status", "DOWN");
                response.put("error", "Connection is not valid");
                
                log.warn("Conexão com banco de dados inválida", 
                    LoggingConfig.LogContext.create()
                        .addOperation("databaseHealthCheck")
                        .addEntityType("Database")
                        .addStatus("DOWN")
                        .addError("Connection is not valid")
                        .build());
            }
        } catch (SQLException e) {
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            response.put("sqlState", e.getSQLState());
            response.put("errorCode", e.getErrorCode());
            
            log.error("Erro ao verificar saúde do banco de dados", 
                LoggingConfig.LogContext.create()
                    .addOperation("databaseHealthCheck")
                    .addEntityType("Database")
                    .addStatus("DOWN")
                    .addError(e.getMessage())
                    .build(), e);
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("error", "Unexpected error: " + e.getMessage());
            
            log.error("Erro inesperado ao verificar saúde do banco de dados", 
                LoggingConfig.LogContext.create()
                    .addOperation("databaseHealthCheck")
                    .addEntityType("Database")
                    .addStatus("DOWN")
                    .addError(e.getMessage())
                    .build(), e);
        }

        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return response.get("status").equals("UP") ? 
            ResponseEntity.ok(response) : 
            ResponseEntity.status(503).body(response);
    }

    /**
     * Informações do sistema
     */
    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> systemInfo() {
        log.info("Informações do sistema solicitadas", 
            LoggingConfig.LogContext.create()
                .addOperation("systemInfo")
                .addEntityType("System")
                .build());

        Map<String, Object> response = new HashMap<>();
        
        try {
            // Informações da JVM
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryUsagePercent = (double) usedMemory / maxMemory * 100;
            
            response.put("status", "UP");
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            response.put("javaVersion", System.getProperty("java.version"));
            response.put("osName", System.getProperty("os.name"));
            response.put("osVersion", System.getProperty("os.version"));
            response.put("userTimezone", System.getProperty("user.timezone"));
            response.put("processors", runtime.availableProcessors());
            
            Map<String, Object> memory = new HashMap<>();
            memory.put("max", formatBytes(maxMemory));
            memory.put("total", formatBytes(totalMemory));
            memory.put("used", formatBytes(usedMemory));
            memory.put("free", formatBytes(freeMemory));
            memory.put("usagePercent", String.format("%.2f%%", memoryUsagePercent));
            response.put("memory", memory);
            
            Map<String, Object> application = new HashMap<>();
            application.put("name", "MOTTU - Sistema de Gestão de Pátios");
            application.put("version", "2.0.0");
            application.put("build", "2025-10-20");
            response.put("application", application);
            
            log.info("Informações do sistema retornadas com sucesso", 
                LoggingConfig.LogContext.create()
                    .addOperation("systemInfo")
                    .addEntityType("System")
                    .addStatus("UP")
                    .add("memoryUsage", String.format("%.2f%%", memoryUsagePercent))
                    .build());
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            log.error("Erro ao obter informações do sistema", 
                LoggingConfig.LogContext.create()
                    .addOperation("systemInfo")
                    .addEntityType("System")
                    .addStatus("ERROR")
                    .addError(e.getMessage())
                    .build(), e);
        }

        return ResponseEntity.ok(response);
    }
    
    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}















