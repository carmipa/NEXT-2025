package br.com.fiap.mottu.model;

import jakarta.persistence.*; // Importações do JPA para anotações de entidade
import lombok.*; // Importações do Lombok para reduzir boilerplate code (getters, setters, etc.)
import org.hibernate.annotations.CreationTimestamp; // Para gerar timestamp automaticamente na criação

import java.math.BigDecimal; // Para representar números decimais com precisão
import java.time.LocalDateTime; // Para representar data e hora sem fuso horário
import java.util.HashSet; // Implementação de Set
import java.util.Set; // Interface para coleções de elementos únicos

@Entity // Marca esta classe como uma entidade JPA (representa uma tabela no banco)
@Table(name = "TB_RASTREAMENTO") // Mapeia para a tabela TB_RASTREAMENTO
@Getter // Lombok: Gera automaticamente os métodos getters
@Setter // Lombok: Gera automaticamente os métodos setters
@NoArgsConstructor // Lombok: Gera um construtor sem argumentos
@AllArgsConstructor // Lombok: Gera um construtor com todos os argumentos
@Builder // Lombok: Habilita o padrão de projeto Builder para facilitar a criação de instâncias
@ToString(exclude = {"veiculoRastreamentos"}) // Lombok: Gera o método toString, excluindo o campo veiculoRastreamentos para evitar recursão infinita
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Lombok: Gera equals e hashCode baseados apenas nos campos anotados com @EqualsAndHashCode.Include
public class Rastreamento {

    @Id // Marca o campo idRastreamento como a chave primária da tabela
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Configura a geração automática do ID pelo banco (identidade)
    @Column(name = "ID_RASTREAMENTO") // Mapeia para a coluna ID_RASTREAMENTO
    @EqualsAndHashCode.Include // Inclui este campo no cálculo de equals e hashCode
    private Long idRastreamento; // Identificador único do rastreamento

    // Precisão (total de dígitos) e escala (dígitos após a vírgula) ajustadas conforme DDL da tabela.
    // Se o DDL usar NUMBER(38,8), as precisões e escalas aqui deveriam ser maiores.
    // Atualmente, está configurado para refletir as classes Java originais (ex: 7,3 para IPS).
    @Column(name = "IPS_X", nullable = false, precision = 7, scale = 3) // Coordenada X do Indoor Positioning System
    private BigDecimal ipsX;

    @Column(name = "IPS_Y", nullable = false, precision = 7, scale = 3) // Coordenada Y do Indoor Positioning System
    private BigDecimal ipsY;

    @Column(name = "IPS_Z", nullable = false, precision = 7, scale = 3) // Coordenada Z do Indoor Positioning System
    private BigDecimal ipsZ;
    @Column(name = "GPRS_LATITUDE", nullable = false, precision = 11, scale = 6) // Latitude obtida via GPRS
    private BigDecimal gprsLatitude;

    @Column(name = "GPRS_LONGITUDE", nullable = false, precision = 11, scale = 6) // Longitude obtida via GPRS
    private BigDecimal gprsLongitude;

    @Column(name = "GPRS_ALTITUDE", nullable = false, precision = 7, scale = 2) // Altitude obtida via GPRS
    private BigDecimal gprsAltitude;

    @CreationTimestamp // Hibernate: Preenche automaticamente com o timestamp no momento da criação da entidade
    @Column(name = "DATA_HORA_REGISTRO", nullable = false, updatable = false) // Data e hora do registro do rastreamento
    private LocalDateTime dataHoraRegistro; // NOVO CAMPO

    // Relacionamento bidirecional com VeiculoRastreamento (tabela de junção)
    @OneToMany(mappedBy = "rastreamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // Lombok: Inicializa o Set para evitar NullPointerExceptions
    private Set<br.com.fiap.mottu.model.relacionamento.VeiculoRastreamento> veiculoRastreamentos = new HashSet<>();
}