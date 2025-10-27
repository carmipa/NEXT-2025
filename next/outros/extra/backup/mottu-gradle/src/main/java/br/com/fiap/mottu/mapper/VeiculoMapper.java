package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.mottu.model.Veiculo;

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING
)
public interface VeiculoMapper {

    @Mapping(target = "idVeiculo", ignore = true)
    @Mapping(target = "clienteVeiculos", ignore = true)
    @Mapping(target = "veiculoBoxes", ignore = true)
    @Mapping(target = "veiculoPatios", ignore = true)
    @Mapping(target = "veiculoRastreamentos", ignore = true)
    @Mapping(target = "veiculoZonas", ignore = true)
    // Mapeia diretamente o campo tagBleId do DTO para a entidade
    @Mapping(source = "tagBleId", target = "tagBleId")
    @Mapping(source = "status", target = "status")
    Veiculo toEntity(VeiculoRequestDto veiculoRequestDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idVeiculo", ignore = true)
    @Mapping(target = "clienteVeiculos", ignore = true)
    @Mapping(target = "veiculoBoxes", ignore = true)
    @Mapping(target = "veiculoPatios", ignore = true)
    @Mapping(target = "veiculoRastreamentos", ignore = true)
    @Mapping(target = "veiculoZonas", ignore = true)
    // Mapeia diretamente o campo tagBleId do DTO para a entidade
    @Mapping(source = "tagBleId", target = "tagBleId")
    @Mapping(source = "status", target = "status")
    Veiculo partialUpdate(VeiculoRequestDto veiculoRequestDto, @MappingTarget Veiculo veiculo);

    // Mapeia diretamente o campo tagBleId da entidade para o DTO de resposta
    @Mapping(source = "tagBleId", target = "tagBleId")
    @Mapping(source = "status", target = "status")
    VeiculoResponseDto toResponseDto(Veiculo veiculo);
}
