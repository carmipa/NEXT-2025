package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.estacionamento.EstacionamentoRequestDto;
import br.com.fiap.mottu.dto.estacionamento.EstacionamentoResponseDto;
import br.com.fiap.mottu.model.Estacionamento;
import org.mapstruct.*;
import org.mapstruct.MappingConstants.ComponentModel;

/**
 * Mapper para conversão entre Entidade Estacionamento e DTOs
 * Usa MapStruct para geração automática de código
 */
@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = ComponentModel.SPRING,
        uses = {VeiculoMapper.class, BoxMapper.class, PatioMapper.class}
)
public interface EstacionamentoMapper {

    // ================== CONVERSÕES BÁSICAS ==================

    /**
     * Converte Request DTO para Entidade (para criar novo)
     */
    @Mapping(target = "idEstacionamento", ignore = true)
    @Mapping(target = "veiculo", ignore = true) // Será setado manualmente
    @Mapping(target = "box", ignore = true) // Será setado manualmente
    @Mapping(target = "patio", ignore = true) // Será setado manualmente
    @Mapping(target = "dataUltimaAtualizacao", ignore = true) // Gerado automaticamente
    Estacionamento toEntity(EstacionamentoRequestDto dto);

    /**
     * Atualização parcial de uma Entidade existente
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idEstacionamento", ignore = true)
    @Mapping(target = "veiculo", ignore = true)
    @Mapping(target = "box", ignore = true)
    @Mapping(target = "patio", ignore = true)
    @Mapping(target = "dataUltimaAtualizacao", ignore = true)
    Estacionamento partialUpdate(EstacionamentoRequestDto dto, @MappingTarget Estacionamento entity);

    /**
     * Converte Entidade para Response DTO
     */
    @Mapping(target = "veiculo", expression = "java(mapVeiculoInfo(entity))")
    @Mapping(target = "box", expression = "java(mapBoxInfo(entity))")
    @Mapping(target = "patio", expression = "java(mapPatioInfo(entity))")
    @Mapping(target = "tempoEstacionadoMinutos", expression = "java(entity.calcularTempoEstacionamentoAtualMinutos())")
    EstacionamentoResponseDto toResponseDto(Estacionamento entity);

    // ================== MÉTODOS AUXILIARES ==================

    /**
     * Mapeia informações do veículo
     */
    default EstacionamentoResponseDto.VeiculoInfo mapVeiculoInfo(Estacionamento entity) {
        if (entity.getVeiculo() == null) {
            return null;
        }
        return EstacionamentoResponseDto.VeiculoInfo.builder()
                .idVeiculo(entity.getVeiculo().getIdVeiculo())
                .placa(entity.getVeiculo().getPlaca())
                .modelo(entity.getVeiculo().getModelo())
                .fabricante(entity.getVeiculo().getFabricante())
                .tagBleId(entity.getVeiculo().getTagBleId())
                .status(entity.getVeiculo().getStatus())
                .build();
    }

    /**
     * Mapeia informações do box
     */
    default EstacionamentoResponseDto.BoxInfo mapBoxInfo(Estacionamento entity) {
        if (entity.getBox() == null) {
            return null;
        }
        return EstacionamentoResponseDto.BoxInfo.builder()
                .idBox(entity.getBox().getIdBox())
                .nome(entity.getBox().getNome())
                .status(entity.getBox().getStatus())
                .dataEntrada(entity.getBox().getDataEntrada())
                .dataSaida(entity.getBox().getDataSaida())
                .build();
    }

    /**
     * Mapeia informações do pátio
     */
    default EstacionamentoResponseDto.PatioInfo mapPatioInfo(Estacionamento entity) {
        if (entity.getPatio() == null) {
            return null;
        }
        return EstacionamentoResponseDto.PatioInfo.builder()
                .idPatio(entity.getPatio().getIdPatio())
                .nomePatio(entity.getPatio().getNomePatio())
                .status(entity.getPatio().getStatus())
                .build();
    }

    // ================== CONVERSÕES DE COLEÇÕES ==================

    /**
     * Converte lista de entidades para lista de DTOs
     */
    java.util.List<EstacionamentoResponseDto> toResponseDtoList(java.util.List<Estacionamento> entities);

    /**
     * Converte página de entidades para página de DTOs
     */
    default org.springframework.data.domain.Page<EstacionamentoResponseDto> toResponseDtoPage(
            org.springframework.data.domain.Page<Estacionamento> page) {
        return page.map(this::toResponseDto);
    }
}




