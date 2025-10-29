// Caminho do arquivo: br\com\fiap\mottu\external\viacep\ViaCepService.java
package br.com.fiap.mottu.external.viacep; // Pacote atualizado

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono; // Para trabalhar com WebClient (assíncrono)

@Service
public class ViaCepService {

    private final WebClient webClient;

    public ViaCepService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://viacep.com.br/ws/").build();
    }

    public Mono<ViaCepResponse> buscarEnderecoPorCep(String cep) {
        String cleanCep = cep.replaceAll("[^0-9]", "");

        if (cleanCep.length() != 8) {
            return Mono.error(new IllegalArgumentException("CEP inválido. Deve conter 8 dígitos."));
        }

        return webClient.get()
                .uri("/{cep}/json/", cleanCep)
                .retrieve()
                .bodyToMono(ViaCepResponse.class)
                .flatMap(response -> {
                    if (response.getErro() != null && response.getErro()) {
                        return Mono.empty();
                    }
                    return Mono.just(response);
                });
    }
}