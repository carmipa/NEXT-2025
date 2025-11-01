package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.contato.ContatoResponseDto;
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto;
import br.com.fiap.mottu.dto.patio.PatioRequestDto;
import br.com.fiap.mottu.dto.patio.PatioResponseDto;
import br.com.fiap.mottu.model.Contato;
import br.com.fiap.mottu.model.Endereco;
import br.com.fiap.mottu.model.Patio;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-01T14:04:00-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class PatioMapperImpl implements PatioMapper {

    @Autowired
    private ContatoMapper contatoMapper;
    @Autowired
    private EnderecoMapper enderecoMapper;

    @Override
    public Patio toEntity(PatioRequestDto patioRequestDto) {
        if ( patioRequestDto == null ) {
            return null;
        }

        Patio.PatioBuilder patio = Patio.builder();

        patio.contato( contatoMapper.toEntity( patioRequestDto.getContato() ) );
        patio.endereco( enderecoMapper.toEntity( patioRequestDto.getEndereco() ) );
        patio.nomePatio( patioRequestDto.getNomePatio() );
        patio.observacao( patioRequestDto.getObservacao() );
        patio.status( patioRequestDto.getStatus() );

        return patio.build();
    }

    @Override
    public Patio partialUpdate(PatioRequestDto patioRequestDto, Patio patio) {
        if ( patioRequestDto == null ) {
            return patio;
        }

        if ( patioRequestDto.getContato() != null ) {
            if ( patio.getContato() == null ) {
                patio.setContato( Contato.builder().build() );
            }
            contatoMapper.partialUpdate( patioRequestDto.getContato(), patio.getContato() );
        }
        if ( patioRequestDto.getEndereco() != null ) {
            if ( patio.getEndereco() == null ) {
                patio.setEndereco( Endereco.builder().build() );
            }
            enderecoMapper.partialUpdate( patioRequestDto.getEndereco(), patio.getEndereco() );
        }
        if ( patioRequestDto.getNomePatio() != null ) {
            patio.setNomePatio( patioRequestDto.getNomePatio() );
        }
        if ( patioRequestDto.getObservacao() != null ) {
            patio.setObservacao( patioRequestDto.getObservacao() );
        }
        if ( patioRequestDto.getStatus() != null ) {
            patio.setStatus( patioRequestDto.getStatus() );
        }

        return patio;
    }

    @Override
    public PatioResponseDto toResponseDto(Patio patio) {
        if ( patio == null ) {
            return null;
        }

        Long idPatio = null;
        String status = null;
        String nomePatio = null;
        String observacao = null;
        LocalDate dataCadastro = null;
        ContatoResponseDto contato = null;
        EnderecoResponseDto endereco = null;

        idPatio = patio.getIdPatio();
        status = patio.getStatus();
        nomePatio = patio.getNomePatio();
        observacao = patio.getObservacao();
        dataCadastro = patio.getDataCadastro();
        contato = contatoMapper.toResponseDto( patio.getContato() );
        endereco = enderecoMapper.toResponseDto( patio.getEndereco() );

        PatioResponseDto patioResponseDto = new PatioResponseDto( idPatio, status, nomePatio, observacao, dataCadastro, contato, endereco );

        return patioResponseDto;
    }
}
