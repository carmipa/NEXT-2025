package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.box.BoxRequestDto;
import br.com.fiap.mottu.dto.box.BoxResponseDto;
import br.com.fiap.mottu.model.Box;
import br.com.fiap.mottu.model.Patio;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-24T14:59:26-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.1 (Oracle Corporation)"
)
@Component
public class BoxMapperImpl implements BoxMapper {

    @Override
    public Box toEntity(BoxRequestDto boxRequestDto) {
        if ( boxRequestDto == null ) {
            return null;
        }

        Box.BoxBuilder box = Box.builder();

        box.nome( boxRequestDto.getNome() );
        box.status( boxRequestDto.getStatus() );
        box.observacao( boxRequestDto.getObservacao() );
        box.dataEntrada( boxRequestDto.getDataEntrada() );
        box.dataSaida( boxRequestDto.getDataSaida() );

        return box.build();
    }

    @Override
    public Box partialUpdate(BoxRequestDto boxRequestDto, Box box) {
        if ( boxRequestDto == null ) {
            return box;
        }

        if ( boxRequestDto.getNome() != null ) {
            box.setNome( boxRequestDto.getNome() );
        }
        if ( boxRequestDto.getStatus() != null ) {
            box.setStatus( boxRequestDto.getStatus() );
        }
        if ( boxRequestDto.getObservacao() != null ) {
            box.setObservacao( boxRequestDto.getObservacao() );
        }
        if ( boxRequestDto.getDataEntrada() != null ) {
            box.setDataEntrada( boxRequestDto.getDataEntrada() );
        }
        if ( boxRequestDto.getDataSaida() != null ) {
            box.setDataSaida( boxRequestDto.getDataSaida() );
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
        boxResponseDto.idBox( box.getIdBox() );
        boxResponseDto.nome( box.getNome() );
        boxResponseDto.status( box.getStatus() );
        boxResponseDto.dataEntrada( box.getDataEntrada() );
        boxResponseDto.dataSaida( box.getDataSaida() );
        boxResponseDto.observacao( box.getObservacao() );
        boxResponseDto.patio( patioToPatioInfo( box.getPatio() ) );

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
