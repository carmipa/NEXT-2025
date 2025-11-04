package br.com.fiap.mottu.service.relatorios.performance;

import br.com.fiap.mottu.dto.relatorio.performance.SystemPerformanceDto;
import br.com.fiap.mottu.dto.relatorio.performance.ThreadInfoDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.util.ArrayList;
import java.util.List;

@Service("systemPerformanceService")
public class SystemPerformanceService {

    @Cacheable(value = "relatorioPerformance", key = "'system'", unless = "#result == null")
    public SystemPerformanceDto coletarSystemInfo() {
        SystemPerformanceDto dto = new SystemPerformanceDto();

        RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
        OperatingSystemMXBean os = ManagementFactory.getOperatingSystemMXBean();

        dto.setPid(getPid(runtime));
        dto.setUptimeMs(runtime.getUptime());
        dto.setAvailableProcessors(Runtime.getRuntime().availableProcessors());
        dto.setThreadCount(threadMXBean.getThreadCount());
        dto.setDaemonThreadCount(threadMXBean.getDaemonThreadCount());

        // CPU loads (se suportado pelo JDK/OS)
        dto.setSystemCpuLoad(extractSystemCpuLoad(os));
        dto.setProcessCpuLoad(extractProcessCpuLoad(os));

        // Memória
        long heapUsed = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed();
        long heapMax = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getMax();
        long nonHeapUsed = ManagementFactory.getMemoryMXBean().getNonHeapMemoryUsage().getUsed();
        dto.setHeapUsedBytes(heapUsed);
        dto.setHeapMaxBytes(heapMax);
        dto.setNonHeapUsedBytes(nonHeapUsed);
        
        // Cache do processador (estimado baseado no número de processadores)
        dto.setProcessorCacheSizeBytes(estimateProcessorCacheSize(os));
        
        // Largura de banda da rede (baseada no throughput atual ou estimativa)
        dto.setNetworkBandwidthMbps(estimateNetworkBandwidth());

        // RAM total do sistema
        dto.setTotalRamBytes(getTotalRamBytes());
        
        // Velocidade da RAM (estimada)
        dto.setRamSpeedMhz(estimateRamSpeed());
        
        // Velocidade do processador (estimada)
        dto.setProcessorSpeedMhz(estimateProcessorSpeed(os));

        return dto;
    }

    @Cacheable(value = "relatorioPerformance", key = "'threads'", unless = "#result == null")
    public List<ThreadInfoDto> listarThreads() {
        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
        boolean cpuTimeSupported = threadMXBean.isThreadCpuTimeSupported();
        if (cpuTimeSupported && !threadMXBean.isThreadCpuTimeEnabled()) {
            threadMXBean.setThreadCpuTimeEnabled(true);
        }

        long[] ids = threadMXBean.getAllThreadIds();
        List<ThreadInfoDto> out = new ArrayList<>(ids.length);
        for (long id : ids) {
            java.lang.management.ThreadInfo ti = threadMXBean.getThreadInfo(id);
            if (ti == null) continue;
            ThreadInfoDto dto = new ThreadInfoDto();
            dto.setId(id);
            dto.setName(ti.getThreadName());
            dto.setState(String.valueOf(ti.getThreadState()));
            if (cpuTimeSupported) {
                dto.setCpuTimeNanos(threadMXBean.getThreadCpuTime(id));
                dto.setUserTimeNanos(threadMXBean.getThreadUserTime(id));
            }
            out.add(dto);
        }
        return out;
    }

    private long getPid(RuntimeMXBean runtime) {
        try {
            String name = runtime.getName(); // formato esperado: pid@host
            int idx = name.indexOf('@');
            return idx > 0 ? Long.parseLong(name.substring(0, idx)) : -1L;
        } catch (Exception e) {
            return -1L;
        }
    }

    private Double extractSystemCpuLoad(OperatingSystemMXBean os) {
        try {
            // Tenta via com.sun.management.OperatingSystemMXBean se disponível
            if (os instanceof com.sun.management.OperatingSystemMXBean sunOs) {
                double load = sunOs.getSystemCpuLoad();
                return load >= 0 ? load : null;
            }
        } catch (Throwable ignored) { }
        return null;
    }

    private Double extractProcessCpuLoad(OperatingSystemMXBean os) {
        try {
            if (os instanceof com.sun.management.OperatingSystemMXBean sunOs) {
                double load = sunOs.getProcessCpuLoad();
                return load >= 0 ? load : null;
            }
        } catch (Throwable ignored) { }
        return null;
    }

    /**
     * Estima o tamanho do cache do processador baseado no número de processadores
     * Valores típicos: ~8MB L3 por núcleo para processadores modernos
     */
    private Long estimateProcessorCacheSize(OperatingSystemMXBean os) {
        try {
            int processors = Runtime.getRuntime().availableProcessors();
            // Estimativa: 8MB L3 por núcleo (valor conservador para processadores modernos)
            // Para servidores: pode ser maior (16-32MB por núcleo)
            long estimatedCacheBytes = processors * 8L * 1024 * 1024; // 8MB por núcleo
            
            // Em alguns sistemas, podemos obter informações mais precisas
            // Por enquanto, usamos a estimativa baseada no número de processadores
            
            return estimatedCacheBytes;
        } catch (Exception e) {
            // Fallback: estimativa conservadora de 8MB por núcleo
            return Runtime.getRuntime().availableProcessors() * 8L * 1024 * 1024;
        }
    }

    /**
     * Estima a largura de banda da rede baseada no throughput atual ou em valores típicos
     * Tenta obter informações do sistema operacional quando possível
     */
    private Double estimateNetworkBandwidth() {
        try {
            // Tentar obter informações da interface de rede
            // Por enquanto, retornamos uma estimativa baseada em valores típicos
            // Valores típicos:
            // - Rede local (LAN): 100-1000 Mbps (0.1-1 Gbps)
            // - Internet residencial: 10-100 Mbps (0.01-0.1 Gbps)
            // - Servidor: 1000-10000 Mbps (1-10 Gbps)
            
            // Estimativa conservadora para servidor: 1 Gbps (1000 Mbps)
            // Na prática, isso pode ser medido através do throughput atual
            // que está sendo coletado nas métricas avançadas
            
            return 1000.0; // 1000 Mbps = 1 Gbps (valor estimado padrão para servidor)
        } catch (Exception e) {
            return 1000.0; // Fallback: 1 Gbps
        }
    }

    /**
     * Obtém a quantidade total de RAM do sistema
     */
    private Long getTotalRamBytes() {
        try {
            // Tentar obter via com.sun.management.OperatingSystemMXBean
            OperatingSystemMXBean os = ManagementFactory.getOperatingSystemMXBean();
            if (os instanceof com.sun.management.OperatingSystemMXBean sunOs) {
                try {
                    // Tentar obter memória física total
                    long totalMemory = sunOs.getTotalPhysicalMemorySize();
                    if (totalMemory > 0) {
                        return totalMemory;
                    }
                } catch (Exception e) {
                    // Fallback para outras abordagens
                }
            }
            
            // Fallback: usar Runtime.getRuntime().maxMemory() multiplicado por um fator
            // (maxMemory geralmente é menor que a RAM total devido a configurações da JVM)
            // Estimativa conservadora: maxMemory * 4 (assumindo que JVM usa ~25% da RAM)
            long maxMemory = Runtime.getRuntime().maxMemory();
            if (maxMemory != Long.MAX_VALUE && maxMemory > 0) {
                return maxMemory * 4L; // Estimativa: 4x o heap máximo
            }
            
            // Fallback final: estimativa baseada em valores típicos de servidores
            return 16L * 1024 * 1024 * 1024; // 16 GB como padrão
        } catch (Exception e) {
            return 16L * 1024 * 1024 * 1024; // Fallback: 16 GB
        }
    }

    /**
     * Estima a velocidade da RAM em MHz
     * Valores típicos: DDR4 (2133-3200 MHz), DDR5 (4800-6400 MHz)
     */
    private Integer estimateRamSpeed() {
        try {
            // Nota: velocidade da RAM pode ser obtida via comandos do sistema operacional
            // (ex: dmidecode no Linux, WMI no Windows, system_profiler no macOS)
            // Por enquanto, usamos estimativa baseada em valores típicos para servidores modernos
            
            // Estimativa conservadora: DDR4 3200 MHz (valor comum para servidores modernos)
            return 3200;
        } catch (Exception e) {
            return 3200; // Fallback: 3200 MHz (DDR4 comum)
        }
    }

    /**
     * Estima a velocidade do processador em MHz
     */
    private Integer estimateProcessorSpeed(OperatingSystemMXBean os) {
        try {
            // Tentar ler de arquivos do sistema operacional
            // Nota: em sistemas Linux, informações de velocidade podem estar em /proc/meminfo
            // mas requerem parsing específico. Por enquanto, usamos estimativa baseada em valores típicos
            String osName = System.getProperty("os.name", "").toLowerCase();
            
            if (osName.contains("linux")) {
                // Tentar ler de /proc/cpuinfo
                try {
                    java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.FileReader("/proc/cpuinfo"));
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.toLowerCase().contains("cpu mhz") || 
                            line.toLowerCase().contains("bogomips")) {
                            // Extrair valor de frequência
                            String[] parts = line.split(":");
                            if (parts.length > 1) {
                                try {
                                    double mhz = Double.parseDouble(parts[1].trim());
                                    if (mhz > 0) {
                                        // Bogomips pode ser ~2x a frequência real, então ajustamos
                                        if (line.toLowerCase().contains("bogomips")) {
                                            mhz = mhz / 2.0;
                                        }
                                        reader.close();
                                        return (int) Math.round(mhz);
                                    }
                                } catch (NumberFormatException e) {
                                    // Continuar procurando
                                }
                            }
                        }
                    }
                    reader.close();
                } catch (Exception e) {
                    // Fallback para estimativa
                }
            } else if (osName.contains("windows")) {
                // No Windows, poderia usar WMI via PowerShell
                // Por enquanto, usamos estimativa
            } else if (osName.contains("mac")) {
                // No macOS, poderia usar sysctl
                try {
                    java.lang.Process process = Runtime.getRuntime().exec(
                        new String[]{"sysctl", "-n", "hw.cpufrequency"});
                    java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(process.getInputStream()));
                    String line = reader.readLine();
                    if (line != null) {
                        try {
                            long hz = Long.parseLong(line.trim());
                            reader.close();
                            return (int) (hz / 1_000_000); // Converter Hz para MHz
                        } catch (NumberFormatException e) {
                            reader.close();
                        }
                    }
                    reader.close();
                } catch (Exception e) {
                    // Fallback para estimativa
                }
            }
            
            // Estimativa conservadora: 2.4 GHz (2400 MHz) - valor comum para servidores
            return 2400;
        } catch (Exception e) {
            return 2400; // Fallback: 2400 MHz (2.4 GHz)
        }
    }
}


