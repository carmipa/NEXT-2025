// Caminho do arquivo: br\com\fiap\mottu\mapper\ClienteMapper.java
package br.com.fiap.mottu.mapper;

import br.com.fiap.mottu.dto.cliente.ClienteRequestDto;
import br.com.fiap.mottu.dto.cliente.ClienteResponseDto;
import br.com.fiap.mottu.model.Cliente;

// Importe os mappers para os DTOs aninhados
import br.com.fiap.mottu.mapper.EnderecoMapper;
import br.com.fiap.mottu.mapper.ContatoMapper;
import br.com.fiap.mottu.mapper.CnhMapper;
// Importar mapper para VeiculoResponseDto se ClienteResponseDto for incluí-lo
// import br.com.fiap.mottu.mapper.relacionamento.ClienteVeiculoMapper;
// import br.com.fiap.mottu.dto.veiculo.VeiculoResponseDto; // Para mapear para VeiculoResponseDto

import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;

import java.util.Set; // Necessário para mapear coleções
import java.util.stream.Collectors; // Necessário para stream() e collect()

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        // Adiciona os mappers para os DTOs aninhados (Endereco, Contato e CNH)
        uses = { EnderecoMapper.class, ContatoMapper.class, CnhMapper.class }
        // Se for mapear Set<ClienteVeiculo> para Set<VeiculoResponseDto>, precisará de um Mapper que faça isso.
        // Ex: uses = { EnderecoMapper.class, ContatoMapper.class, ClienteVeiculoMapper.class }
)
public interface ClienteMapper {

    // Método 1: Converte de Request DTO para Entidade (para CRIAR uma nova)
    // Mapeia ClienteRequestDto -> Cliente
    @Mapping(target = "idCliente", ignore = true) // ID é gerado pelo BD, ignore ao mapear Request para Entidade
    // @Mapping(target = "dataCadastro", ignore = true) // dataCadastro é gerada pelo BD (DEFAULT SYSDATE), ignore ao mapear Request para Entidade
    @Mapping(target = "endereco", source = "enderecoRequestDto") // Mapeia o DTO de Endereco aninhado para a Entidade Endereco
    @Mapping(target = "contato", source = "contatoRequestDto") // Mapeia o DTO de Contato aninhado para a Entidade Contato
    @Mapping(target = "cnh", ignore = true) // CNH será criada separadamente
    @Mapping(target = "clienteVeiculos", ignore = true) // Relação Many-to-Many não é criada diretamente aqui
    Cliente toEntity(ClienteRequestDto clienteRequestDto);

    // Método 2: Atualização de uma Entidade existente a partir de um Request DTO
    // Mapeia ClienteRequestDto -> Cliente (existente)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "idCliente", ignore = true) // ID não é atualizado pelo DTO
    @Mapping(target = "dataCadastro", ignore = true) // Data de cadastro não é atualizada pelo DTO
    @Mapping(target = "endereco", source = "enderecoRequestDto") // Mapeia o DTO de Endereco aninhado para a Entidade Endereco existente no Cliente
    @Mapping(target = "contato", source = "contatoRequestDto") // Mapeia o DTO de Contato aninhado para a Entidade Contato existente no Cliente
    @Mapping(target = "cnh", ignore = true) // CNH será atualizada separadamente
    @Mapping(target = "clienteVeiculos", ignore = true) // Relação Many-to-Many não é atualizada diretamente aqui
    Cliente partialUpdate(ClienteRequestDto clienteRequestDto, @MappingTarget Cliente cliente);

    // Método 3: Converte de Entidade para DTO de Resposta (ESSENCIAL para consultas)
    // Mapeia Cliente -> ClienteResponseDto
    @Mapping(target = "enderecoResponseDto", source = "endereco") // Mapeia a Entidade Endereco para o DTO de Endereco aninhado no Response
    @Mapping(target = "contatoResponseDto", source = "contato") // Mapeia a Entidade Contato para o DTO de Contato aninhado no Response
    @Mapping(target = "cnhResponseDto", source = "cnh") // Mapeia a Entidade CNH para o DTO de CNH aninhado no Response
    // Se ClienteResponseDto tiver campos de coleções (ex: Set<VeiculoResponseDto> veiculos)
    // Você precisaria de um método @Named para fazer essa conversão se ClienteVeiculoMapper não for suficiente,
    // ou um método diretamente no mapper se a lógica for simples.
    // Exemplo: @Mapping(target = "veiculos", expression = "java(mapClienteVeiculosToVeiculoResponseDtos(cliente.getClienteVeiculos()))")
    ClienteResponseDto toResponseDto(Cliente cliente);

    // Exemplo de método para mapear Set<ClienteVeiculo> para Set<VeiculoResponseDto>
    // Este método pode ser um @Named ou um método privado na interface se for Java 8 default methods
    /*
    default Set<VeiculoResponseDto> mapClienteVeiculosToVeiculoResponseDtos(Set<br.com.fiap.mottu.model.relacionamento.ClienteVeiculo> clienteVeiculos) {
        if (clienteVeiculos == null) {
            return null;
        }
        // Assume que você tem um VeiculoMapper injetável para converter Veiculo para VeiculoResponseDto
        // Ou que o ClienteVeiculoMapper tem um método para mapear para VeiculoResponseDto
        return clienteVeiculos.stream()
                .map(ClienteVeiculo::getVeiculo) // Pega a entidade Veiculo da associação
                .map(veiculo -> SpringApplicationContext.getBean(VeiculoMapper.class).toResponseDto(veiculo)) // Necessita de um mecanismo para obter o bean do mapper
                .collect(Collectors.toSet());
    }
    */

    // --- Métodos para mapear coleções (opcional) ---
    // List<ClienteResponseDto> toResponseDtoList(List<Cliente> clientes);
    // Set<ClienteResponseDto> toResponseDtoSet(Set<Cliente> clientes);
}