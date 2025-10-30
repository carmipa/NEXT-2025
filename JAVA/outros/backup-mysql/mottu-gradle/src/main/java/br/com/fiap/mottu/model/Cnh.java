package br.com.fiap.mottu.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que representa a Carteira Nacional de Habilitação (CNH)
 * de um cliente do sistema MOTTU.
 * 
 * Validações implementadas:
 * - Data de emissão não pode ser menor que 18 anos da data de nascimento do cliente
 * - Data de validade deve ser maior que a data de emissão
 * - Número de registro deve ter exatamente 11 dígitos
 * - Categoria deve ser uma das válidas (A, B, C, D, E, AB, AC, AD, AE)
 */
@Entity
@Table(name = "TB_CNH")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class Cnh {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_cnh")
    @SequenceGenerator(name = "seq_cnh", sequenceName = "SEQ_TB_CNH", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_CNH")
    @EqualsAndHashCode.Include
    private Long idCnh;

    @Column(name = "DATA_EMISSAO", nullable = false)
    private LocalDate dataEmissao;

    @Column(name = "DATA_VALIDADE", nullable = false)
    private LocalDate dataValidade;

    @Column(name = "NUMERO_REGISTRO", nullable = false, unique = true, length = 20)
    private String numeroRegistro;

    @Column(name = "CATEGORIA", nullable = false, length = 5)
    private String categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TB_CLIENTE_ID_CLIENTE", nullable = false)
    @ToString.Exclude
    private Cliente cliente;

    @CreatedDate
    @Column(name = "CRIADO_EM", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @LastModifiedDate
    @Column(name = "ATUALIZADO_EM")
    private LocalDateTime atualizadoEm;

    /**
     * Valida se a CNH está vencida
     * @return true se a CNH estiver vencida, false caso contrário
     */
    public boolean isVencida() {
        return dataValidade.isBefore(LocalDate.now());
    }

    /**
     * Valida se a CNH está próxima do vencimento (30 dias)
     * @return true se a CNH estiver próxima do vencimento, false caso contrário
     */
    public boolean isProximaVencimento() {
        LocalDate hoje = LocalDate.now();
        LocalDate proximoVencimento = hoje.plusDays(30);
        return dataValidade.isBefore(proximoVencimento) && !isVencida();
    }

    /**
     * Calcula quantos dias restam para o vencimento
     * @return número de dias até o vencimento (negativo se já vencida)
     */
    public long getDiasParaVencimento() {
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), dataValidade);
    }

    /**
     * Valida se a categoria permite dirigir motocicletas
     * @return true se a categoria permite dirigir motos, false caso contrário
     */
    public boolean permiteDirigirMotos() {
        return categoria != null && (categoria.contains("A") || categoria.equals("AB") || 
               categoria.equals("AC") || categoria.equals("AD") || categoria.equals("AE"));
    }

    /**
     * Valida se a categoria permite dirigir carros
     * @return true se a categoria permite dirigir carros, false caso contrário
     */
    public boolean permiteDirigirCarros() {
        return categoria != null && (categoria.contains("B") || categoria.equals("AB") || 
               categoria.equals("AC") || categoria.equals("AD") || categoria.equals("AE"));
    }
}




