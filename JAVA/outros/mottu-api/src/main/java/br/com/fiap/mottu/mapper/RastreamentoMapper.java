package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.rastreamento.RastreamentoRequestDto; // DTO para requisições de criação/atualização
import br.com.fiap.mottu.dto.rastreamento.RastreamentoResponseDto; // DTO para respostas
import br.com.fiap.mottu.model.Rastreamento; // Entidade Rastreamento
import org.mapstruct.*; // Importações do MapStruct para mapeamento de objetos
import org.mapstruct.ReportingPolicy; // Define como lidar com mapeamentos não mapeados
import org.mapstruct.MappingConstants; // Constantes do MapStruct

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE, // Ignora campos não mapeados no destino
        componentModel = MappingConstants.ComponentModel.SPRING // Integração com Spring (gera um bean)
)
public interface RastreamentoMapper {

    // Mapeia de RastreamentoRequestDto para a entidade Rastreamento
    @Mapping(target = "idRastreamento", ignore = true) // ID é gerado pelo banco, não vem no request
    @Mapping(target = "veiculoRastreamentos", ignore = true) // Relacionamentos são gerenciados separadamente
    @Mapping(target = "dataHoraRegistro", ignore = true) // Será gerado automaticamente na criação pela JPA/Hibernate
    Rastreamento toEntity(RastreamentoRequestDto rastreamentoRequestDto);

    // Atualiza uma entidade Rastreamento existente com dados de um RastreamentoRequestDto
    // Apenas campos não nulos no DTO serão usados para atualizar a entidade
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idRastreamento", ignore = true) // ID não deve ser atualizado
    @Mapping(target = "veiculoRastreamentos", ignore = true) // Relacionamentos não são atualizados por este DTO diretamente
    @Mapping(target = "dataHoraRegistro", ignore = true) // Data de registro não deve ser atualizada
    Rastreamento partialUpdate(RastreamentoRequestDto dto, @MappingTarget Rastreamento rastreamento);

    // Mapeia da entidade Rastreamento para RastreamentoResponseDto
    // O campo dataHoraRegistro será mapeado automaticamente pois os nomes coincidem
    RastreamentoResponseDto toResponseDto(Rastreamento rastreamento);
}