package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.estacionamento.EstacionamentoRequestDto;
import br.com.fiap.mottu.dto.estacionamento.EstacionamentoResponseDto;
import br.com.fiap.mottu.model.Estacionamento;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-06T21:33:48-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class EstacionamentoMapperImpl implements EstacionamentoMapper {

    @Override
    public Estacionamento toEntity(EstacionamentoRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Estacionamento.EstacionamentoBuilder estacionamento = Estacionamento.builder();

        estacionamento.dataEntrada( dto.getDataEntrada() );
        estacionamento.dataSaida( dto.getDataSaida() );
        estacionamento.estaEstacionado( dto.getEstaEstacionado() );
        estacionamento.observacoes( dto.getObservacoes() );

        return estacionamento.build();
    }

    @Override
    public Estacionamento partialUpdate(EstacionamentoRequestDto dto, Estacionamento entity) {
        if ( dto == null ) {
            return entity;
        }

        if ( dto.getDataEntrada() != null ) {
            entity.setDataEntrada( dto.getDataEntrada() );
        }
        if ( dto.getDataSaida() != null ) {
            entity.setDataSaida( dto.getDataSaida() );
        }
        if ( dto.getEstaEstacionado() != null ) {
            entity.setEstaEstacionado( dto.getEstaEstacionado() );
        }
        if ( dto.getObservacoes() != null ) {
            entity.setObservacoes( dto.getObservacoes() );
        }

        return entity;
    }

    @Override
    public EstacionamentoResponseDto toResponseDto(Estacionamento entity) {
        if ( entity == null ) {
            return null;
        }

        EstacionamentoResponseDto.EstacionamentoResponseDtoBuilder estacionamentoResponseDto = EstacionamentoResponseDto.builder();

        estacionamentoResponseDto.dataEntrada( entity.getDataEntrada() );
        estacionamentoResponseDto.dataSaida( entity.getDataSaida() );
        estacionamentoResponseDto.dataUltimaAtualizacao( entity.getDataUltimaAtualizacao() );
        estacionamentoResponseDto.estaEstacionado( entity.getEstaEstacionado() );
        estacionamentoResponseDto.idEstacionamento( entity.getIdEstacionamento() );
        estacionamentoResponseDto.observacoes( entity.getObservacoes() );

        estacionamentoResponseDto.veiculo( mapVeiculoInfo(entity) );
        estacionamentoResponseDto.box( mapBoxInfo(entity) );
        estacionamentoResponseDto.patio( mapPatioInfo(entity) );
        estacionamentoResponseDto.tempoEstacionadoMinutos( entity.calcularTempoEstacionamentoAtualMinutos() );

        return estacionamentoResponseDto.build();
    }

    @Override
    public List<EstacionamentoResponseDto> toResponseDtoList(List<Estacionamento> entities) {
        if ( entities == null ) {
            return null;
        }

        List<EstacionamentoResponseDto> list = new ArrayList<EstacionamentoResponseDto>( entities.size() );
        for ( Estacionamento estacionamento : entities ) {
            list.add( toResponseDto( estacionamento ) );
        }

        return list;
    }
}
