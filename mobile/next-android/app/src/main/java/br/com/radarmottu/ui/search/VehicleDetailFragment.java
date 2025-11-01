package br.com.radarmottu.ui.search;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import br.com.radarmottu.R;
import br.com.radarmottu.model.Vehicle;
import br.com.radarmottu.model.VehicleResponse;
import br.com.radarmottu.network.ApiService;
import br.com.radarmottu.network.RetrofitClients;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class VehicleDetailFragment extends Fragment {

    private static final String TAG = "VehicleDetailFragment";
    private String plate;
    private Vehicle currentVehicle;
    private View cardView;
    private NavController navController;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            plate = getArguments().getString("plate");
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_vehicle_detail, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        navController = NavHostFragment.findNavController(this);
        cardView = view.findViewById(R.id.card_vehicle_details);
        FloatingActionButton fabShare = view.findViewById(R.id.fab_share);

        fabShare.setOnClickListener(v -> shareVehicleDetails());

        if (plate != null) {
            fetchVehicleDetails(plate);
        }
    }

    private void shareVehicleDetails() {
        if (cardView == null) {
            Toast.makeText(getContext(), "Detalhes do veículo não carregados.", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            Bitmap bitmap = captureView(cardView);
            Uri contentUri = saveBitmapToFile(bitmap);

            if (contentUri != null) {
                shareImage(contentUri);
            } else {
                Toast.makeText(getContext(), "Erro ao preparar a imagem para compartilhamento.", Toast.LENGTH_SHORT).show();
            }

        } catch (Exception e) {
            Log.e(TAG, "Erro ao processar compartilhamento", e);
            Toast.makeText(getContext(), "Falha ao compartilhar: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private Bitmap captureView(View view) {
        Bitmap bitmap = Bitmap.createBitmap(view.getWidth(), view.getHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        view.draw(canvas);
        return bitmap;
    }

    private Uri saveBitmapToFile(Bitmap bitmap) throws IOException {
        Context context = requireContext();
        File imagesFolder = new File(context.getCacheDir(), "images");
        imagesFolder.mkdirs();

        File file = new File(imagesFolder, "vehicle_details_share.png");

        try (FileOutputStream fos = new FileOutputStream(file)) {
            bitmap.compress(Bitmap.CompressFormat.PNG, 90, fos);
            fos.flush();
        }

        return FileProvider.getUriForFile(context,
                context.getApplicationContext().getPackageName() + ".provider",
                file);
    }

    private void shareImage(Uri uri) {
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("image/png");
        shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        if (currentVehicle != null) {
            shareIntent.putExtra(Intent.EXTRA_TEXT, "Detalhes da Moto: " + currentVehicle.getPlaca());
        }

        startActivity(Intent.createChooser(shareIntent, "Compartilhar detalhes do veículo via..."));
    }

    private void fetchVehicleDetails(String plate) {
        ApiService apiService = RetrofitClients.javaApi();
        apiService.searchVehicleByPlate(plate).enqueue(new Callback<VehicleResponse>() {
            @Override
            public void onResponse(Call<VehicleResponse> call, Response<VehicleResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getContent() != null && !response.body().getContent().isEmpty()) {
                    currentVehicle = response.body().getContent().get(0);
                    populateCard(currentVehicle);
                } else {
                    showNotFoundDialog();
                }
            }

            @Override
            public void onFailure(Call<VehicleResponse> call, Throwable t) {
                showNotFoundDialog();
            }
        });
    }

    private void showNotFoundDialog() {
        if (!isAdded()) return;
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Veículo Não Encontrado")
                .setMessage("A placa '" + plate + "' não foi encontrada. Deseja cadastrar uma nova moto?")
                .setNegativeButton("Não", (dialog, which) -> navController.popBackStack())
                .setPositiveButton("Sim", (dialog, which) -> {
                    Bundle bundle = new Bundle();
                    bundle.putString("plate", plate);
                    navController.navigate(R.id.navigation_register_vehicle, bundle);
                })
                .setCancelable(false)
                .show();
    }

    private void populateCard(Vehicle v) {
        if (cardView == null) return;
        ((TextView) cardView.findViewById(R.id.tv_placa)).setText(getString(R.string.detail_placa, safe(v.getPlaca())));
        ((TextView) cardView.findViewById(R.id.tv_renavam)).setText(getString(R.string.detail_renavam, safe(v.getRenavam())));
        ((TextView) cardView.findViewById(R.id.tv_chassi)).setText(getString(R.string.detail_chassi, safe(v.getChassi())));
        ((TextView) cardView.findViewById(R.id.tv_modelo)).setText(getString(R.string.detail_modelo, safe(v.getModelo())));
        ((TextView) cardView.findViewById(R.id.tv_fabricante)).setText(getString(R.string.detail_fabricante, safe(v.getFabricante())));
        ((TextView) cardView.findViewById(R.id.tv_ano)).setText(getString(R.string.detail_ano, String.valueOf(v.getAno())));
        ((TextView) cardView.findViewById(R.id.tv_motor)).setText(getString(R.string.detail_motor, safe(v.getMotor())));
        ((TextView) cardView.findViewById(R.id.tv_combustivel)).setText(getString(R.string.detail_combustivel, safe(v.getCombustivel())));
        ((TextView) cardView.findViewById(R.id.tv_status)).setText(getString(R.string.detail_status, "-")); // Status não está no JSON
        ((TextView) cardView.findViewById(R.id.tv_tag_ble)).setText(getString(R.string.detail_tag_ble, safe(v.getTagBleId())));
    }

    private String safe(String s) {
        return (s == null || s.trim().isEmpty()) ? "-" : s;
    }
}
