// Caminho do arquivo: br\com\fiap\mottu\mapper\VeiculoMapper.java
package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.mottu.model.Veiculo;

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

// Importe os mappers das entidades relacionadas se VeiculoRequestDto ou VeiculoResponseDto tiverem DTOs aninhados ou coleções de DTOs delas
// import br.com.fiap.mottu.mapper.relacionamento.ClienteVeiculoMapper;
// import br.com.fiap.mottu.mapper.relacionamento.VeiculoBoxMapper;
// import br.com.fiap.mottu.mapper.relacionamento.VeiculoPatioMapper;
// import br.com.fiap.mottu.mapper.relacionamento.VeiculoRastreamentoMapper;
// import br.com.fiap.mottu.mapper.relacionamento.VeiculoZonaMapper;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING
        // Adicione aqui o 'uses' se VeiculoRequestDto ou VeiculoResponseDto incluirem DTOs aninhados ou coleções
        // uses = { ClienteVeiculoMapper.class, VeiculoBoxMapper.class, VeiculoPatioMapper.class, VeiculoRastreamentoMapper.class, VeiculoZonaMapper.class }
)
public interface VeiculoMapper {

    // Método 1: Converte de Request DTO para Entidade (para CRIAR uma nova)
    @Mapping(target = "idVeiculo", ignore = true) // ID é gerado pelo BD
    @Mapping(target = "clienteVeiculos", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "veiculoBoxes", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "veiculoPatios", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "veiculoRastreamentos", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "veiculoZonas", ignore = true) // Relacionamento inverso não é mapeado na criação
    Veiculo toEntity(VeiculoRequestDto veiculoRequestDto);

    // Método 2: Atualização de uma Entidade existente a partir de Request DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idVeiculo", ignore = true) // ID não é atualizado
    @Mapping(target = "clienteVeiculos", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "veiculoBoxes", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "veiculoPatios", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "veiculoRastreamentos", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "veiculoZonas", ignore = true) // Relacionamento inverso não é atualizado
    Veiculo partialUpdate(VeiculoRequestDto veiculoRequestDto, @MappingTarget Veiculo veiculo);

    // Método 3: Converte de Entidade para DTO de Resposta (ESSENCIAL para consultas)
    VeiculoResponseDto toResponseDto(Veiculo veiculo);

    // --- Métodos para mapear coleções (opcional) ---
    // List<VeiculoResponseDto> toResponseDtoList(List<Veiculo> veiculos);
    // Set<VeiculoResponseDto> toResponseDtoSet(Set<Veiculo> veiculos);
}