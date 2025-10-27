package br.com.radarmottu.network;

import java.util.Map;

import br.com.radarmottu.model.AnchorPosition;
import retrofit2.Call;
import retrofit2.http.GET;

/**
 * Interface do Retrofit para os endpoints da API Python.
 */
public interface PythonApiService {

    /**
     * Busca as âncoras como um mapa, onde a chave é o label (ex: "A1")
     * e o valor é o objeto com as coordenadas.
     */
    @GET("api/anchors")
    Call<Map<String, AnchorPosition>> getAnchors();

}
