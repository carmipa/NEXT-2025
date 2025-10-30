// DTO
package br.com.fiap.mottu.dto.dashboard;
import java.time.LocalDate;
public record OcupacaoDiaDto(LocalDate dia, Long ocupados, Long livres) {}
