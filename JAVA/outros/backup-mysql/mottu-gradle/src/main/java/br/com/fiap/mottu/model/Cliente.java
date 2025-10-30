// main\java\br\com\fiap\mottu\model\Cliente.java
package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate; // <-- IMPORTAR AQUI
import org.springframework.data.jpa.domain.support.AuditingEntityListener; // <-- IMPORTAR AQUI

@Entity
@Table(name = "TB_CLIENTE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class) // <-- ADICIONAR AQUI!
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_cliente")
    @SequenceGenerator(name = "seq_cliente", sequenceName = "SEQ_TB_CLIENTE", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_CLIENTE")
    @EqualsAndHashCode.Include
    private Long idCliente;

    @CreatedDate // <-- ADICIONAR AQUI!
    @Column(name = "DATA_CADASTRO", nullable = false, updatable = false)
    private LocalDate dataCadastro;

    @Column(name = "SEXO", nullable = false, length = 2)
    private String sexo;
    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;
    @Column(name = "SOBRENOME", nullable = false, length = 100)
    private String sobrenome;
    @Column(name = "DATA_NASCIMENTO", nullable = false)
    private LocalDate dataNascimento;
    @Column(name = "CPF", nullable = false, unique = true, length = 11)
    private String cpf;
    @Column(name = "PROFISSAO", nullable = false, length = 50)
    private String profissao;
    @Column(name = "ESTADO_CIVIL", nullable = false, length = 50)
    private String estadoCivil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_ENDERECO_ID_ENDERECO", nullable = false)
    @ToString.Exclude
    private Endereco endereco;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_CONTATO_ID_CONTATO", nullable = false)
    @ToString.Exclude
    private Contato contato;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ClienteVeiculo> clienteVeiculos = new HashSet<>();

    @OneToOne(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private Cnh cnh;
}