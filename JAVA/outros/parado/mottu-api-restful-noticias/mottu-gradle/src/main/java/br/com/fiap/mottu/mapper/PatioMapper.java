// Caminho: src/main/java/br/com/fiap/mottu/mapper/PatioMapper.java
package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.patio.PatioRequestDto;
import br.com.fiap.mottu.dto.patio.PatioResponseDto;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Zona;
import org.mapstruct.*;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = { ContatoMapper.class, EnderecoMapper.class }
)
public interface PatioMapper {

    @Mapping(target = "idPatio", ignore = true)
    @Mapping(target = "veiculoPatios", ignore = true)
    @Mapping(target = "zonas", ignore = true)
    Patio toEntity(PatioRequestDto patioRequestDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idPatio", ignore = true)
    @Mapping(target = "veiculoPatios", ignore = true)
    @Mapping(target = "zonas", ignore = true)
    Patio partialUpdate(PatioRequestDto patioRequestDto, @MappingTarget Patio patio);

    PatioResponseDto toResponseDto(Patio patio);

    // Métodos específicos do wizard serão instanciados manualmente no service
}