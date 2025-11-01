package br.com.radarmottu.ui.about;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import br.com.radarmottu.R;

public class AboutFragment extends Fragment {

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_about, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Mapeamento dos botões/links
        Button linkRepoCentral = view.findViewById(R.id.link_repo_central);
        Button linkRepoMobile = view.findViewById(R.id.link_repo_mobile);
        Button linkPaulo = view.findViewById(R.id.link_paulo);
        Button linkArthur = view.findViewById(R.id.link_arthur);
        Button linkJoao = view.findViewById(R.id.link_joao);


        // URLs fornecidas
        String urlRepoCentral = "https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1";
        String urlRepoMobile = "https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1/tree/main/Mobile_Application_Development";
        String urlPaulo = "https://github.com/carmipa";
        String urlArthur = "https://github.com/ArthurBispo00";
        String urlJoao = "https://github.com/joao1015";

        // Configuração dos listeners de clique
        linkRepoCentral.setOnClickListener(v -> openUrl(urlRepoCentral));
        linkRepoMobile.setOnClickListener(v -> openUrl(urlRepoMobile));
        linkPaulo.setOnClickListener(v -> openUrl(urlPaulo));
        linkArthur.setOnClickListener(v -> openUrl(urlArthur));
        linkJoao.setOnClickListener(v -> openUrl(urlJoao));
    }

    // Método auxiliar para abrir um link no navegador
    private void openUrl(String url) {
        if (url == null || url.isEmpty()) return;
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(url));
        startActivity(intent);
    }
}