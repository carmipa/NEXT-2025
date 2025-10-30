package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.dto.box.BoxResponseDto;
import br.com.fiap.mottu.model.Box;

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {PatioMapper.class} // NOVO: Adicionar PatioMapper aqui, se necessário para o DTO (não estritamente necessário para esta feature, mas boa prática para o gráfico de dependências)
)
public interface BoxMapper {

    // Método 1: Converte de Request DTO para Entidade (para CRIAR uma nova)
    @Mapping(target = "idBox", ignore = true)
    @Mapping(target = "veiculoBoxes", ignore = true)
    @Mapping(target = "patio", ignore = true)
    Box toEntity(BoxRequestDto boxRequestDto);

    // Método 2: Atualização de uma Entidade existente a partir de um Request DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idBox", ignore = true)
    @Mapping(target = "veiculoBoxes", ignore = true)
    @Mapping(target = "patio", ignore = true)
    Box partialUpdate(BoxRequestDto boxRequestDto, @MappingTarget Box box);

    @Mapping(target = "patioId", source = "patio.idPatio")
    BoxResponseDto toResponseDto(Box box);
    // --- Métodos para mapear coleções (opcional) ---
    // List<BoxResponseDto> toResponseDtoList(List<Box> boxes);
    // Set<BoxResponseDto> toResponseDtoSet(Set<Box> boxes);
}