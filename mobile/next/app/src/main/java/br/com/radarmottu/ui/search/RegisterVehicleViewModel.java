package br.com.radarmottu.ui.search;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import br.com.radarmottu.model.Vehicle;

public class RegisterVehicleViewModel extends ViewModel {

    private final List<String> marcas = Arrays.asList("Honda", "Yamaha", "Shineray", "Haojue", "Bajaj", "Mottu");
    private final Map<String, List<String>> modelosPorMarca = new HashMap<>();
    private final List<String> cilindradas = Arrays.asList("110cc", "125cc", "150cc", "160cc", "200cc", "250cc", "300cc");
    private final List<String> tiposCombustivel = Arrays.asList("Gasolina", "Flex");
    private final List<String> vehicleStatusOptions = Arrays.asList("OPERACIONAL", "EM MANUTENÇÃO", "INATIVO");

    private final MutableLiveData<List<String>> _modelosDisponiveis = new MutableLiveData<>();
    public LiveData<List<String>> modelosDisponiveis = _modelosDisponiveis;

    public final MutableLiveData<Vehicle> formData = new MutableLiveData<>(new Vehicle());

    public RegisterVehicleViewModel() {
        initModelos();
    }

    private void initModelos() {
        modelosPorMarca.put("Honda", Arrays.asList("CG 160 Start", "Pop 110i", "Biz 125", "NXR 160 Bros", "CB 300F Twister"));
        modelosPorMarca.put("Yamaha", Arrays.asList("Factor 150 UBS", "Fazer FZ15 ABS", "NMax 160 ABS", "Crosser 150 S", "Lander 250 ABS"));
        modelosPorMarca.put("Shineray", Arrays.asList("Worker 125", "Worker 150 Cross"));
        modelosPorMarca.put("Haojue", Arrays.asList("DK 150 CBS", "DR 160"));
        modelosPorMarca.put("Bajaj", Arrays.asList("Dominar 160", "Dominar 200"));
        modelosPorMarca.put("Mottu", Collections.singletonList("Mottu Sport 110i"));
    }

    public List<String> getMarcas() {
        return marcas;
    }

    public List<String> getCilindradas() {
        return cilindradas;
    }

    public List<String> getTiposCombustivel() {
        return tiposCombustivel;
    }

    public List<String> getVehicleStatusOptions() {
        return vehicleStatusOptions;
    }

    public void onMarcaSelecionada(String marca) {
        _modelosDisponiveis.setValue(modelosPorMarca.get(marca));
    }
}
