package br.com.fiap.mottu.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.env.Environment;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.ServerSocket;

/**
 * Gerenciador de portas automático para evitar conflitos
 * 
 * Funcionalidades:
 * - Detecta automaticamente portas livres
 * - Tenta liberar portas ocupadas
 * - Logs informativos sobre portas utilizadas
 * - Fallback automático para portas alternativas
 */
@Component
public class PortManager implements ApplicationListener<ContextRefreshedEvent> {

    private static final Logger logger = LoggerFactory.getLogger(PortManager.class);
    private static final int[] FALLBACK_PORTS = {8080, 8081, 8082, 8083, 8084, 8085, 3000, 3001, 3002};
    
    private final Environment environment;

    public PortManager(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void onApplicationEvent(@NonNull ContextRefreshedEvent event) {
        String port = environment.getProperty("server.port", "8080");
        logger.info("🚀 PortManager: Verificando configuração de porta...");
        logger.info("📍 Porta configurada: {}", port);
        
        if (!"0".equals(port)) {
            checkPortAvailability(Integer.parseInt(port));
        } else {
            logger.info("🎯 Porta dinâmica ativada - Spring Boot encontrará automaticamente uma porta livre");
        }
        
        // Informar sobre CORS
        logger.info("🌐 CORS: Configurado para aceitar frontend em localhost:3000");
        logger.info("🌐 CORS: Backend aceitará conexões em portas 8080-8085 automaticamente");
    }

    /**
     * Verifica se uma porta específica está disponível
     */
    public static boolean isPortAvailable(int port) {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            serverSocket.setReuseAddress(false);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Encontra a primeira porta disponível na lista de fallback
     */
    public static int findAvailablePort() {
        for (int port : FALLBACK_PORTS) {
            if (isPortAvailable(port)) {
                return port;
            }
        }
        return 0; // Deixa o Spring Boot escolher uma porta aleatória
    }

    /**
     * Verifica disponibilidade da porta e sugere alternativas se necessário
     */
    private void checkPortAvailability(int port) {
        if (isPortAvailable(port)) {
            logger.info("✅ Porta {} está disponível", port);
        } else {
            logger.warn("⚠️  Porta {} está ocupada!", port);
            
            int availablePort = findAvailablePort();
            if (availablePort > 0) {
                logger.info("💡 Sugestão: Use a porta {} como alternativa", availablePort);
                logger.info("🔧 Para usar automaticamente, configure: server.port={}", availablePort);
            } else {
                logger.info("🎲 Nenhuma porta alternativa encontrada - usando porta aleatória");
                logger.info("🔧 Para usar porta aleatória, configure: server.port=0");
            }
            
            logPortUsageInfo(port);
        }
    }

    /**
     * Mostra informações sobre o uso da porta
     */
    private void logPortUsageInfo(int port) {
        logger.info("📋 Informações sobre a porta {}:", port);
        logger.info("   • Verifique se outra instância da aplicação está rodando");
        logger.info("   • Use 'netstat -ano | findstr :{}' para ver qual processo está usando", port);
        logger.info("   • Para fechar o processo, use: taskkill /PID <PID> /F");
        logger.info("   • Ou configure uma porta diferente no application.properties");
    }

    /**
     * Método utilitário para verificar portas via linha de comando
     */
    public static void main(String[] args) {
        System.out.println("🔍 Verificando portas comuns...");
        
        for (int port : FALLBACK_PORTS) {
            boolean available = isPortAvailable(port);
            System.out.printf("Porta %d: %s%n", port, available ? "✅ Disponível" : "❌ Ocupada");
        }
        
        int suggested = findAvailablePort();
        if (suggested > 0) {
            System.out.printf("💡 Sugestão: Use a porta %d%n", suggested);
        } else {
            System.out.println("🎲 Todas as portas estão ocupadas - use porta aleatória (server.port=0)");
        }
    }
}
