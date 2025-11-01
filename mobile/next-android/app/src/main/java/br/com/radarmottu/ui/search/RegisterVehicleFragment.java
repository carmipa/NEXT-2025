package br.com.radarmottu.ui.search;

import android.app.DatePickerDialog;
import android.content.Context;
import android.os.Bundle;
import android.text.Editable;
import android.text.InputFilter;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.lang.reflect.Field;
import java.util.Calendar;

import br.com.radarmottu.R;
import br.com.radarmottu.model.TagBleResponse;
import br.com.radarmottu.model.Vehicle;
import br.com.radarmottu.network.ApiService;
import br.com.radarmottu.network.RetrofitClients;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterVehicleFragment extends Fragment {

    private static final String TAG = "RegisterVehicleFragment";
    private RegisterVehicleViewModel viewModel;
    private NavController navController;
    private ApiService apiService;

    private TextInputEditText etPlaca, etRenavam, etChassi, etAno, etTagBle;
    private AutoCompleteTextView actFabricante, actModelo, actMotor, actCombustivel, actStatus;
    private Button btnSave, btnCancel, btnGenerateTag;
    private TextInputLayout tilPlaca, tilRenavam, tilChassi, tilAno, tilFabricante, tilModelo, tilMotor, tilCombustivel, tilStatus;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new ViewModelProvider(this).get(RegisterVehicleViewModel.class);
        apiService = RetrofitClients.javaApi();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_register_vehicle, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        navController = NavHostFragment.findNavController(this);
        bindViews(view);
        setupInitialData();
        setupListeners();
        setupDropdowns();
        setupInputFilters();
        setupTextWatchers();
        observeViewModel();
    }

    private void bindViews(View view) {
        etPlaca = view.findViewById(R.id.et_reg_placa);
        etRenavam = view.findViewById(R.id.et_reg_renavam);
        etChassi = view.findViewById(R.id.et_reg_chassi);
        etAno = view.findViewById(R.id.et_reg_ano);
        actFabricante = view.findViewById(R.id.act_reg_fabricante);
        actModelo = view.findViewById(R.id.act_reg_modelo);
        actMotor = view.findViewById(R.id.act_reg_motor);
        actCombustivel = view.findViewById(R.id.act_reg_combustivel);
        actStatus = view.findViewById(R.id.act_reg_status);
        etTagBle = view.findViewById(R.id.et_reg_tag_ble);
        btnSave = view.findViewById(R.id.btn_register);
        btnCancel = view.findViewById(R.id.btn_cancel);
        btnGenerateTag = view.findViewById(R.id.btn_auto_tag);
        
        // Bind TextInputLayouts for validation
        tilPlaca = view.findViewById(R.id.til_reg_placa);
        tilRenavam = view.findViewById(R.id.til_reg_renavam);
        tilChassi = view.findViewById(R.id.til_reg_chassi);
        tilAno = view.findViewById(R.id.til_reg_ano);
        tilFabricante = (TextInputLayout) actFabricante.getParent().getParent();
        tilModelo = (TextInputLayout) actModelo.getParent().getParent();
        tilMotor = (TextInputLayout) actMotor.getParent().getParent();
        tilCombustivel = (TextInputLayout) actCombustivel.getParent().getParent();
        tilStatus = (TextInputLayout) actStatus.getParent().getParent();
    }

    private void setupInitialData() {
        if (getArguments() != null) {
            String plate = getArguments().getString("plate");
            if (plate != null) {
                Vehicle data = viewModel.formData.getValue();
                if (data == null) data = new Vehicle();
                data.setPlaca(plate);
                viewModel.formData.setValue(data);
            }
        }
    }

    private void setupListeners() {
        btnSave.setOnClickListener(v -> saveVehicle());
        if (btnCancel != null) btnCancel.setOnClickListener(v -> navController.popBackStack());
        etAno.setOnClickListener(v -> showYearPickerDialog());
        btnGenerateTag.setOnClickListener(v -> generateAutoTag());
    }

    private void saveVehicle() {
        if (!isFormValid()) {
            Toast.makeText(getContext(), "Por favor, corrija os erros no formulário.", Toast.LENGTH_SHORT).show();
            return;
        }

        Vehicle data = viewModel.formData.getValue();
        apiService.registerVehicle(data).enqueue(new Callback<Vehicle>() {
            @Override
            public void onResponse(Call<Vehicle> call, Response<Vehicle> response) {
                if (!isAdded()) return;
                if (response.isSuccessful()) {
                    Toast.makeText(getContext(), "Veículo salvo com sucesso!", Toast.LENGTH_SHORT).show();
                    navController.popBackStack();
                } else {
                    showErrorToast(response.errorBody(), "Falha ao salvar veículo.");
                }
            }

            @Override
            public void onFailure(Call<Vehicle> call, Throwable t) {
                if (!isAdded()) return;
                Log.e(TAG, "Network error on save", t);
                Toast.makeText(getContext(), "Erro de rede: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showYearPickerDialog() {
        final Calendar c = Calendar.getInstance();
        int year = c.get(Calendar.YEAR);

        DatePickerDialog datePickerDialog = new DatePickerDialog(
                requireContext(),
                (view, selectedYear, monthOfYear, dayOfMonth) -> etAno.setText(String.valueOf(selectedYear)),
                year, c.get(Calendar.MONTH), c.get(Calendar.DAY_OF_MONTH));

        try {
            DatePicker datePicker = datePickerDialog.getDatePicker();
            datePicker.findViewById(getResources().getIdentifier("day", "id", "android")).setVisibility(View.GONE);
            datePicker.findViewById(getResources().getIdentifier("month", "id", "android")).setVisibility(View.GONE);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao customizar DatePicker", e);
        }

        hideKeyboard();
        datePickerDialog.show();
    }

    private void setupDropdowns() {
        actFabricante.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, viewModel.getMarcas()));
        actMotor.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, viewModel.getCilindradas()));
        actCombustivel.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, viewModel.getTiposCombustivel()));
        actStatus.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, viewModel.getVehicleStatusOptions()));

        actFabricante.setOnItemClickListener((parent, view, position, id) -> {
            viewModel.onMarcaSelecionada((String) parent.getItemAtPosition(position));
            actModelo.setText("", false);
        });
    }

    private void setupInputFilters() {
        etRenavam.setFilters(new InputFilter[]{new InputFilter.LengthFilter(11)});
        etChassi.setFilters(new InputFilter[]{new InputFilter.LengthFilter(17), new InputFilter.AllCaps()});
        etPlaca.setFilters(new InputFilter[]{new InputFilter.LengthFilter(7)});
    }

    private void setupTextWatchers() {
        TextWatcher formDataWatcher = new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override public void afterTextChanged(Editable s) {
                Vehicle data = viewModel.formData.getValue();
                if (data == null) data = new Vehicle();
                data.setPlaca(etPlaca.getText().toString().trim());
                data.setRenavam(etRenavam.getText().toString().trim());
                data.setChassi(etChassi.getText().toString().trim());
                try {
                    data.setAno(Integer.parseInt(etAno.getText().toString()));
                } catch (NumberFormatException e) {
                    data.setAno(0);
                }
                data.setFabricante(actFabricante.getText().toString().trim());
                data.setModelo(actModelo.getText().toString().trim());
                data.setMotor(actMotor.getText().toString().trim());
                data.setCombustivel(actCombustivel.getText().toString().trim());
                data.setStatus(actStatus.getText().toString().trim());
                data.setTagBleId(etTagBle.getText().toString().trim());
                viewModel.formData.setValue(data);
            }
        };

        etPlaca.addTextChangedListener(formDataWatcher);
        etRenavam.addTextChangedListener(formDataWatcher);
        etChassi.addTextChangedListener(formDataWatcher);
        etAno.addTextChangedListener(formDataWatcher);
        actFabricante.addTextChangedListener(formDataWatcher);
        actModelo.addTextChangedListener(formDataWatcher);
        actMotor.addTextChangedListener(formDataWatcher);
        actCombustivel.addTextChangedListener(formDataWatcher);
        actStatus.addTextChangedListener(formDataWatcher);
        etTagBle.addTextChangedListener(formDataWatcher);
    }

    private void observeViewModel() {
        viewModel.modelosDisponiveis.observe(getViewLifecycleOwner(), modelos -> {
            actModelo.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, modelos));
        });

        viewModel.formData.observe(getViewLifecycleOwner(), data -> {
            if (data == null) return;
            if (!etPlaca.getText().toString().equals(data.getPlaca())) etPlaca.setText(data.getPlaca());
            if (!etRenavam.getText().toString().equals(data.getRenavam())) etRenavam.setText(data.getRenavam());
            if (!etChassi.getText().toString().equals(data.getChassi())) etChassi.setText(data.getChassi());
            if (data.getAno() > 0 && !etAno.getText().toString().equals(String.valueOf(data.getAno()))) etAno.setText(String.valueOf(data.getAno()));
            if (!actFabricante.getText().toString().equals(data.getFabricante())) actFabricante.setText(data.getFabricante());
            if (!actModelo.getText().toString().equals(data.getModelo())) actModelo.setText(data.getModelo());
            if (!actMotor.getText().toString().equals(data.getMotor())) actMotor.setText(data.getMotor());
            if (!actCombustivel.getText().toString().equals(data.getCombustivel())) actCombustivel.setText(data.getCombustivel());
            if (!actStatus.getText().toString().equals(data.getStatus())) actStatus.setText(data.getStatus());
            if (!etTagBle.getText().toString().equals(data.getTagBleId())) etTagBle.setText(data.getTagBleId());
        });
    }

    private void generateAutoTag() {
        apiService.getNextTagBle().enqueue(new Callback<TagBleResponse>() {
            @Override
            public void onResponse(Call<TagBleResponse> call, Response<TagBleResponse> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null) {
                    Vehicle currentData = viewModel.formData.getValue();
                    if (currentData != null) {
                        currentData.setTagBleId(response.body().getTag());
                        viewModel.formData.setValue(currentData);
                    }
                } else {
                    showErrorToast(response.errorBody(), "Falha ao gerar tag.");
                }
            }

            @Override
            public void onFailure(Call<TagBleResponse> call, Throwable t) {
                if (!isAdded()) return;
                Log.e(TAG, "Network error on auto tag", t);
                Toast.makeText(getContext(), "Erro de rede: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private boolean isFormValid() {
        Vehicle data = viewModel.formData.getValue();
        if (data == null) return false; 

        boolean isValid = true;

        if (data.getPlaca() == null || data.getPlaca().length() < 7) {
            tilPlaca.setError("Placa inválida");
            isValid = false;
        } else {
            tilPlaca.setError(null);
        }

        if (data.getRenavam() == null || data.getRenavam().length() != 11) {
            tilRenavam.setError("RENAVAM deve ter 11 dígitos");
            isValid = false;
        } else {
            tilRenavam.setError(null);
        }

        if (data.getChassi() == null || data.getChassi().length() != 17) {
            tilChassi.setError("Chassi deve ter 17 caracteres");
            isValid = false;
        } else {
            tilChassi.setError(null);
        }

        if (data.getAno() < 1900) {
            tilAno.setError("Ano inválido");
            isValid = false;
        } else {
            tilAno.setError(null);
        }

        if (data.getFabricante() == null || data.getFabricante().isEmpty()) {
            tilFabricante.setError("Campo obrigatório");
            isValid = false;
        } else {
            tilFabricante.setError(null);
        }

        if (data.getModelo() == null || data.getModelo().isEmpty()) {
            tilModelo.setError("Campo obrigatório");
            isValid = false;
        } else {
            tilModelo.setError(null);
        }

        if (data.getMotor() == null || data.getMotor().isEmpty()) {
            tilMotor.setError("Campo obrigatório");
            isValid = false;
        } else {
            tilMotor.setError(null);
        }

        if (data.getCombustivel() == null || data.getCombustivel().isEmpty()) {
            tilCombustivel.setError("Campo obrigatório");
            isValid = false;
        } else {
            tilCombustivel.setError(null);
        }

        if (data.getStatus() == null || data.getStatus().isEmpty()) {
            tilStatus.setError("Campo obrigatório");
            isValid = false;
        } else {
            tilStatus.setError(null);
        }

        return isValid;
    }

    private void hideKeyboard() {
        InputMethodManager imm = (InputMethodManager) requireContext().getSystemService(Context.INPUT_METHOD_SERVICE);
        View view = requireActivity().getCurrentFocus();
        if (view != null) {
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    private void showErrorToast(Object errorBody, String defaultMessage) {
        if (isAdded() && getContext() != null) {
            Toast.makeText(getContext(), defaultMessage, Toast.LENGTH_LONG).show();
        } else {
            Log.w(TAG, "showErrorToast called but fragment is not attached. Message: " + defaultMessage);
        }
    }
}
