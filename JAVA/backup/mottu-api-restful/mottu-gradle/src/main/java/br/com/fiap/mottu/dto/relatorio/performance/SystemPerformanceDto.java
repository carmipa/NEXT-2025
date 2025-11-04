package br.com.fiap.mottu.dto.relatorio.performance;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@Schema(description = "Métricas de performance do processo e do sistema")
public class SystemPerformanceDto implements Serializable {

    @Schema(description = "PID do processo da aplicação", example = "12345")
    private long pid;

    @Schema(description = "Tempo de atividade do processo em milissegundos", example = "3600000")
    private long uptimeMs;

    @Schema(description = "Número de processadores disponíveis para a JVM", example = "8")
    private int availableProcessors;

    @Schema(description = "Carga de CPU do sistema (0.0 a 1.0)", example = "0.73")
    private Double systemCpuLoad;

    @Schema(description = "Carga de CPU do processo (0.0 a 1.0)", example = "0.41")
    private Double processCpuLoad;

    @Schema(description = "Memória heap usada em bytes", example = "268435456")
    private long heapUsedBytes;

    @Schema(description = "Memória heap máxima em bytes", example = "1073741824")
    private long heapMaxBytes;

    @Schema(description = "Memória non-heap usada em bytes", example = "67108864")
    private long nonHeapUsedBytes;

    @Schema(description = "Total de threads ativas", example = "112")
    private int threadCount;

    @Schema(description = "Quantidade de threads do tipo daemon", example = "78")
    private int daemonThreadCount;

    public long getPid() {
        return pid;
    }

    public void setPid(long pid) {
        this.pid = pid;
    }

    public long getUptimeMs() {
        return uptimeMs;
    }

    public void setUptimeMs(long uptimeMs) {
        this.uptimeMs = uptimeMs;
    }

    public int getAvailableProcessors() {
        return availableProcessors;
    }

    public void setAvailableProcessors(int availableProcessors) {
        this.availableProcessors = availableProcessors;
    }

    public Double getSystemCpuLoad() {
        return systemCpuLoad;
    }

    public void setSystemCpuLoad(Double systemCpuLoad) {
        this.systemCpuLoad = systemCpuLoad;
    }

    public Double getProcessCpuLoad() {
        return processCpuLoad;
    }

    public void setProcessCpuLoad(Double processCpuLoad) {
        this.processCpuLoad = processCpuLoad;
    }

    public long getHeapUsedBytes() {
        return heapUsedBytes;
    }

    public void setHeapUsedBytes(long heapUsedBytes) {
        this.heapUsedBytes = heapUsedBytes;
    }

    public long getHeapMaxBytes() {
        return heapMaxBytes;
    }

    public void setHeapMaxBytes(long heapMaxBytes) {
        this.heapMaxBytes = heapMaxBytes;
    }

    public long getNonHeapUsedBytes() {
        return nonHeapUsedBytes;
    }

    public void setNonHeapUsedBytes(long nonHeapUsedBytes) {
        this.nonHeapUsedBytes = nonHeapUsedBytes;
    }

    public int getThreadCount() {
        return threadCount;
    }

    public void setThreadCount(int threadCount) {
        this.threadCount = threadCount;
    }

    public int getDaemonThreadCount() {
        return daemonThreadCount;
    }

    public void setDaemonThreadCount(int daemonThreadCount) {
        this.daemonThreadCount = daemonThreadCount;
    }
}


