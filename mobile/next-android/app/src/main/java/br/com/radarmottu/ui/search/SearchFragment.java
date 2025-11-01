package br.com.radarmottu.ui.search;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;
import androidx.navigation.NavDestination;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textfield.TextInputLayout;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import br.com.radarmottu.R;
import br.com.radarmottu.model.Vehicle;
import br.com.radarmottu.model.VehicleResponse;
import br.com.radarmottu.network.ApiService;
import br.com.radarmottu.network.RetrofitClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SearchFragment extends Fragment implements VehicleAdapter.OnVehicleClickListener {

    private static final String TAG = "SearchFragment";

    private RecyclerView recyclerView;
    private VehicleAdapter vehicleAdapter;
    private EditText editTextPlate;
    private ProgressBar progressBar;
    private TextView textSearchStatus;
    private ApiService apiService;
    private NavController navController;
    private TextRecognizer textRecognizer;
    private TextInputLayout textInputLayoutPlate;

    private final ActivityResultLauncher<String[]> requestPermissionsLauncher = registerForActivityResult(
            new ActivityResultContracts.RequestMultiplePermissions(),
            permissions -> {
                boolean allGranted = true;
                for (Boolean isGranted : permissions.values()) {
                    if (!isGranted) {
                        allGranted = false;
                        break;
                    }
                }
                if (allGranted) {
                    showImageSourceDialog();
                } else {
                    Toast.makeText(getContext(), "Permissões de câmera e galeria são necessárias.", Toast.LENGTH_LONG).show();
                }
            }
    );

    private final ActivityResultLauncher<Intent> imageLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    Bitmap imageBitmap = null;
                    if (imageUri != null) { // Gallery image
                        try {
                            imageBitmap = MediaStore.Images.Media.getBitmap(requireActivity().getContentResolver(), imageUri);
                        } catch (IOException e) {
                            Log.e(TAG, "Error loading image from gallery", e);
                        }
                    } else { // Camera image
                        Bundle extras = result.getData().getExtras();
                        if (extras != null) {
                            imageBitmap = (Bitmap) extras.get("data");
                        }
                    }
                    if (imageBitmap != null) {
                        processImage(imageBitmap);
                    }
                }
            }
    );

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_search, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        setupViews(view);
        apiService = RetrofitClient.getApiService();
        navController = NavHostFragment.findNavController(this);
        setupRecyclerView();
        setupSearch();
        fetchAllVehicles();
    }

    private void setupViews(View view) {
        recyclerView = view.findViewById(R.id.recycler_view_vehicles);
        textInputLayoutPlate = view.findViewById(R.id.text_input_layout_plate);
        editTextPlate = view.findViewById(R.id.edit_text_plate);
        progressBar = view.findViewById(R.id.progress_bar);
        textSearchStatus = view.findViewById(R.id.text_search_status);

        textInputLayoutPlate.setEndIconOnClickListener(v -> checkAndRequestPermissions());
    }

    private void setupRecyclerView() {
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        vehicleAdapter = new VehicleAdapter(this);
        recyclerView.setAdapter(vehicleAdapter);
    }

    private void setupSearch() {
        editTextPlate.setImeOptions(EditorInfo.IME_ACTION_SEARCH);
        editTextPlate.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                String plate = editTextPlate.getText().toString();
                if (plate.isEmpty()) {
                    fetchAllVehicles();
                } else {
                    navigateToDetail(plate);
                }
                hideKeyboard();
                return true;
            }
            return false;
        });
    }

    private void checkAndRequestPermissions() {
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        permissionsToRequest.add(Manifest.permission.CAMERA);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.READ_MEDIA_IMAGES);
        } else {
            permissionsToRequest.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        }

        ArrayList<String> permissionsNotGranted = new ArrayList<>();
        for (String permission : permissionsToRequest) {
            if (ContextCompat.checkSelfPermission(requireContext(), permission) != PackageManager.PERMISSION_GRANTED) {
                permissionsNotGranted.add(permission);
            }
        }

        if (permissionsNotGranted.isEmpty()) {
            showImageSourceDialog();
        } else {
            requestPermissionsLauncher.launch(permissionsNotGranted.toArray(new String[0]));
        }
    }

    private void showImageSourceDialog() {
        if (!isAdded()) return;
        final CharSequence[] items = {"Tirar foto", "Escolher da galeria"};
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Adicionar foto da placa")
                .setItems(items, (dialog, item) -> {
                    if (item == 0) {
                        Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        imageLauncher.launch(cameraIntent);
                    } else {
                        Intent galleryIntent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                        imageLauncher.launch(galleryIntent);
                    }
                })
                .show();
    }

    private void processImage(Bitmap bitmap) {
        InputImage image = InputImage.fromBitmap(bitmap, 0);
        textRecognizer.process(image)
                .addOnSuccessListener(visionText -> {
                    String licensePlate = findLicensePlate(visionText);
                    if (licensePlate != null) {
                        editTextPlate.setText(licensePlate);
                        navigateToDetail(licensePlate);
                    } else {
                        Toast.makeText(getContext(), "Nenhuma placa encontrada.", Toast.LENGTH_SHORT).show();
                    }
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Erro no reconhecimento de texto", e);
                    Toast.makeText(getContext(), "Falha ao ler a imagem.", Toast.LENGTH_SHORT).show();
                });
    }

    private String findLicensePlate(Text visionText) {
        Pattern pattern = Pattern.compile("([A-Z]{3}[0-9][A-Z][0-9]{2})|([A-Z]{3}[0-9]{4})");
        for (Text.TextBlock block : visionText.getTextBlocks()) {
            String cleanBlockText = block.getText().replaceAll("[\\s-.,'\"`´~]", "").toUpperCase();
            Matcher matcher = pattern.matcher(cleanBlockText);
            if (matcher.find()) {
                return matcher.group();
            }
        }
        return null;
    }

    private void fetchAllVehicles() {
        showLoading(true);
        apiService.getAllVehicles().enqueue(new Callback<VehicleResponse>() {
            @Override
            public void onResponse(Call<VehicleResponse> call, Response<VehicleResponse> response) {
                showLoading(false);
                if (response.isSuccessful() && response.body() != null && response.body().getContent() != null) {
                    updateList(response.body().getContent());
                } else {
                    showError("Falha ao carregar veículos.");
                }
            }

            @Override
            public void onFailure(Call<VehicleResponse> call, Throwable t) {
                showLoading(false);
                showError(t.getMessage());
            }
        });
    }

    private void navigateToDetail(String plate) {
        NavDestination currentDestination = navController.getCurrentDestination();
        if (currentDestination != null && currentDestination.getId() == R.id.navigation_search) {
            Bundle bundle = new Bundle();
            bundle.putString("plate", plate);
            navController.navigate(R.id.action_search_to_detail, bundle);
        }
    }

    private void updateList(List<Vehicle> vehicles) {
        if (vehicles.isEmpty()) {
            textSearchStatus.setVisibility(View.VISIBLE);
            textSearchStatus.setText("Nenhum veículo encontrado.");
            recyclerView.setVisibility(View.GONE);
        } else {
            textSearchStatus.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
            vehicleAdapter.setVehicles(vehicles);
        }
    }

    private void showLoading(boolean isLoading) {
        progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
    }

    private void showError(String message) {
        textSearchStatus.setVisibility(View.VISIBLE);
        recyclerView.setVisibility(View.GONE);
        textSearchStatus.setText(message);
    }

    @Override
    public void onVehicleClick(Vehicle vehicle) {
        navigateToDetail(vehicle.getPlaca());
    }

    private void hideKeyboard() {
        if (getContext() == null || getActivity() == null) return;
        InputMethodManager imm = (InputMethodManager) getContext().getSystemService(Activity.INPUT_METHOD_SERVICE);
        View view = getActivity().getCurrentFocus();
        if (view == null) view = new View(requireContext());
        imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (textRecognizer != null) {
            textRecognizer.close();
        }
    }
}
