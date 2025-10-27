package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.patio.PatioRequestDto;
import br.com.fiap.mottu.dto.patio.PatioResponseDto;
import br.com.fiap.mottu.model.Patio;

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {BoxMapper.class} // NOVO: Adicionar BoxMapper aqui
)
public interface PatioMapper {

    // Método 1: Converte de Request DTO para Entidade (para CRIAR uma nova)
    @Mapping(target = "idPatio", ignore = true) // ID é gerado pelo BD
    @Mapping(target = "contatoPatios", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "enderecoPatios", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "veiculoPatios", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "zonaPatios", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "patioBoxes", ignore = true) // NOVO: Ignorar coleção de relacionamento muitos-para-muitos
    Patio toEntity(PatioRequestDto patioRequestDto);

    // Método 2: Atualização de uma Entidade existente a partir de Request DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idPatio", ignore = true) // ID não é atualizado
    @Mapping(target = "contatoPatios", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "enderecoPatios", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "veiculoPatios", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "zonaPatios", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "patioBoxes", ignore = true) // NOVO: Ignorar coleção de relacionamento muitos-para-muitos
    Patio partialUpdate(PatioRequestDto patioRequestDto, @MappingTarget Patio patio);

    // Método 3: Converte de Entidade para DTO de Resposta (ESSENCIAL para consultas)
    PatioResponseDto toResponseDto(Patio patio);
    // List<PatioResponseDto> toResponseDtoList(List<Patio> patios);
    // Set<PatioResponseDto> toResponseDtoSet(Set<Patio> patios);
}