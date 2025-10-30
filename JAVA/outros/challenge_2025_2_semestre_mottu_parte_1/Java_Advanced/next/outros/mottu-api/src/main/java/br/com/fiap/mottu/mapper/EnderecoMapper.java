// Caminho do arquivo: br\com\fiap\mottu\mapper\EnderecoMapper.java
package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto;
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto;
import br.com.fiap.mottu.model.Endereco;

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

// Importe os mappers das entidades relacionadas se EnderecoResponseDto tiver DTOs aninhados ou coleções de DTOs delas
// import br.com.fiap.mottu.mapper.ClienteMapper; // Exemplo se EnderecoResponseDto incluir Cliente associado
// import br.com.fiap.mottu.mapper.relacionamento.EnderecoPatioMapper; // Exemplo se EnderecoResponseDto incluir Patio associado

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING
        // Adicione aqui o 'uses' se EnderecoResponseDto incluir DTOs aninhados ou coleções
        // uses = { ClienteMapper.class, EnderecoPatioMapper.class }
)
public interface EnderecoMapper {

    // Método 1: Converte de Request DTO para Entidade (para CRIAR uma nova)
    @Mapping(target = "idEndereco", ignore = true) // ID é gerado pelo BD
    @Mapping(target = "clienteEnderecos", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "enderecoPatios", ignore = true) // Relacionamento inverso não é mapeado na criação
    Endereco toEntity(EnderecoRequestDto enderecoRequestDto);

    // Método 2: Atualização de uma Entidade existente a partir de Request DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idEndereco", ignore = true) // ID não é atualizado
    @Mapping(target = "clienteEnderecos", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "enderecoPatios", ignore = true) // Relacionamento inverso não é atualizado
    Endereco partialUpdate(EnderecoRequestDto enderecoRequestDto, @MappingTarget Endereco endereco);

    // Método 3: Converte de Entidade para DTO de Resposta (ESSENCIAL para consultas)
    EnderecoResponseDto toResponseDto(Endereco endereco);

    // --- Métodos para mapear coleções (opcional) ---
    // List<EnderecoResponseDto> toResponseDtoList(List<Endereco> enderecos);
    // Set<EnderecoResponseDto> toResponseDtoSet(Set<Endereco> enderecos);
}