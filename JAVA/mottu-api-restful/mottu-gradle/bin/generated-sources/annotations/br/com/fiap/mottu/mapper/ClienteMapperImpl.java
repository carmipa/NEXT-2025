package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.cliente.ClienteRequestDto;
import br.com.fiap.mottu.dto.cliente.ClienteResponseDto;
import br.com.fiap.mottu.dto.cnh.CnhResponseDto;
import br.com.fiap.mottu.dto.contato.ContatoResponseDto;
import br.com.fiap.mottu.dto.endereco.EnderecoResponseDto;
import br.com.fiap.mottu.model.Cliente;
import br.com.fiap.mottu.model.Contato;
import br.com.fiap.mottu.model.Endereco;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-03T22:23:54-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ClienteMapperImpl implements ClienteMapper {

    @Autowired
    private EnderecoMapper enderecoMapper;
    @Autowired
    private ContatoMapper contatoMapper;
    @Autowired
    private CnhMapper cnhMapper;

    @Override
    public Cliente toEntity(ClienteRequestDto clienteRequestDto) {
        if ( clienteRequestDto == null ) {
            return null;
        }

        Cliente.ClienteBuilder cliente = Cliente.builder();

        cliente.endereco( enderecoMapper.toEntity( clienteRequestDto.getEnderecoRequestDto() ) );
        cliente.contato( contatoMapper.toEntity( clienteRequestDto.getContatoRequestDto() ) );
        cliente.cpf( clienteRequestDto.getCpf() );
        cliente.dataNascimento( clienteRequestDto.getDataNascimento() );
        cliente.estadoCivil( clienteRequestDto.getEstadoCivil() );
        cliente.nome( clienteRequestDto.getNome() );
        cliente.profissao( clienteRequestDto.getProfissao() );
        cliente.sexo( clienteRequestDto.getSexo() );
        cliente.sobrenome( clienteRequestDto.getSobrenome() );

        return cliente.build();
    }

    @Override
    public Cliente partialUpdate(ClienteRequestDto clienteRequestDto, Cliente cliente) {
        if ( clienteRequestDto == null ) {
            return cliente;
        }

        if ( clienteRequestDto.getEnderecoRequestDto() != null ) {
            if ( cliente.getEndereco() == null ) {
                cliente.setEndereco( Endereco.builder().build() );
            }
            enderecoMapper.partialUpdate( clienteRequestDto.getEnderecoRequestDto(), cliente.getEndereco() );
        }
        if ( clienteRequestDto.getContatoRequestDto() != null ) {
            if ( cliente.getContato() == null ) {
                cliente.setContato( Contato.builder().build() );
            }
            contatoMapper.partialUpdate( clienteRequestDto.getContatoRequestDto(), cliente.getContato() );
        }
        if ( clienteRequestDto.getCpf() != null ) {
            cliente.setCpf( clienteRequestDto.getCpf() );
        }
        if ( clienteRequestDto.getDataNascimento() != null ) {
            cliente.setDataNascimento( clienteRequestDto.getDataNascimento() );
        }
        if ( clienteRequestDto.getEstadoCivil() != null ) {
            cliente.setEstadoCivil( clienteRequestDto.getEstadoCivil() );
        }
        if ( clienteRequestDto.getNome() != null ) {
            cliente.setNome( clienteRequestDto.getNome() );
        }
        if ( clienteRequestDto.getProfissao() != null ) {
            cliente.setProfissao( clienteRequestDto.getProfissao() );
        }
        if ( clienteRequestDto.getSexo() != null ) {
            cliente.setSexo( clienteRequestDto.getSexo() );
        }
        if ( clienteRequestDto.getSobrenome() != null ) {
            cliente.setSobrenome( clienteRequestDto.getSobrenome() );
        }

        return cliente;
    }

    @Override
    public ClienteResponseDto toResponseDto(Cliente cliente) {
        if ( cliente == null ) {
            return null;
        }

        EnderecoResponseDto enderecoResponseDto = null;
        ContatoResponseDto contatoResponseDto = null;
        CnhResponseDto cnhResponseDto = null;
        Long idCliente = null;
        LocalDate dataCadastro = null;
        String sexo = null;
        String nome = null;
        String sobrenome = null;
        LocalDate dataNascimento = null;
        String cpf = null;
        String profissao = null;
        String estadoCivil = null;

        enderecoResponseDto = enderecoMapper.toResponseDto( cliente.getEndereco() );
        contatoResponseDto = contatoMapper.toResponseDto( cliente.getContato() );
        cnhResponseDto = cnhMapper.toResponseDto( cliente.getCnh() );
        idCliente = cliente.getIdCliente();
        dataCadastro = cliente.getDataCadastro();
        sexo = cliente.getSexo();
        nome = cliente.getNome();
        sobrenome = cliente.getSobrenome();
        dataNascimento = cliente.getDataNascimento();
        cpf = cliente.getCpf();
        profissao = cliente.getProfissao();
        estadoCivil = cliente.getEstadoCivil();

        ClienteResponseDto clienteResponseDto = new ClienteResponseDto( idCliente, dataCadastro, sexo, nome, sobrenome, dataNascimento, cpf, profissao, estadoCivil, enderecoResponseDto, contatoResponseDto, cnhResponseDto );

        return clienteResponseDto;
    }
}
