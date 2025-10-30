// src/main/java/br/com/fiap/mottu/controller/EstacionamentoController.java
package br.com.fiap.mottu.controller;

import br.com.fiap.mottu.dto.box.BoxResponseDto;
import br.com.fiap.mottu.mapper.BoxMapper;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.service.EstacionamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estacionamento")
@Tag(name = "Estacionamento", description = "Operações de estacionar e liberar vagas")
public class EstacionamentoController {

    private final EstacionamentoService estacionamentoService;
    private final BoxMapper boxMapper;

    @Autowired
    public EstacionamentoController(EstacionamentoService estacionamentoService, BoxMapper boxMapper) {
        this.estacionamentoService = estacionamentoService;
        this.boxMapper = boxMapper;
    }

    @Operation(summary = "Armazenar Moto", description = "Encontra uma vaga livre e estaciona a moto correspondente à placa.")
    @PostMapping("/estacionar")
    public ResponseEntity<BoxResponseDto> estacionarMoto(@RequestParam String placa) {
        Box vaga = estacionamentoService.parkMoto(placa);
        return ResponseEntity.ok(boxMapper.toResponseDto(vaga));
    }

    @Operation(summary = "Liberar Vaga", description = "Libera a vaga ocupada pela moto correspondente à placa.")
    @PostMapping("/liberar")
    public ResponseEntity<Void> liberarVaga(@RequestParam String placa) {
        estacionamentoService.releaseSpot(placa);
        return ResponseEntity.noContent().build();
    }
}