// Caminho do arquivo: br\com\fiap\mottu\specification\ClienteSpecification.java
package br.com.fiap.mottu.specification;

import br.com.fiap.mottu.filter.ClienteFilter; // Importa do novo pacote
import br.com.fiap.mottu.model.Cliente;
import br.com.fiap.mottu.model.relacionamento.ClienteVeiculo;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ClienteSpecification {

    public static Specification<Cliente> withFilters(ClienteFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.nome() != null && !filter.nome().isBlank()) {
                // Usar TRANSLATE para remover acentos e tornar a busca case-insensitive
                predicates.add(cb.like(
                    cb.function("TRANSLATE", String.class, 
                        cb.lower(root.get("nome")),
                        cb.literal("áàâãäéèêëíìîïóòôõöúùûüçñ"),
                        cb.literal("aaaaaeeeeiiiiooooouuuucn")
                    ), 
                    "%" + filter.nome().toLowerCase() + "%"
                ));
            }
            if (filter.sobrenome() != null && !filter.sobrenome().isBlank()) {
                // Usar TRANSLATE para remover acentos e tornar a busca case-insensitive
                predicates.add(cb.like(
                    cb.function("TRANSLATE", String.class, 
                        cb.lower(root.get("sobrenome")),
                        cb.literal("áàâãäéèêëíìîïóòôõöúùûüçñ"),
                        cb.literal("aaaaaeeeeiiiiooooouuuucn")
                    ), 
                    "%" + filter.sobrenome().toLowerCase() + "%"
                ));
            }
            if (filter.cpf() != null && !filter.cpf().isBlank()) {
                predicates.add(cb.equal(root.get("cpf"), filter.cpf()));
            }
            if (filter.sexo() != null && !filter.sexo().isBlank()) {
                predicates.add(cb.equal(root.get("sexo"), filter.sexo()));
            }
            if (filter.profissao() != null && !filter.profissao().isBlank()) {
                // Usar TRANSLATE para remover acentos e tornar a busca case-insensitive
                predicates.add(cb.like(
                    cb.function("TRANSLATE", String.class, 
                        cb.lower(root.get("profissao")),
                        cb.literal("áàâãäéèêëíìîïóòôõöúùûüçñ"),
                        cb.literal("aaaaaeeeeiiiiooooouuuucn")
                    ), 
                    "%" + filter.profissao().toLowerCase() + "%"
                ));
            }
            if (filter.estadoCivil() != null && !filter.estadoCivil().isBlank()) {
                predicates.add(cb.equal(root.get("estadoCivil"), filter.estadoCivil()));
            }
            if (filter.dataCadastroInicio() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataCadastro"), filter.dataCadastroInicio()));
            }
            if (filter.dataCadastroFim() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataCadastro"), filter.dataCadastroFim()));
            }
            if (filter.dataNascimentoInicio() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataNascimento"), filter.dataNascimentoInicio()));
            }
            if (filter.dataNascimentoFim() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataNascimento"), filter.dataNascimentoFim()));
            }

            // Filtro por relacionamento ManyToOne (Endereco)
            if (filter.enderecoCidade() != null && !filter.enderecoCidade().isBlank()) {
                // Usar TRANSLATE para remover acentos e tornar a busca case-insensitive
                predicates.add(cb.like(
                    cb.function("TRANSLATE", String.class, 
                        cb.lower(root.get("endereco").get("cidade")),
                        cb.literal("áàâãäéèêëíìîïóòôõöúùûüçñ"),
                        cb.literal("aaaaaeeeeiiiiooooouuuucn")
                    ), 
                    "%" + filter.enderecoCidade().toLowerCase() + "%"
                ));
            }
            if (filter.enderecoEstado() != null && !filter.enderecoEstado().isBlank()) {
                predicates.add(cb.equal(root.get("endereco").get("estado"), filter.enderecoEstado()));
            }

            // Filtro por relacionamento ManyToOne (Contato)
            if (filter.contatoEmail() != null && !filter.contatoEmail().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("contato").get("email")), "%" + filter.contatoEmail().toLowerCase() + "%"));
            }
            if (filter.contatoCelular() != null && !filter.contatoCelular().isBlank()) {
                predicates.add(cb.like(root.get("contato").get("celular"), "%" + filter.contatoCelular() + "%"));
            }

            // Filtro por relacionamento OneToMany (ClienteVeiculo) para propriedade de Veiculo
            // Isso envolve fazer um JOIN com a tabela de junção e depois com a entidade Veiculo
            if (filter.veiculoPlaca() != null && !filter.veiculoPlaca().isBlank()) {
                Join<Cliente, ClienteVeiculo> clienteVeiculoJoin = root.join("clienteVeiculos");
                predicates.add(cb.equal(clienteVeiculoJoin.get("veiculo").get("placa"), filter.veiculoPlaca()));
            }
            if (filter.veiculoModelo() != null && !filter.veiculoModelo().isBlank()) {
                Join<Cliente, ClienteVeiculo> clienteVeiculoJoin = root.join("clienteVeiculos");
                predicates.add(cb.like(cb.lower(clienteVeiculoJoin.get("veiculo").get("modelo")), "%" + filter.veiculoModelo().toLowerCase() + "%"));
            }

            query.distinct(true); // Evitar duplicação de resultados ao usar joins para coleções

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}