package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "TB_PATIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class Patio {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_patio")
    @SequenceGenerator(name = "seq_patio", sequenceName = "SEQ_TB_PATIO", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_PATIO")
    @EqualsAndHashCode.Include
    private Long idPatio;

    @Column(name = "NOME_PATIO", nullable = false, length = 50)
    private String nomePatio;

    @Column(name = "STATUS", nullable = false, length = 1)
    private String status;

    @Column(name = "OBSERVACAO", length = 300)
    private String observacao;

    @CreatedDate
    @Column(name = "DATA_CADASTRO", nullable = false, updatable = false)
    private LocalDate dataCadastro;

    // Relacionamentos com Contato e Endereco
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_CONTATO_ID_CONTATO", nullable = false)
    @ToString.Exclude
    private Contato contato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_ENDERECO_ID_ENDERECO", nullable = false)
    @ToString.Exclude
    private Endereco endereco;

    // Relacionamento com Zonas (1:N)
    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Zona> zonas = new HashSet<>();

    // Relacionamento com Boxes (1:N) - CORRIGIDO
    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Box> boxes = new HashSet<>();

    // Relacionamento com Veículos (N:N através de VeiculoPatio)
    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoPatio> veiculoPatios = new HashSet<>();

    // Relacionamento com Contatos (N:N através de ContatoPatio)
    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.ContatoPatio> contatoPatios = new HashSet<>();

    // Relacionamento com Endereços (N:N através de EnderecoPatio)
    @OneToMany(mappedBy = "patio", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<br.com.fiap.mottu.model.relacionamento.EnderecoPatio> enderecoPatios = new HashSet<>();

}