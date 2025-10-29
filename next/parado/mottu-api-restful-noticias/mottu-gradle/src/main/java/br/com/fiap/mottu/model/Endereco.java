// main\java\br\com\fiap\mottu\model\Endereco.java
package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TB_ENDERECO")
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_endereco")
    @SequenceGenerator(name = "seq_endereco", sequenceName = "SEQ_TB_ENDERECO", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_ENDERECO")
    @EqualsAndHashCode.Include
    private Long idEndereco;
    @Column(name = "CEP", nullable = false, length = 9) // Linha a ser restaurada para este estado
    private String cep;
    @Column(name = "NUMERO", nullable = false, precision = 7, scale = 0)
    private Integer numero;
    @Column(name = "LOGRADOURO", nullable = false, length = 50)
    private String logradouro;
    @Column(name = "BAIRRO", nullable = false, length = 50)
    private String bairro;
    @Column(name = "CIDADE", nullable = false, length = 50)
    private String cidade;
    @Column(name = "ESTADO", nullable = false, length = 2) // Linha a ser restaurada para este estado
    private String estado;
    @Column(name = "PAIS", nullable = false, length = 50)
    private String pais;
    @Column(name = "COMPLEMENTO", length = 60)
    private String complemento;
    @Column(name = "OBSERVACAO", length = 300)
    private String observacao;
    // Relacionamentos inversos
    @OneToMany(mappedBy = "endereco", cascade = CascadeType.ALL)
    @ToString.Exclude
    @Builder.Default
    private Set<Cliente> clienteEnderecos = new HashSet<>();
    @OneToMany(mappedBy = "endereco", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.EnderecoPatio> enderecoPatios = new HashSet<>();
}