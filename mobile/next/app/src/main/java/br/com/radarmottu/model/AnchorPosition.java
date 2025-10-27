package br.com.radarmottu.model;

import com.google.gson.annotations.SerializedName;

/**
 * Representa a estrutura de coordenadas (x, y) retornada pela API Python para cada âncora.
 */
public class AnchorPosition {

    @SerializedName("x")
    private float x;

    @SerializedName("y")
    private float y;

    // Getters
    public float getX() {
        return x;
    }

    public float getY() {
        return y;
    }
}
