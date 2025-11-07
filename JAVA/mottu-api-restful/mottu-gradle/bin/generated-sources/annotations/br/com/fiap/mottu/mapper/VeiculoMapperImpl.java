package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.mottu.model.Veiculo;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-06T21:33:48-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class VeiculoMapperImpl implements VeiculoMapper {

    @Override
    public Veiculo toEntity(VeiculoRequestDto veiculoRequestDto) {
        if ( veiculoRequestDto == null ) {
            return null;
        }

        Veiculo.VeiculoBuilder veiculo = Veiculo.builder();

        veiculo.tagBleId( veiculoRequestDto.getTagBleId() );
        veiculo.status( veiculoRequestDto.getStatus() );
        veiculo.modelo( veiculoRequestDto.getModelo() );
        veiculo.ano( veiculoRequestDto.getAno() );
        veiculo.chassi( veiculoRequestDto.getChassi() );
        veiculo.combustivel( veiculoRequestDto.getCombustivel() );
        veiculo.fabricante( veiculoRequestDto.getFabricante() );
        veiculo.motor( veiculoRequestDto.getMotor() );
        veiculo.placa( veiculoRequestDto.getPlaca() );
        veiculo.renavam( veiculoRequestDto.getRenavam() );

        return veiculo.build();
    }

    @Override
    public Veiculo partialUpdate(VeiculoRequestDto veiculoRequestDto, Veiculo veiculo) {
        if ( veiculoRequestDto == null ) {
            return veiculo;
        }

        if ( veiculoRequestDto.getTagBleId() != null ) {
            veiculo.setTagBleId( veiculoRequestDto.getTagBleId() );
        }
        if ( veiculoRequestDto.getStatus() != null ) {
            veiculo.setStatus( veiculoRequestDto.getStatus() );
        }
        if ( veiculoRequestDto.getModelo() != null ) {
            veiculo.setModelo( veiculoRequestDto.getModelo() );
        }
        if ( veiculoRequestDto.getAno() != null ) {
            veiculo.setAno( veiculoRequestDto.getAno() );
        }
        if ( veiculoRequestDto.getChassi() != null ) {
            veiculo.setChassi( veiculoRequestDto.getChassi() );
        }
        if ( veiculoRequestDto.getCombustivel() != null ) {
            veiculo.setCombustivel( veiculoRequestDto.getCombustivel() );
        }
        if ( veiculoRequestDto.getFabricante() != null ) {
            veiculo.setFabricante( veiculoRequestDto.getFabricante() );
        }
        if ( veiculoRequestDto.getMotor() != null ) {
            veiculo.setMotor( veiculoRequestDto.getMotor() );
        }
        if ( veiculoRequestDto.getPlaca() != null ) {
            veiculo.setPlaca( veiculoRequestDto.getPlaca() );
        }
        if ( veiculoRequestDto.getRenavam() != null ) {
            veiculo.setRenavam( veiculoRequestDto.getRenavam() );
        }

        return veiculo;
    }

    @Override
    public VeiculoResponseDto toResponseDto(Veiculo veiculo) {
        if ( veiculo == null ) {
            return null;
        }

        String tagBleId = null;
        String status = null;
        Long idVeiculo = null;
        String placa = null;
        String renavam = null;
        String chassi = null;
        String fabricante = null;
        String modelo = null;
        String motor = null;
        Integer ano = null;
        String combustivel = null;

        tagBleId = veiculo.getTagBleId();
        status = veiculo.getStatus();
        idVeiculo = veiculo.getIdVeiculo();
        placa = veiculo.getPlaca();
        renavam = veiculo.getRenavam();
        chassi = veiculo.getChassi();
        fabricante = veiculo.getFabricante();
        modelo = veiculo.getModelo();
        motor = veiculo.getMotor();
        ano = veiculo.getAno();
        combustivel = veiculo.getCombustivel();

        VeiculoResponseDto veiculoResponseDto = new VeiculoResponseDto( idVeiculo, placa, renavam, chassi, fabricante, modelo, motor, ano, combustivel, tagBleId, status );

        return veiculoResponseDto;
    }
}
