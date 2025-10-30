package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.rastreamento.RastreamentoRequestDto;
import br.com.fiap.mottu.dto.rastreamento.RastreamentoResponseDto;
import br.com.fiap.mottu.model.Rastreamento;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-22T15:42:21-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251001-1143, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class RastreamentoMapperImpl implements RastreamentoMapper {

    @Override
    public Rastreamento toEntity(RastreamentoRequestDto rastreamentoRequestDto) {
        if ( rastreamentoRequestDto == null ) {
            return null;
        }

        Rastreamento.RastreamentoBuilder rastreamento = Rastreamento.builder();

        rastreamento.gprsAltitude( rastreamentoRequestDto.getGprsAltitude() );
        rastreamento.gprsLatitude( rastreamentoRequestDto.getGprsLatitude() );
        rastreamento.gprsLongitude( rastreamentoRequestDto.getGprsLongitude() );
        rastreamento.ipsX( rastreamentoRequestDto.getIpsX() );
        rastreamento.ipsY( rastreamentoRequestDto.getIpsY() );
        rastreamento.ipsZ( rastreamentoRequestDto.getIpsZ() );

        return rastreamento.build();
    }

    @Override
    public Rastreamento partialUpdate(RastreamentoRequestDto dto, Rastreamento rastreamento) {
        if ( dto == null ) {
            return rastreamento;
        }

        if ( dto.getGprsAltitude() != null ) {
            rastreamento.setGprsAltitude( dto.getGprsAltitude() );
        }
        if ( dto.getGprsLatitude() != null ) {
            rastreamento.setGprsLatitude( dto.getGprsLatitude() );
        }
        if ( dto.getGprsLongitude() != null ) {
            rastreamento.setGprsLongitude( dto.getGprsLongitude() );
        }
        if ( dto.getIpsX() != null ) {
            rastreamento.setIpsX( dto.getIpsX() );
        }
        if ( dto.getIpsY() != null ) {
            rastreamento.setIpsY( dto.getIpsY() );
        }
        if ( dto.getIpsZ() != null ) {
            rastreamento.setIpsZ( dto.getIpsZ() );
        }

        return rastreamento;
    }

    @Override
    public RastreamentoResponseDto toResponseDto(Rastreamento rastreamento) {
        if ( rastreamento == null ) {
            return null;
        }

        Long idRastreamento = null;
        BigDecimal ipsX = null;
        BigDecimal ipsY = null;
        BigDecimal ipsZ = null;
        BigDecimal gprsLatitude = null;
        BigDecimal gprsLongitude = null;
        BigDecimal gprsAltitude = null;
        LocalDateTime dataHoraRegistro = null;

        idRastreamento = rastreamento.getIdRastreamento();
        ipsX = rastreamento.getIpsX();
        ipsY = rastreamento.getIpsY();
        ipsZ = rastreamento.getIpsZ();
        gprsLatitude = rastreamento.getGprsLatitude();
        gprsLongitude = rastreamento.getGprsLongitude();
        gprsAltitude = rastreamento.getGprsAltitude();
        dataHoraRegistro = rastreamento.getDataHoraRegistro();

        RastreamentoResponseDto rastreamentoResponseDto = new RastreamentoResponseDto( idRastreamento, ipsX, ipsY, ipsZ, gprsLatitude, gprsLongitude, gprsAltitude, dataHoraRegistro );

        return rastreamentoResponseDto;
    }
}
