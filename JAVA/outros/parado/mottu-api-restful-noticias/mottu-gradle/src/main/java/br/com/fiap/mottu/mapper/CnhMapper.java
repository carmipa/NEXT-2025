package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.cnh.CnhRequestDto;
import br.com.fiap.mottu.dto.cnh.CnhResponseDto;
import br.com.fiap.mottu.model.Cnh;
import br.com.fiap.mottu.model.Cliente;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para conversão entre entidades CNH e DTOs
 */
@Component
public class CnhMapper {

    /**
     * Converte CnhRequestDto para entidade Cnh
     * @param cnhRequestDto DTO de requisição
     * @param cliente entidade Cliente associada
     * @return entidade Cnh
     */
    public Cnh toEntity(CnhRequestDto cnhRequestDto, Cliente cliente) {
        if (cnhRequestDto == null) {
            return null;
        }

        return Cnh.builder()
                .dataEmissao(cnhRequestDto.getDataEmissao())
                .dataValidade(cnhRequestDto.getDataValidade())
                .numeroRegistro(cnhRequestDto.getNumeroRegistro())
                .categoria(cnhRequestDto.getCategoria())
                .cliente(cliente)
                .build();
    }

    /**
     * Converte entidade Cnh para CnhResponseDto
     * @param cnh entidade Cnh
     * @return CnhResponseDto
     */
    public CnhResponseDto toResponseDto(Cnh cnh) {
        if (cnh == null) {
            return null;
        }

        return new CnhResponseDto(
                cnh.getIdCnh(),
                cnh.getDataEmissao(),
                cnh.getDataValidade(),
                cnh.getNumeroRegistro(),
                cnh.getCategoria(),
                cnh.getCliente() != null ? cnh.getCliente().getIdCliente() : null,
                cnh.getCliente() != null ? cnh.getCliente().getNome() + " " + cnh.getCliente().getSobrenome() : null,
                cnh.getCliente() != null ? cnh.getCliente().getCpf() : null,
                cnh.getCriadoEm(),
                cnh.getAtualizadoEm(),
                cnh.isVencida(),
                cnh.isProximaVencimento(),
                cnh.getDiasParaVencimento(),
                cnh.permiteDirigirMotos(),
                cnh.permiteDirigirCarros()
        );
    }

    /**
     * Converte lista de entidades Cnh para lista de CnhResponseDto
     * @param cnhs lista de entidades Cnh
     * @return lista de CnhResponseDto
     */
    public List<CnhResponseDto> toResponseDtoList(List<Cnh> cnhs) {
        if (cnhs == null) {
            return null;
        }

        return cnhs.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza entidade Cnh com dados do CnhRequestDto
     * @param cnh entidade Cnh existente
     * @param cnhRequestDto DTO com novos dados
     * @param cliente entidade Cliente associada
     * @return entidade Cnh atualizada
     */
    public Cnh updateEntity(Cnh cnh, CnhRequestDto cnhRequestDto, Cliente cliente) {
        if (cnh == null || cnhRequestDto == null) {
            return cnh;
        }

        cnh.setDataEmissao(cnhRequestDto.getDataEmissao());
        cnh.setDataValidade(cnhRequestDto.getDataValidade());
        cnh.setNumeroRegistro(cnhRequestDto.getNumeroRegistro());
        cnh.setCategoria(cnhRequestDto.getCategoria());
        cnh.setCliente(cliente);

        return cnh;
    }

    /**
     * Converte CnhRequestDto para entidade Cnh (versão simplificada sem cliente)
     * @param cnhRequestDto DTO de requisição
     * @return entidade Cnh (sem cliente associado)
     */
    public Cnh toEntity(CnhRequestDto cnhRequestDto) {
        if (cnhRequestDto == null) {
            return null;
        }

        return Cnh.builder()
                .dataEmissao(cnhRequestDto.getDataEmissao())
                .dataValidade(cnhRequestDto.getDataValidade())
                .numeroRegistro(cnhRequestDto.getNumeroRegistro())
                .categoria(cnhRequestDto.getCategoria())
                .build();
    }
}




