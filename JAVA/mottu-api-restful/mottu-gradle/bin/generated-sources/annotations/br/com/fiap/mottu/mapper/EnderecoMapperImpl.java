package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.endereco.EnderecoRequestDto;
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto;
import br.com.fiap.mottu.model.Endereco;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-05T07:37:31-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class EnderecoMapperImpl implements EnderecoMapper {

    @Override
    public Endereco toEntity(EnderecoRequestDto enderecoRequestDto) {
        if ( enderecoRequestDto == null ) {
            return null;
        }

        Endereco.EnderecoBuilder endereco = Endereco.builder();

        endereco.cep( enderecoRequestDto.getCep() );
        endereco.complemento( enderecoRequestDto.getComplemento() );
        endereco.numero( enderecoRequestDto.getNumero() );
        endereco.observacao( enderecoRequestDto.getObservacao() );

        return endereco.build();
    }

    @Override
    public Endereco partialUpdate(EnderecoRequestDto enderecoRequestDto, Endereco endereco) {
        if ( enderecoRequestDto == null ) {
            return endereco;
        }

        if ( enderecoRequestDto.getCep() != null ) {
            endereco.setCep( enderecoRequestDto.getCep() );
        }
        if ( enderecoRequestDto.getComplemento() != null ) {
            endereco.setComplemento( enderecoRequestDto.getComplemento() );
        }
        if ( enderecoRequestDto.getNumero() != null ) {
            endereco.setNumero( enderecoRequestDto.getNumero() );
        }
        if ( enderecoRequestDto.getObservacao() != null ) {
            endereco.setObservacao( enderecoRequestDto.getObservacao() );
        }

        return endereco;
    }

    @Override
    public EnderecoResponseDto toResponseDto(Endereco endereco) {
        if ( endereco == null ) {
            return null;
        }

        Long idEndereco = null;
        String cep = null;
        Integer numero = null;
        String logradouro = null;
        String bairro = null;
        String cidade = null;
        String estado = null;
        String pais = null;
        String complemento = null;
        String observacao = null;

        idEndereco = endereco.getIdEndereco();
        cep = endereco.getCep();
        numero = endereco.getNumero();
        logradouro = endereco.getLogradouro();
        bairro = endereco.getBairro();
        cidade = endereco.getCidade();
        estado = endereco.getEstado();
        pais = endereco.getPais();
        complemento = endereco.getComplemento();
        observacao = endereco.getObservacao();

        EnderecoResponseDto enderecoResponseDto = new EnderecoResponseDto( idEndereco, cep, numero, logradouro, bairro, cidade, estado, pais, complemento, observacao );

        return enderecoResponseDto;
    }
}
