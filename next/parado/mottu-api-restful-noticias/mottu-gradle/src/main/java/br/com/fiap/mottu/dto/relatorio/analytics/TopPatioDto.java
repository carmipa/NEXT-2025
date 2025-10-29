package br.com.fiap.mottu.dto.relatorio.analytics;

public class TopPatioDto {
    private Long patioId;
    private String patioNome;
    private Long eventos;

    public TopPatioDto() {}

    public TopPatioDto(Long patioId, String patioNome, Long eventos) {
        this.patioId = patioId;
        this.patioNome = patioNome;
        this.eventos = eventos;
    }

    public Long getPatioId() { return patioId; }
    public void setPatioId(Long patioId) { this.patioId = patioId; }

    public String getPatioNome() { return patioNome; }
    public void setPatioNome(String patioNome) { this.patioNome = patioNome; }

    public Long getEventos() { return eventos; }
    public void setEventos(Long eventos) { this.eventos = eventos; }
}


