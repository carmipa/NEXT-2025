package br.com.radarmottu.model;

import com.google.gson.annotations.SerializedName;

/**
 * Representa uma mensagem recebida via WebSocket da API Python.
 */
public class WebSocketMessage {

    @SerializedName("type")
    private String type;

    @SerializedName("pos_x")
    private float posX;

    @SerializedName("pos_y")
    private float posY;

    @SerializedName("mac_address")
    private String macAddress;

    // Getters
    public String getType() {
        return type;
    }

    public float getPosX() {
        return posX;
    }

    public float getPosY() {
        return posY;
    }

    public String getMacAddress() {
        return macAddress;
    }
}
