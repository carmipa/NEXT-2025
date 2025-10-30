// Caminho do arquivo: br\com\fiap\mottu\mapper\ZonaMapper.java
package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.zona.ZonaRequestDto;
import br.com.fiap.mottu.dto.zona.ZonaResponseDto;
import br.com.fiap.mottu.model.Zona;

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

// Importe os mappers das entidades relacionadas se ZonaRequestDto ou ZonaResponseDto tiverem DTOs aninhados ou coleções de DTOs delas
// import br.com.fiap.mottu.mapper.relacionamento.VeiculoZonaMapper;
// import br.com.fiap.mottu.mapper.relacionamento.ZonaBoxMapper;
// import br.com.fiap.mottu.mapper.relacionamento.ZonaPatioMapper;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING
        // Adicione aqui o 'uses' se ZonaRequestDto ou ZonaResponseDto incluirem DTOs aninhados ou coleções
        // uses = { VeiculoZonaMapper.class, ZonaBoxMapper.class, ZonaPatioMapper.class }
)
public interface ZonaMapper {

    // Método 1: Converte de Request DTO para Entidade (para CRIAR uma nova)
    @Mapping(target = "idZona", ignore = true)
    @Mapping(target = "patio", ignore = true)
    Zona toEntity(ZonaRequestDto zonaRequestDto);

    // Método 2: Atualização de uma Entidade existente a partir de Request DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idZona", ignore = true)
    @Mapping(target = "patio", ignore = true)
    Zona partialUpdate(ZonaRequestDto zonaRequestDto, @MappingTarget Zona zona);

    @Mapping(target = "patioId", source = "patio.idPatio")
    ZonaResponseDto toResponseDto(Zona zona);

    // --- Métodos para mapear coleções (opcional) ---
    // List<ZonaResponseDto> toResponseDtoList(List<Zona> zonas);
    // Set<ZonaResponseDto> toResponseDtoSet(Set<Zona> zonas);
}