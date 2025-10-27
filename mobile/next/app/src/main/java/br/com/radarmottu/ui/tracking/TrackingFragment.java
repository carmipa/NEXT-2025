package br.com.radarmottu.ui.tracking;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

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

import java.util.Locale;

import br.com.radarmottu.R;
import br.com.radarmottu.model.WebSocketMessage;
import br.com.radarmottu.network.WebSocketManager;
import br.com.radarmottu.ui.common.SonarView;
import br.com.radarmottu.ui.common.SoundManager;

public class TrackingFragment extends Fragment
        implements WebSocketManager.WebSocketListener, SensorEventListener {

    private static final String TAG = "TrackingFragment";
    private SonarView sonarView;
    private TextView textWebsocketStatus, textPhoneLatitude, textPhoneLongitude;
    private ToggleButton toggleSoundBip;
    private ImageView directionArrow;

    private SoundManager soundManager;
    private WebSocketManager webSocketManager;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private float lastKnownTagDistance = Float.MAX_VALUE;

    private SensorManager sensorManager;
    private final float[] accelerometerReading = new float[3];
    private final float[] magnetometerReading = new float[3];
    private final float[] rotationMatrix = new float[9];
    private final float[] orientationAngles = new float[3];
    private float phoneHeadingInDegrees = 0f;
    private float targetAngleInDegrees = 0f;

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
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_tracking, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view,
                              @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        sonarView = view.findViewById(R.id.sonar_view);
        textWebsocketStatus = view.findViewById(R.id.text_websocket_status);
        textPhoneLatitude = view.findViewById(R.id.text_phone_latitude);
        textPhoneLongitude = view.findViewById(R.id.text_phone_longitude);
        toggleSoundBip = view.findViewById(R.id.toggle_sound_bip);
        directionArrow = view.findViewById(R.id.image_view_direction_arrow);

        webSocketManager = new WebSocketManager(this);
        soundManager = new SoundManager(requireContext());
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity());
        sensorManager = (SensorManager) requireActivity().getSystemService(Context.SENSOR_SERVICE);

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(@NonNull LocationResult locationResult) {
                for (Location location : locationResult.getLocations()) {
                    if (location != null) {
                        textPhoneLatitude.setText(String.format(Locale.getDefault(), "Lat: %.4f", location.getLatitude()));
                        textPhoneLongitude.setText(String.format(Locale.getDefault(), "Lon: %.4f", location.getLongitude()));
                    }
                }
            }
        };

        toggleSoundBip.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                if (lastKnownTagDistance != Float.MAX_VALUE) {
                    soundManager.startBeeping(lastKnownTagDistance);
                }
            } else {
                soundManager.stopBeeping();
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        webSocketManager.start();
        checkAndRequestLocationPermissions();
        if (sonarView != null) sonarView.startAnimation();

        if (sensorManager != null) {
            Sensor accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            if (accelerometer != null) {
                sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI);
            }
            Sensor magneticField = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
            if (magneticField != null) {
                sensorManager.registerListener(this, magneticField, SensorManager.SENSOR_DELAY_UI);
            }
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        webSocketManager.stop();
        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
        if (sonarView != null) sonarView.stopAnimation();
        soundManager.stopBeeping();

        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (soundManager != null) soundManager.release();
    }

    private void checkAndRequestLocationPermissions() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            startLocationUpdates();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION);
        }
    }

    private void startLocationUpdates() {
        LocationRequest locationRequest = new LocationRequest
                .Builder(Priority.PRIORITY_HIGH_ACCURACY, 5_000)
                .setWaitForAccurateLocation(false)
                .setMinUpdateIntervalMillis(2_000)
                .build();

        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
    }

    @Override
    public void onMessage(WebSocketMessage message) {
        if (!isAdded() || getActivity() == null || !"object_pos".equals(message.getType())) {
            return;
        }

        lastKnownTagDistance = (float) Math.hypot(message.getPosX(), message.getPosY());
        targetAngleInDegrees = (float) Math.toDegrees(Math.atan2(message.getPosY(), message.getPosX()));

        requireActivity().runOnUiThread(() -> {
            textWebsocketStatus.setText("Status: Recebendo dados");
            if (sonarView != null) {
                sonarView.updateTagPosition(message.getPosX(), message.getPosY());
            }
            if (toggleSoundBip.isChecked()) {
                soundManager.stopBeeping();
                soundManager.startBeeping(lastKnownTagDistance);
            }
            updateDirectionalArrow();
        });
    }

    @Override
    public void onError(String error) {
        if (!isAdded() || getActivity() == null) {
            return;
        }
        requireActivity().runOnUiThread(() -> textWebsocketStatus.setText("Status: " + error));
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            System.arraycopy(event.values, 0, accelerometerReading, 0, accelerometerReading.length);
        } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            System.arraycopy(event.values, 0, magnetometerReading, 0, magnetometerReading.length);
        }
        updateOrientationAngles();
        updateDirectionalArrow();
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    private void updateOrientationAngles() {
        if (SensorManager.getRotationMatrix(rotationMatrix, null, accelerometerReading, magnetometerReading)) {
            SensorManager.getOrientation(rotationMatrix, orientationAngles);
            phoneHeadingInDegrees = (float) Math.toDegrees(orientationAngles[0]);
        }
    }

    private void updateDirectionalArrow() {
        if (directionArrow == null || lastKnownTagDistance == Float.MAX_VALUE) return;

        float targetAngleAdjusted = targetAngleInDegrees + 90;
        float rotationAngle = targetAngleAdjusted - phoneHeadingInDegrees;

        while (rotationAngle > 180) rotationAngle -= 360;
        while (rotationAngle <= -180) rotationAngle += 360;

        directionArrow.setRotation(-rotationAngle);
        directionArrow.setImageResource(R.drawable.ic_arrow_up);
    }
}
