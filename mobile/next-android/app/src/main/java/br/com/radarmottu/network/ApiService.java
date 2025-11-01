package br.com.radarmottu.network;

import br.com.radarmottu.model.ParkingSpot;
import br.com.radarmottu.model.TagBleResponse;
import br.com.radarmottu.model.Token;
import br.com.radarmottu.model.Vehicle;
import br.com.radarmottu.model.VehicleResponse;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // --- VEÍCULOS ---

    @GET("api/veiculos/search")
    Call<VehicleResponse> getAllVehicles();

    @GET("api/veiculos/search")
    Call<VehicleResponse> searchVehicleByPlate(@Query("placa") String placa);

    @POST("api/veiculos")
    Call<Vehicle> registerVehicle(@Body Vehicle vehicle);

    @GET("api/veiculos/proxima-tag-ble")
    Call<TagBleResponse> getNextTagBle();

    // --- VALIDAÇÃO ---

    @GET("api/veiculos/existe-placa/{placa}")
    Call<Boolean> checkPlateExists(@Path("placa") String placa);

    @GET("api/veiculos/existe-chassi/{chassi}")
    Call<Boolean> checkChassiExists(@Path("chassi") String chassi);

    @GET("api/veiculos/existe-renavam/{renavam}")
    Call<Boolean> checkRenavamExists(@Path("renavam") String renavam);

    // --- LOCALIZAÇÃO E ESTACIONAMENTO ---

    @GET("api/veiculos/localizacao-por-placa")
    Call<ParkingSpot> locateVehicle(@Query("placa") String placa);

    @GET("api/veiculos/{id}/localizacao")
    Call<ParkingSpot> getVehicleLocationById(@Path("id") int vehicleId);

    @POST("api/parking/store")
    Call<ParkingSpot> storeVehicle(@Query("plate") String plate);

    @POST("api/parking/release")
    Call<Void> releaseVehicle(@Query("plate") String plate);

    // --- DEBUG E AUTENTICAÇÃO ---

    @GET("api/veiculos/debug-placa/{placa}")
    Call<ResponseBody> debugPlateExists(@Path("placa") String placa);

    @FormUrlEncoded
    @POST("token")
    Call<Token> loginForAccessToken(
            @Field("username") String username,
            @Field("password") String password
    );
}
