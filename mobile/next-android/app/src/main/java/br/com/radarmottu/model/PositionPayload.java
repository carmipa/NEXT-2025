package br.com.radarmottu.model;

public class PositionPayload {
    private String id;
    private String kind;
    private Position pos;

    // Gerar Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public Position getPos() { return pos; }
    public void setPos(Position pos) { this.pos = pos; }
}