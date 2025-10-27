package br.com.fiap.mottu.repository;

import br.com.fiap.mottu.model.Cnh;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositório para operações de CNH (Carteira Nacional de Habilitação)
 */
@Repository
public interface CnhRepository extends JpaRepository<Cnh, Long>, JpaSpecificationExecutor<Cnh> {

    /**
     * Busca CNH por número de registro
     * @param numeroRegistro número de registro da CNH
     * @return Optional contendo a CNH se encontrada
     */
    Optional<Cnh> findByNumeroRegistro(String numeroRegistro);

    /**
     * Verifica se existe CNH com o número de registro informado
     * @param numeroRegistro número de registro da CNH
     * @return true se existe, false caso contrário
     */
    boolean existsByNumeroRegistro(String numeroRegistro);

    /**
     * Busca CNHs por categoria
     * @param categoria categoria da CNH
     * @param pageable informações de paginação
     * @return página de CNHs da categoria informada
     */
    Page<Cnh> findByCategoria(String categoria, Pageable pageable);

    /**
     * Busca CNH por cliente (uma CNH por cliente)
     * @param clienteId ID do cliente
     * @return Optional contendo a CNH do cliente se encontrada
     */
    Optional<Cnh> findByClienteIdCliente(Long clienteId);


    /**
     * Busca CNHs vencidas
     * @param dataAtual data atual para comparação
     * @param pageable informações de paginação
     * @return página de CNHs vencidas
     */
    @Query("SELECT c FROM Cnh c WHERE c.dataValidade < :dataAtual")
    Page<Cnh> findCnhsVencidas(@Param("dataAtual") LocalDate dataAtual, Pageable pageable);

    /**
     * Busca CNHs próximas do vencimento (30 dias)
     * @param dataAtual data atual
     * @param dataLimite data limite (30 dias a partir de hoje)
     * @param pageable informações de paginação
     * @return página de CNHs próximas do vencimento
     */
    @Query("SELECT c FROM Cnh c WHERE c.dataValidade BETWEEN :dataAtual AND :dataLimite")
    Page<Cnh> findCnhsProximasVencimento(@Param("dataAtual") LocalDate dataAtual, 
                                        @Param("dataLimite") LocalDate dataLimite, 
                                        Pageable pageable);

    /**
     * Busca CNHs por categoria que permitem dirigir motos
     * @param pageable informações de paginação
     * @return página de CNHs que permitem dirigir motos
     */
    @Query("SELECT c FROM Cnh c WHERE c.categoria IN ('A', 'AB', 'AC', 'AD', 'AE')")
    Page<Cnh> findCnhsPermitemMotos(Pageable pageable);

    /**
     * Busca CNHs por categoria que permitem dirigir carros
     * @param pageable informações de paginação
     * @return página de CNHs que permitem dirigir carros
     */
    @Query("SELECT c FROM Cnh c WHERE c.categoria IN ('B', 'AB', 'AC', 'AD', 'AE')")
    Page<Cnh> findCnhsPermitemCarros(Pageable pageable);

    /**
     * Busca CNHs por número de registro (busca parcial)
     * @param numeroRegistro número de registro (pode ser parcial)
     * @param pageable informações de paginação
     * @return página de CNHs que contêm o número de registro
     */
    @Query("SELECT c FROM Cnh c WHERE c.numeroRegistro LIKE %:numeroRegistro%")
    Page<Cnh> findByNumeroRegistroContaining(@Param("numeroRegistro") String numeroRegistro, Pageable pageable);

    /**
     * Busca CNHs por nome do cliente
     * @param nomeCliente nome do cliente (pode ser parcial)
     * @param pageable informações de paginação
     * @return página de CNHs de clientes com o nome informado
     */
    @Query("SELECT c FROM Cnh c JOIN c.cliente cl WHERE " +
           "LOWER(CONCAT(cl.nome, ' ', cl.sobrenome)) LIKE LOWER(CONCAT('%', :nomeCliente, '%'))")
    Page<Cnh> findByClienteNomeContaining(@Param("nomeCliente") String nomeCliente, Pageable pageable);

    /**
     * Busca CNHs por CPF do cliente
     * @param cpfCliente CPF do cliente
     * @param pageable informações de paginação
     * @return página de CNHs do cliente com o CPF informado
     */
    @Query("SELECT c FROM Cnh c JOIN c.cliente cl WHERE cl.cpf = :cpfCliente")
    Page<Cnh> findByClienteCpf(@Param("cpfCliente") String cpfCliente, Pageable pageable);

    /**
     * Conta CNHs vencidas
     * @param dataAtual data atual para comparação
     * @return número de CNHs vencidas
     */
    @Query("SELECT COUNT(c) FROM Cnh c WHERE c.dataValidade < :dataAtual")
    long countCnhsVencidas(@Param("dataAtual") LocalDate dataAtual);

    /**
     * Conta CNHs próximas do vencimento
     * @param dataAtual data atual
     * @param dataLimite data limite (30 dias a partir de hoje)
     * @return número de CNHs próximas do vencimento
     */
    @Query("SELECT COUNT(c) FROM Cnh c WHERE c.dataValidade BETWEEN :dataAtual AND :dataLimite")
    long countCnhsProximasVencimento(@Param("dataAtual") LocalDate dataAtual, 
                                    @Param("dataLimite") LocalDate dataLimite);
}
