package br.com.radarmottu.api;

import java.util.List;
import br.com.radarmottu.model.Vehicle;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface ApiService {
    @GET("api/veiculos/search")
    Call<List<Vehicle>> searchVehicleByPlate(@Query("plate") String plate);
}
