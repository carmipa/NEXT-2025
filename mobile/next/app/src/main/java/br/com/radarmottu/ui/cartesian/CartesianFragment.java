package br.com.radarmottu.ui.cartesian;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import br.com.radarmottu.R;
import br.com.radarmottu.model.Anchor;
import br.com.radarmottu.model.AnchorPosition;
import br.com.radarmottu.model.WebSocketMessage;
import br.com.radarmottu.network.PythonApiService;
import br.com.radarmottu.network.RetrofitClients;
import br.com.radarmottu.network.WebSocketManager;
import br.com.radarmottu.ui.common.CartesianView;
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
        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity());
        setupLocationCallback();
        fetchAnchorsAndUpdateView();
        setupWebSocket();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (cartesianView != null) cartesianView.startAnimation();
        if (webSocketManager != null) webSocketManager.start();
        checkAndRequestLocationPermissions();
    }

    @Override
    public void onPause() {
        super.onPause();
        if (cartesianView != null) cartesianView.stopAnimation();
        if (webSocketManager != null) webSocketManager.stop();
        if (fusedLocationClient != null) fusedLocationClient.removeLocationUpdates(locationCallback);
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
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
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
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
    }

    private void fetchAnchorsAndUpdateView() {
        PythonApiService pythonApiService = RetrofitClients.pythonApi();
        pythonApiService.getAnchors().enqueue(new Callback<Map<String, AnchorPosition>>() {
            @Override
            public void onResponse(Call<Map<String, AnchorPosition>> call, Response<Map<String, AnchorPosition>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Anchor> anchorList = new ArrayList<>();
                    for (Map.Entry<String, AnchorPosition> entry : response.body().entrySet()) {
                        anchorList.add(new Anchor(entry.getKey(), entry.getValue().getX(), entry.getValue().getY()));
                    }
                    cartesianView.setAnchors(anchorList);
                } else {
                    showError("Falha ao buscar âncoras: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Map<String, AnchorPosition>> call, Throwable t) {
                Log.e(TAG, "Erro na requisição das âncoras", t);
                showError("Erro de rede ao buscar âncoras.");
            }
        });
    }

    private void setupWebSocket() {
        webSocketManager = new WebSocketManager(new WebSocketManager.WebSocketListener() {
            @Override
            public void onMessage(WebSocketMessage message) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        if ("object_pos".equals(message.getType())) {
                            cartesianView.setObjectPosition(message.getPosX(), message.getPosY());
                        }
                    });
                }
            }

            @Override
            public void onError(String error) {
                Log.e(TAG, "WebSocket Error: " + error);
                showError("Erro no WebSocket: " + error);
            }
        });
    }

    private void showError(String message) {
        if (isAdded() && getActivity() != null) {
            getActivity().runOnUiThread(() -> Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show());
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (webSocketManager != null) webSocketManager.stop();
        if (cartesianView != null) cartesianView.stopAnimation();
    }
}
