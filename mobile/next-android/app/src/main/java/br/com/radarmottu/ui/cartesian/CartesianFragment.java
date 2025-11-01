package br.com.radarmottu.ui.cartesian;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.List;
import java.util.Locale;

import br.com.radarmottu.R;
import br.com.radarmottu.model.Vehicle;
import br.com.radarmottu.model.VehicleResponse;
import br.com.radarmottu.model.WebSocketMessage;
import br.com.radarmottu.network.ApiService;
import br.com.radarmottu.network.RetrofitClient;
import br.com.radarmottu.network.WebSocketManager;
import br.com.radarmottu.ui.common.CartesianView;
import br.com.radarmottu.ui.common.SoundManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CartesianFragment extends Fragment {

    private static final String TAG = "CartesianFragment";
    private CartesianView cartesianView;
    private WebSocketManager webSocketManager;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private TextView textLatitude, textLongitude;
    private ImageView imageViewSound;
    private TextInputLayout plateInputLayout;
    private TextInputEditText plateInputEditText;

    private SoundManager soundManager;
    private boolean isSoundOn = false;
    private float lastKnownTagDistance = Float.MAX_VALUE;
    private ApiService apiService;


    private final ActivityResultLauncher<String> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    startLocationUpdates();
                } else {
                    Toast.makeText(getContext(), "Permissão de localização negada.", Toast.LENGTH_LONG).show();
                }
            });

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_cartesian, container, false);
        cartesianView = root.findViewById(R.id.cartesian_view);
        textLatitude = root.findViewById(R.id.text_cartesian_latitude);
        textLongitude = root.findViewById(R.id.text_cartesian_longitude);
        imageViewSound = root.findViewById(R.id.image_view_sound_cartesian);
        plateInputLayout = root.findViewById(R.id.plate_input_layout_cartesian);
        plateInputEditText = root.findViewById(R.id.plate_input_edit_text_cartesian);
        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity());
        soundManager = new SoundManager(requireContext());
        apiService = RetrofitClient.getApiService();
        setupLocationCallback();
        setupWebSocket();

        // Sound button listener
        imageViewSound.setOnClickListener(v -> {
            isSoundOn = !isSoundOn;
            if (isSoundOn) {
                imageViewSound.setImageResource(R.drawable.ic_volume_up);
                if (lastKnownTagDistance != Float.MAX_VALUE) {
                    soundManager.startBeeping(lastKnownTagDistance);
                }
            } else {
                imageViewSound.setImageResource(R.drawable.ic_volume_off);
                soundManager.stopBeeping();
            }
        });
        // Set initial sound state
        imageViewSound.setImageResource(R.drawable.ic_volume_off);

        // Plate input listener
        plateInputEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                String plate = s.toString().toUpperCase(Locale.ROOT);
                if (plate.length() >= 7) {
                    searchVehicleByPlate(plate);
                } else {
                    plateInputLayout.setError(null);
                    webSocketManager.stop();
                    if (cartesianView != null) {
                        cartesianView.setObjectPosition(0f, 0f);
                    }
                }
            }
        });
    }

    private void searchVehicleByPlate(String plate) {
        Log.d(TAG, "Iniciando busca pela placa: [" + plate + "]");
        apiService.searchVehicleByPlate(plate).enqueue(new Callback<VehicleResponse>() {
            @Override
            public void onResponse(Call<VehicleResponse> call, Response<VehicleResponse> response) {
                Log.d(TAG, "Resposta da API recebida. Código: " + response.code() + ", Sucesso: " + response.isSuccessful());
                if (response.isSuccessful() && response.body() != null) {
                    List<Vehicle> vehicles = response.body().getContent();
                    Log.d(TAG, "Corpo da resposta: " + response.body().toString());
                    if (vehicles != null && !vehicles.isEmpty()) {
                        Vehicle vehicle = vehicles.get(0);
                        String tagId = vehicle.getTagBleId();
                        Log.d(TAG, "Veículo encontrado: " + vehicle.getPlaca() + ", Tag ID: " + tagId);
                        if (tagId != null && !tagId.isEmpty()) {
                            plateInputLayout.setError(null);
                            webSocketManager.start(tagId);
                            Toast.makeText(getContext(), "Rastreando moto com placa: " + plate, Toast.LENGTH_SHORT).show();
                        } else {
                            Log.w(TAG, "Tag ID nula ou vazia para a placa: " + plate);
                            plateInputLayout.setError("Tag não encontrada para esta placa");
                            webSocketManager.stop();
                            if (cartesianView != null) {
                                cartesianView.setObjectPosition(0f, 0f);
                            }
                        }
                    } else {
                        Log.w(TAG, "Nenhum veículo encontrado para a placa: " + plate);
                        plateInputLayout.setError("Moto não cadastrada");
                        webSocketManager.stop();
                        if (cartesianView != null) {
                             cartesianView.setObjectPosition(0f, 0f);
                        }
                    }
                } else {
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "Corpo de erro vazio";
                        Log.e(TAG, "Falha na busca. Código: " + response.code() + ", Mensagem: " + response.message() + ", Corpo do erro: " + errorBody);
                    } catch (Exception e) {
                        Log.e(TAG, "Erro ao ler corpo de erro da API", e);
                    }
                    plateInputLayout.setError("Moto não cadastrada");
                    webSocketManager.stop();
                    if (cartesianView != null) {
                        cartesianView.setObjectPosition(0f, 0f);
                    }
                }
            }

            @Override
            public void onFailure(Call<VehicleResponse> call, Throwable t) {
                Log.e(TAG, "Falha na chamada da API para a placa: " + plate, t);
                plateInputLayout.setError("Erro de rede");
                webSocketManager.stop();
                if (cartesianView != null) {
                    cartesianView.setObjectPosition(0f, 0f);
                }
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        if (cartesianView != null) cartesianView.startAnimation();
        checkAndRequestLocationPermissions();
    }

    @Override
    public void onPause() {
        super.onPause();
        if (cartesianView != null) cartesianView.stopAnimation();
        if (webSocketManager != null) webSocketManager.stop();
        if (fusedLocationClient != null) fusedLocationClient.removeLocationUpdates(locationCallback);
        soundManager.stopBeeping();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (soundManager != null) soundManager.release();
    }

    private void setupLocationCallback() {
        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(@NonNull LocationResult locationResult) {
                for (Location location : locationResult.getLocations()) {
                    if (location != null) {
                        textLatitude.setText(String.format(Locale.getDefault(), "Lat: %.4f", location.getLatitude()));
                        textLongitude.setText(String.format(Locale.getDefault(), "Lon: %.4f", location.getLongitude()));
                    }
                }
            }
        };
    }

    private void checkAndRequestLocationPermissions() {
        if (getContext() != null && ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            startLocationUpdates();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION);
        }
    }

    private void startLocationUpdates() {
        LocationRequest locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
                .setWaitForAccurateLocation(false)
                .setMinUpdateIntervalMillis(2000)
                .build();
        if (getContext() != null && ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
    }

    private void setupWebSocket() {
        webSocketManager = new WebSocketManager(new WebSocketManager.WebSocketListener() {
            @Override
            public void onMessage(WebSocketMessage message) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        if ("object_pos".equals(message.getType())) {
                            lastKnownTagDistance = (float) Math.hypot(message.getPosX(), message.getPosY());
                            if (cartesianView != null) {
                                cartesianView.setObjectPosition(message.getPosX(), message.getPosY());
                            }
                            if (isSoundOn) {
                                soundManager.stopBeeping();
                                soundManager.startBeeping(lastKnownTagDistance);
                            }
                        }
                    });
                }
            }

            @Override
            public void onError(String error) {
                if (isAdded() && getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        Log.e(TAG, "WebSocket Error: " + error);
                        showError("Erro no WebSocket: " + error);
                    });
                }
            }
        });
    }

    private void showError(String message) {
        if (isAdded() && getContext() != null) {
            Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (webSocketManager != null) {
            webSocketManager.stop();
        }
        if (cartesianView != null) {
            cartesianView.stopAnimation();
        }
        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
    }
}
