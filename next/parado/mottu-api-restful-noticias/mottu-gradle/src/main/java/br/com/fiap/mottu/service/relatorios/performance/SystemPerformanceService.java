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
}


