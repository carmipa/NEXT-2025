// Caminho do arquivo: br\com\fiap\mottu\mapper\ContatoMapper.java
package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.contato.ContatoRequestDto;
import br.com.fiap.mottu.dto.contato.ContatoResponseDto;
import br.com.fiap.mottu.model.Contato;

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

// Importe os mappers das entidades relacionadas se ContatoResponseDto tiver DTOs aninhados ou coleções de DTOs delas
// import br.com.fiap.mottu.mapper.ClienteMapper; // Exemplo se ContatoResponseDto incluir Cliente associado
// import br.com.fiap.mottu.mapper.relacionamento.ContatoPatioMapper; // Exemplo se ContatoResponseDto incluir Patio associado

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING
        // Adicione aqui o 'uses' se ContatoResponseDto incluir DTOs aninhados ou coleções
        // uses = { ClienteMapper.class, ContatoPatioMapper.class }
)
public interface ContatoMapper {

    // Método 1: Converte de Request DTO para Entidade (para CRIAR uma nova)
    @Mapping(target = "idContato", ignore = true) // ID é gerado pelo BD
    @Mapping(target = "clienteContatos", ignore = true) // Relacionamento inverso não é mapeado na criação
    @Mapping(target = "contatoPatios", ignore = true) // Relacionamento inverso não é mapeado na criação
    Contato toEntity(ContatoRequestDto contatoRequestDto);

    // Método 2: Atualização de uma Entidade existente a partir de Request DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idContato", ignore = true) // ID não é atualizado
    @Mapping(target = "clienteContatos", ignore = true) // Relacionamento inverso não é atualizado
    @Mapping(target = "contatoPatios", ignore = true) // Relacionamento inverso não é atualizado
    Contato partialUpdate(ContatoRequestDto contatoRequestDto, @MappingTarget Contato contato);

    // Método 3: Converte de Entidade para DTO de Resposta (ESSENCIAL para consultas)
    ContatoResponseDto toResponseDto(Contato contato);

    // --- Métodos para mapear coleções (opcional) ---
    // List<ContatoResponseDto> toResponseDtoList(List<Contato> contatos);
    // Set<ContatoResponseDto> toResponseDtoSet(Set<Contato> contatos);
}