// main\java\br\com\fiap\mottu\model\Contato.java
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
@Table(name = "TB_CONTATO")
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Contato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CONTATO")
    @EqualsAndHashCode.Include
    private Long idContato;
    @Column(name = "EMAIL", nullable = false, length = 100)
    private String email;
    @Column(name = "DDD", nullable = false, precision = 4, scale = 0)
    private Integer ddd;
    @Column(name = "DDI", nullable = false, precision = 4, scale = 0)
    private Integer ddi;
    @Column(name = "TELEFONE1", nullable = false, length = 20)
    private String telefone1;
    @Column(name = "TELEFONE2", length = 20)
    private String telefone2;
    @Column(name = "TELEFONE3", length = 20)
    private String telefone3;
    @Column(name = "CELULAR", nullable = false, length = 20)
    private String celular;
    @Column(name = "OUTRO", length = 100)
    private String outro;
    @Column(name = "OBSERVACAO", length = 200)
    private String observacao;

    @OneToMany(mappedBy = "contato", cascade = CascadeType.ALL)
    @ToString.Exclude // MANTER esta anotação no campo
    @Builder.Default
    private Set<Cliente> clienteContatos = new HashSet<>();
    @OneToMany(mappedBy = "contato", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // MANTER esta anotação no campo
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ContatoPatio> contatoPatios = new HashSet<>();
}