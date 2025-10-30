package br.com.fiap.mottu.controller.relatorios;

import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoDto;
import br.com.fiap.mottu.dto.relatorio.manutencao.ManutencaoResumoPatioDto;
import br.com.fiap.mottu.service.relatorios.manutencao.ManutencaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios/manutencao")
public class ManutencaoStreamController {

    private static final Logger log = LoggerFactory.getLogger(ManutencaoStreamController.class);
    private final ManutencaoService manutencaoService;

    public ManutencaoStreamController(ManutencaoService manutencaoService) {
        this.manutencaoService = manutencaoService;
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Map<String, Object>> streamResumo() {
        log.debug("Cliente conectado ao stream de manutenção");
        return Flux.interval(Duration.ZERO, Duration.ofSeconds(5))
                .map(t -> snapshot())
                .onErrorContinue((err, obj) -> log.warn("Erro no stream de manutenção: {}", err.toString()));
    }

    private Map<String, Object> snapshot() {
        ManutencaoResumoDto resumo = manutencaoService.obterResumo();
        List<ManutencaoResumoPatioDto> porPatio = manutencaoService.resumoPorPatio();
        Map<String, Object> m = new HashMap<>();
        m.put("resumo", resumo);
        m.put("porPatio", porPatio);
        m.put("timestamp", System.currentTimeMillis());
        return m;
    }
}


