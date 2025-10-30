package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.dto.relatorio.OcupacaoAtualDto;
import br.com.fiap.mottu.service.relatorios.OcupacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/relatorios/ocupacao")
public class OcupacaoStreamController {

    private static final Logger log = LoggerFactory.getLogger(OcupacaoStreamController.class);
    private final OcupacaoService ocupacaoService;

    public OcupacaoStreamController(OcupacaoService ocupacaoService) {
        this.ocupacaoService = ocupacaoService;
    }

    /**
     * Stream Server-Sent Events com snapshots periódicos da ocupação dos pátios.
     * Atualiza a cada 5 segundos. Frontend pode consumir com EventSource.
     */
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<List<OcupacaoAtualDto>> streamOcupacao() {
        log.debug("Cliente conectado ao stream de ocupação");
        return Flux.interval(Duration.ZERO, Duration.ofSeconds(5))
                .map(tick -> ocupacaoService.getOcupacaoAtual())
                .doOnCancel(() -> log.info("Cliente desconectou do stream de ocupação"))
                .onErrorResume(err -> {
                    log.warn("Erro no stream de ocupação: {}", err.toString());
                    return Flux.empty();
                });
    }
}


