package br.com.radarmottu.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * Esta classe representa a estrutura de resposta paginada da API de veículos.
 */
public class VehicleResponse {

    @SerializedName("content")
    private List<Vehicle> content;

    // Outros campos de paginação podem ser adicionados aqui se necessário (totalPages, totalElements, etc.)

    public List<Vehicle> getContent() {
        return content;
    }

    public void setContent(List<Vehicle> content) {
        this.content = content;
    }
}
