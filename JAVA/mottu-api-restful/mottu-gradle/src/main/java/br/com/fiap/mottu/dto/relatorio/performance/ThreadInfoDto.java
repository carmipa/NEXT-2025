package br.com.fiap.mottu.dto.relatorio.performance;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@Schema(description = "Informações resumidas de uma thread da JVM")
public class ThreadInfoDto implements Serializable {

    @Schema(description = "ID da thread", example = "42")
    private long id;

    @Schema(description = "Nome da thread", example = "http-nio-8080-exec-1")
    private String name;

    @Schema(description = "Estado da thread", example = "RUNNABLE")
    private String state;

    @Schema(description = "CPU time em nanos (se suportado)", example = "1234567890")
    private Long cpuTimeNanos;

    @Schema(description = "User time em nanos (se suportado)", example = "987654321")
    private Long userTimeNanos;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Long getCpuTimeNanos() {
        return cpuTimeNanos;
    }

    public void setCpuTimeNanos(Long cpuTimeNanos) {
        this.cpuTimeNanos = cpuTimeNanos;
    }

    public Long getUserTimeNanos() {
        return userTimeNanos;
    }

    public void setUserTimeNanos(Long userTimeNanos) {
        this.userTimeNanos = userTimeNanos;
    }
}


