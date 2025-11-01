
# Análise do Erro de Compilação na Navegação

## 1. Resumo do Problema

O projeto está enfrentando um erro de compilação do tipo `error: cannot find symbol`. Este erro ocorre em dois locais diferentes, mas pela mesma razão:

1.  **`RegisterVehicleFragment.java`**: Ao tentar navegar para a tela de detalhes após um cadastro bem-sucedido.
2.  **`VehicleDetailFragment.java`**: Ao tentar navegar para a tela de cadastro quando um veículo não é encontrado.

O erro específico é que o compilador não consegue encontrar a variável que representa a **ação de navegação** (ex: `R.id.action_register_to_detail`).

## 2. Causa Raiz

A causa do problema é uma instabilidade no sistema de build do Android. Os IDs para os destinos de navegação (`<fragment android:id="@+id/navigation_..."/>`) são sempre gerados de forma confiável no arquivo `R.java`.

No entanto, os IDs para as **ações** de navegação (`<action android:id="@+id/action_..."/>`) podem, por vezes, não ser gerados ou reconhecidos corretamente pelo sistema de build, resultando no erro `cannot find symbol`, mesmo que o ID esteja definido corretamente no arquivo XML.

## 3. Solução Proposta

A solução mais robusta é contornar a dependência do ID da **ação**. Em vez disso, navegamos diretamente para o ID do **destino** e, se necessário, configuramos o comportamento da pilha de navegação (como `popUpTo`) programaticamente usando `NavOptions`.

- **No `RegisterVehicleFragment`:** Trocar `navController.navigate(R.id.action_register_to_detail, bundle);` por uma navegação que usa o ID do destino (`R.id.navigation_vehicle_detail`) e configura o `popUpTo` via `NavOptions`.
- **No `VehicleDetailFragment`:** Trocar `navController.navigate(R.id.action_detail_to_register, bundle);` por uma navegação direta para o destino `R.id.navigation_register_vehicle`.

Esta abordagem resolve o erro de compilação de forma definitiva.

## 4. Código dos Arquivos Relevantes

Abaixo estão os trechos de código dos arquivos envolvidos no momento do erro.

---

### **`app/src/main/res/navigation/mobile_navigation.xml`**

Este arquivo mostra a estrutura de navegação completa, incluindo os destinos e as ações que estão causando o problema.

```xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/mobile_navigation"
    app:startDestination="@+id/navigation_home">

    <fragment
        android:id="@+id/navigation_home"
        android:name="br.com.radarmottu.ui.home.HomeFragment"
        android:label="@string/title_home" />

    <fragment
        android:id="@+id/navigation_search"
        android:name="br.com.radarmottu.ui.search.SearchFragment"
        android:label="@string/title_search">
        <action
            android:id="@+id/action_search_to_detail"
            app:destination="@id/navigation_vehicle_detail" />
        <action
            android:id="@+id/action_search_to_register"
            app:destination="@id/navigation_register_vehicle" />
    </fragment>

    <fragment
        android:id="@+id/navigation_tracking"
        android:name="br.com.radarmottu.ui.tracking.TrackingFragment"
        android:label="@string/title_tracking"
        tools:layout="@layout/fragment_tracking" />

    <fragment
        android:id="@+id/navigation_cartesian"
        android:name="br.com.radarmottu.ui.cartesian.CartesianFragment"
        android:label="@string/title_cartesian"
        tools:layout="@layout/fragment_cartesian" />

    <fragment
        android:id="@+id/navigation_about"
        android:name="br.com.radarmottu.ui.about.AboutFragment"
        android:label="@string/title_about"
        tools:layout="@layout/fragment_about" />

    <fragment
        android:id="@+id/navigation_vehicle_detail"
        android:name="br.com.radarmottu.ui.search.VehicleDetailFragment"
        android:label="Detalhes do Veículo">
        <argument
            android:name="plate"
            app:argType="string" />
        <!-- Ação que causa o erro no VehicleDetailFragment -->
        <action
            android:id="@+id/action_detail_to_register"
            app:destination="@id/navigation_register_vehicle" />
    </fragment>

    <fragment
        android:id="@+id/navigation_register_vehicle"
        android:name="br.com.radarmottu.ui.search.RegisterVehicleFragment"
        android:label="Cadastrar Veículo">
        <argument
            android:name="plate"
            app:argType="string"
            app:nullable="true"
            android:defaultValue="" />
        <!-- Ação que causa o erro no RegisterVehicleFragment -->
        <action
            android:id="@+id/action_register_to_detail"
            app:destination="@id/navigation_vehicle_detail"
            app:popUpTo="@id/navigation_search" />
    </fragment>

</navigation>
```

---

### **`app/src/main/java/br/com/radarmottu/ui/search/RegisterVehicleFragment.java` (Problemático)**

O erro ocorre dentro do método `onResponse`, na chamada `navController.navigate`.

```java
// ... (imports)

public class RegisterVehicleFragment extends Fragment {
    // ... (variáveis)

    private void registerVehicle() {
        // ... (criação do objeto vehicle)

        apiService.registerVehicle(vehicle).enqueue(new Callback<Vehicle>() {
            @Override
            public void onResponse(Call<Vehicle> call, Response<Vehicle> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(getContext(), "Veículo salvo com sucesso!", Toast.LENGTH_SHORT).show();
                    
                    Bundle bundle = new Bundle();
                    bundle.putString("plate", response.body().getPlaca());
                    
                    // ERRO AQUI: "cannot find symbol: variable action_register_to_detail"
                    navController.navigate(R.id.action_register_to_detail, bundle);
                } else {
                    Toast.makeText(getContext(), "Falha ao salvar veículo.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Vehicle> call, Throwable t) {
                Toast.makeText(getContext(), "Erro: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
```

---

### **`app/src/main/java/br/com/radarmottu/ui/search/VehicleDetailFragment.java` (Problemático)**

O erro ocorre dentro do método `showNotFoundDialog`, no `setPositiveButton`.

```java
// ... (imports)

public class VehicleDetailFragment extends Fragment {
    // ... (variáveis)

    private void showNotFoundDialog() {
        if (!isAdded()) return;
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Veículo Não Encontrado")
                .setMessage("A placa '" + plate + "' não foi encontrada. Deseja cadastrar uma nova moto?")
                .setNegativeButton("Não", (dialog, which) -> navController.popBackStack())
                .setPositiveButton("Sim", (dialog, which) -> {
                    Bundle bundle = new Bundle();
                    bundle.putString("plate", plate);

                    // ERRO AQUI: "cannot find symbol: variable action_detail_to_register"
                    navController.navigate(R.id.action_detail_to_register, bundle);
                })
                .setCancelable(false)
                .show();
    }
    
    // ... (resto do código)
}
```
