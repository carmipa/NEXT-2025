package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.dto.box.BoxResponseDto;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-20T18:57:02-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251001-1143, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class BoxMapperImpl implements BoxMapper {

    @Override
    public Box toEntity(BoxRequestDto boxRequestDto) {
        if ( boxRequestDto == null ) {
            return null;
        }

        Box.BoxBuilder box = Box.builder();

        box.dataEntrada( boxRequestDto.getDataEntrada() );
        box.dataSaida( boxRequestDto.getDataSaida() );
        box.nome( boxRequestDto.getNome() );
        box.observacao( boxRequestDto.getObservacao() );
        box.status( boxRequestDto.getStatus() );

        return box.build();
    }

    @Override
    public Box partialUpdate(BoxRequestDto boxRequestDto, Box box) {
        if ( boxRequestDto == null ) {
            return box;
        }

        if ( boxRequestDto.getDataEntrada() != null ) {
            box.setDataEntrada( boxRequestDto.getDataEntrada() );
        }
        if ( boxRequestDto.getDataSaida() != null ) {
            box.setDataSaida( boxRequestDto.getDataSaida() );
        }
        if ( boxRequestDto.getNome() != null ) {
            box.setNome( boxRequestDto.getNome() );
        }
        if ( boxRequestDto.getObservacao() != null ) {
            box.setObservacao( boxRequestDto.getObservacao() );
        }
        if ( boxRequestDto.getStatus() != null ) {
            box.setStatus( boxRequestDto.getStatus() );
        }

        return box;
    }

    @Override
    public BoxResponseDto toResponseDto(Box box) {
        if ( box == null ) {
            return null;
        }

        BoxResponseDto.BoxResponseDtoBuilder boxResponseDto = BoxResponseDto.builder();

        boxResponseDto.patioId( boxPatioIdPatio( box ) );
        boxResponseDto.dataEntrada( box.getDataEntrada() );
        boxResponseDto.dataSaida( box.getDataSaida() );
        boxResponseDto.idBox( box.getIdBox() );
        boxResponseDto.nome( box.getNome() );
        boxResponseDto.observacao( box.getObservacao() );
        boxResponseDto.patio( patioToPatioInfo( box.getPatio() ) );
        boxResponseDto.status( box.getStatus() );

        return boxResponseDto.build();
    }

    private Long boxPatioIdPatio(Box box) {
        if ( box == null ) {
            return null;
        }
        Patio patio = box.getPatio();
        if ( patio == null ) {
            return null;
        }
        Long idPatio = patio.getIdPatio();
        if ( idPatio == null ) {
            return null;
        }
        return idPatio;
    }

    protected BoxResponseDto.PatioInfo patioToPatioInfo(Patio patio) {
        if ( patio == null ) {
            return null;
        }

        BoxResponseDto.PatioInfo.PatioInfoBuilder patioInfo = BoxResponseDto.PatioInfo.builder();

        patioInfo.idPatio( patio.getIdPatio() );
        patioInfo.nomePatio( patio.getNomePatio() );

        return patioInfo.build();
    }
}
