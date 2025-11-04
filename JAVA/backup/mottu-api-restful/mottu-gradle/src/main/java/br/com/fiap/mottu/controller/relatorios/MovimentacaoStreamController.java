package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.dto.relatorio.MovimentacaoDiariaDto;
import br.com.fiap.mottu.service.relatorios.MovimentacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios/movimentacao")
public class MovimentacaoStreamController {

    private static final Logger log = LoggerFactory.getLogger(MovimentacaoStreamController.class);
    private final MovimentacaoService movimentacaoService;

    public MovimentacaoStreamController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

    /**
     * Stream SSE com snapshot de movimentação do dia (agregados + últimos detalhes).
     */
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Map<String, Object>> streamMovimentacaoDiaria() {
        log.debug("Cliente conectado ao stream de movimentação diária");
        return Flux.interval(Duration.ZERO, Duration.ofSeconds(5))
                .map(tick -> buildSnapshot())
                .doOnCancel(() -> log.info("Cliente desconectou do stream de movimentação"))
                .onErrorResume(err -> {
                    log.warn("Erro no stream de movimentação: {}", err.toString());
                    return Flux.empty();
                });
    }

    private Map<String, Object> buildSnapshot() {
        LocalDate hoje = LocalDate.now();
        List<MovimentacaoDiariaDto> diaria = movimentacaoService.getMovimentacaoDiaria(hoje, hoje);
        List<Object> detalhes = movimentacaoService.getDetalhesCompletos(hoje, hoje);
        int entradas = 0;
        int saidas = 0;
        if (!diaria.isEmpty()) {
            MovimentacaoDiariaDto d = diaria.get(0);
            entradas = d.getEntradas();
            saidas = d.getSaidas();
        }
        Map<String, Object> m = new HashMap<>();
        m.put("entradasHoje", entradas);
        m.put("saidasHoje", saidas);
        m.put("saldoLiquido", entradas - saidas);
        m.put("detalhes", detalhes);
        m.put("timestamp", System.currentTimeMillis());
        return m;
    }
}


