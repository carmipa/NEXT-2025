package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.veiculo.VeiculoLocalizacaoResponseDto;
import br.com.fiap.mottu.service.VeiculoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;

/**
 * SSE para atualização de veículos estacionados em tempo real.
 */
@RestController
@RequestMapping("/api/veiculos/estacionados")
public class VeiculoStreamController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoStreamController.class);
    private final VeiculoService veiculoService;

    public VeiculoStreamController(VeiculoService veiculoService) {
        this.veiculoService = veiculoService;
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<List<VeiculoLocalizacaoResponseDto>> streamVeiculosEstacionados() {
        log.debug("Cliente conectado ao stream de veículos estacionados");
        return Flux.interval(Duration.ofSeconds(2))
                .map(tick -> veiculoService.listarVeiculosEstacionados())
                .onErrorContinue((err, obj) -> log.warn("Erro no stream de estacionados: {}", err.toString()))
                .doOnCancel(() -> log.info("Cliente desconectou do stream de estacionados"));
    }
}








