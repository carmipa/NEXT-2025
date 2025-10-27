package br.com.radarmottu.model;

/**
 * Representa uma âncora com sua posição, adaptada para uso na UI.
 */
public class Anchor {

    private String label;
    private float posX;
    private float posY;

    /**
     * Construtor para transformar os dados da API em um objeto que a View entende.
     */
    public Anchor(String label, float posX, float posY) {
        this.label = label;
        this.posX = posX;
        this.posY = posY;
    }

    // Getters
    public String getLabel() {
        return label;
    }

    public float getPosX() {
        return posX;
    }

    public float getPosY() {
        return posY;
    }
}
