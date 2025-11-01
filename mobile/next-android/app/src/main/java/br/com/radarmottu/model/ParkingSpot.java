package br.com.radarmottu.model;

import com.google.gson.annotations.SerializedName;

public class ParkingSpot {

    @SerializedName("zone")
    private String zone;

    // A API de busca/locate retorna "spot", a de armazenar retorna "spot_number".
    // Com 'alternate' o Gson entende os dois nomes para o mesmo campo.
    @SerializedName(value="spot", alternate={"spot_number"})
    private int spot;

    // --- Getters (métodos para ler os valores) ---

    public String getZone() {
        return zone;
    }

    public int getSpot() {
        return spot;
    }

    // --- Setters (métodos para definir os valores) ---

    public void setZone(String zone) {
        this.zone = zone;
    }

    public void setSpot(int spot) {
        this.spot = spot;
    }
}