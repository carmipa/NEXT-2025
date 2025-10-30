package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.zona.ZonaRequestDto;
import br.com.fiap.mottu.dto.zona.ZonaResponseDto;
import br.com.fiap.mottu.model.Patio;
import br.com.fiap.mottu.model.Zona;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-20T18:57:02-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251001-1143, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ZonaMapperImpl implements ZonaMapper {

    @Override
    public Zona toEntity(ZonaRequestDto zonaRequestDto) {
        if ( zonaRequestDto == null ) {
            return null;
        }

        Zona.ZonaBuilder zona = Zona.builder();

        zona.nome( zonaRequestDto.getNome() );
        zona.observacao( zonaRequestDto.getObservacao() );
        zona.status( zonaRequestDto.getStatus() );

        return zona.build();
    }

    @Override
    public Zona partialUpdate(ZonaRequestDto zonaRequestDto, Zona zona) {
        if ( zonaRequestDto == null ) {
            return zona;
        }

        if ( zonaRequestDto.getNome() != null ) {
            zona.setNome( zonaRequestDto.getNome() );
        }
        if ( zonaRequestDto.getObservacao() != null ) {
            zona.setObservacao( zonaRequestDto.getObservacao() );
        }
        if ( zonaRequestDto.getStatus() != null ) {
            zona.setStatus( zonaRequestDto.getStatus() );
        }

        return zona;
    }

    @Override
    public ZonaResponseDto toResponseDto(Zona zona) {
        if ( zona == null ) {
            return null;
        }

        ZonaResponseDto.ZonaResponseDtoBuilder zonaResponseDto = ZonaResponseDto.builder();

        zonaResponseDto.patioId( zonaPatioIdPatio( zona ) );
        zonaResponseDto.idZona( zona.getIdZona() );
        zonaResponseDto.nome( zona.getNome() );
        zonaResponseDto.observacao( zona.getObservacao() );
        zonaResponseDto.patio( patioToPatioInfo( zona.getPatio() ) );
        zonaResponseDto.status( zona.getStatus() );

        return zonaResponseDto.build();
    }

    private Long zonaPatioIdPatio(Zona zona) {
        if ( zona == null ) {
            return null;
        }
        Patio patio = zona.getPatio();
        if ( patio == null ) {
            return null;
        }
        Long idPatio = patio.getIdPatio();
        if ( idPatio == null ) {
            return null;
        }
        return idPatio;
    }

    protected ZonaResponseDto.PatioInfo patioToPatioInfo(Patio patio) {
        if ( patio == null ) {
            return null;
        }

        ZonaResponseDto.PatioInfo.PatioInfoBuilder patioInfo = ZonaResponseDto.PatioInfo.builder();

        patioInfo.idPatio( patio.getIdPatio() );
        patioInfo.nomePatio( patio.getNomePatio() );

        return patioInfo.build();
    }
}
