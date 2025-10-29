package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.contato.ContatoRequestDto;
import br.com.fiap.mottu.dto.contato.ContatoResponseDto;
import br.com.fiap.mottu.model.Contato;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-24T16:00:15-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251001-1143, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ContatoMapperImpl implements ContatoMapper {

    @Override
    public Contato toEntity(ContatoRequestDto contatoRequestDto) {
        if ( contatoRequestDto == null ) {
            return null;
        }

        Contato.ContatoBuilder contato = Contato.builder();

        contato.celular( contatoRequestDto.getCelular() );
        contato.ddd( contatoRequestDto.getDdd() );
        contato.ddi( contatoRequestDto.getDdi() );
        contato.email( contatoRequestDto.getEmail() );
        contato.observacao( contatoRequestDto.getObservacao() );
        contato.outro( contatoRequestDto.getOutro() );
        contato.telefone1( contatoRequestDto.getTelefone1() );
        contato.telefone2( contatoRequestDto.getTelefone2() );
        contato.telefone3( contatoRequestDto.getTelefone3() );

        return contato.build();
    }

    @Override
    public Contato partialUpdate(ContatoRequestDto contatoRequestDto, Contato contato) {
        if ( contatoRequestDto == null ) {
            return contato;
        }

        if ( contatoRequestDto.getCelular() != null ) {
            contato.setCelular( contatoRequestDto.getCelular() );
        }
        if ( contatoRequestDto.getDdd() != null ) {
            contato.setDdd( contatoRequestDto.getDdd() );
        }
        if ( contatoRequestDto.getDdi() != null ) {
            contato.setDdi( contatoRequestDto.getDdi() );
        }
        if ( contatoRequestDto.getEmail() != null ) {
            contato.setEmail( contatoRequestDto.getEmail() );
        }
        if ( contatoRequestDto.getObservacao() != null ) {
            contato.setObservacao( contatoRequestDto.getObservacao() );
        }
        if ( contatoRequestDto.getOutro() != null ) {
            contato.setOutro( contatoRequestDto.getOutro() );
        }
        if ( contatoRequestDto.getTelefone1() != null ) {
            contato.setTelefone1( contatoRequestDto.getTelefone1() );
        }
        if ( contatoRequestDto.getTelefone2() != null ) {
            contato.setTelefone2( contatoRequestDto.getTelefone2() );
        }
        if ( contatoRequestDto.getTelefone3() != null ) {
            contato.setTelefone3( contatoRequestDto.getTelefone3() );
        }

        return contato;
    }

    @Override
    public ContatoResponseDto toResponseDto(Contato contato) {
        if ( contato == null ) {
            return null;
        }

        Long idContato = null;
        String email = null;
        Integer ddd = null;
        Integer ddi = null;
        String telefone1 = null;
        String telefone2 = null;
        String telefone3 = null;
        String celular = null;
        String outro = null;
        String observacao = null;

        idContato = contato.getIdContato();
        email = contato.getEmail();
        ddd = contato.getDdd();
        ddi = contato.getDdi();
        telefone1 = contato.getTelefone1();
        telefone2 = contato.getTelefone2();
        telefone3 = contato.getTelefone3();
        celular = contato.getCelular();
        outro = contato.getOutro();
        observacao = contato.getObservacao();

        ContatoResponseDto contatoResponseDto = new ContatoResponseDto( idContato, email, ddd, ddi, telefone1, telefone2, telefone3, celular, outro, observacao );

        return contatoResponseDto;
    }
}
