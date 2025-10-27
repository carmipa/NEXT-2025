package br.com.fiap.mottu.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.util.*;

@Service
@Slf4j
public class VagaOracleService {

    private final JdbcTemplate jdbc;

    public VagaOracleService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public List<BoxRow> listarBoxesComPlaca() {
        String sql = """
            SELECT b.ID_BOX, b.NOME, b.STATUS, b.DATA_ENTRADA, b.DATA_SAIDA, b.OBSERVACAO,
                   v.PLACA
              FROM TB_BOX b
              LEFT JOIN TB_VEICULOBOX vb ON vb.TB_BOX_ID_BOX = b.ID_BOX
              LEFT JOIN TB_VEICULO v ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
              ORDER BY b.ID_BOX
            """;
        return jdbc.query(sql, (rs, i) -> new BoxRow(
                rs.getLong("ID_BOX"),
                rs.getString("NOME"),
                rs.getString("STATUS"),
                rs.getObject("DATA_ENTRADA", LocalDate.class),
                rs.getObject("DATA_SAIDA", LocalDate.class),
                rs.getString("OBSERVACAO"),
                rs.getString("PLACA")
        ));
    }

    @Transactional(readOnly = true)
    public Optional<Long> findVeiculoIdByPlaca(String placa) {
        String sql = "SELECT ID_VEICULO FROM TB_VEICULO WHERE UPPER(PLACA) = ?";
        List<Long> ids = jdbc.query(sql, ps -> ps.setString(1, placa.toUpperCase()),
                (rs, i) -> rs.getLong("ID_VEICULO"));
        return ids.isEmpty() ? Optional.empty() : Optional.of(ids.getFirst());
    }

    @Transactional
    public Long createVeiculoComPlaca(String placa) {
        String sql = "INSERT INTO TB_VEICULO (PLACA) VALUES (?)";
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"ID_VEICULO"});
            ps.setString(1, placa.toUpperCase());
            return ps;
        }, kh);
        Number key = kh.getKey();
        if (key == null) {
            throw new IllegalStateException("Não foi possível obter ID do veículo criado.");
        }
        return key.longValue();
    }

    @Transactional(readOnly = true)
    public Optional<Long> firstBoxLivreId() {
        String sql = """
            SELECT b.ID_BOX
              FROM TB_BOX b
              LEFT JOIN TB_VEICULOBOX vb ON vb.TB_BOX_ID_BOX = b.ID_BOX
             WHERE b.STATUS = 'L'
               AND vb.TB_BOX_ID_BOX IS NULL
             ORDER BY b.ID_BOX
            """;
        List<Long> ids = jdbc.query(sql, (rs, i) -> rs.getLong(1));
        return ids.isEmpty() ? Optional.empty() : Optional.of(ids.getFirst());
    }

    @Transactional
    public void ocuparBox(Long boxId) {
        // CORREÇÃO: No modelo atual, STATUS='O' significa ocupado
        jdbc.update("UPDATE TB_BOX SET STATUS = 'O' WHERE ID_BOX = ?", boxId);
    }

    @Transactional
    public void vincularVeiculoBox(Long veiculoId, Long boxId) {
        jdbc.update("INSERT INTO TB_VEICULOBOX (TB_VEICULO_ID_VEICULO, TB_BOX_ID_BOX) VALUES (?, ?)", veiculoId, boxId);
    }

    @Transactional
    public void liberarBox(Long boxId) {
        jdbc.update("DELETE FROM TB_VEICULOBOX WHERE TB_BOX_ID_BOX = ?", boxId);
        // CORREÇÃO: No modelo atual, STATUS='L' significa livre
        jdbc.update("UPDATE TB_BOX SET STATUS = 'L' WHERE ID_BOX = ?", boxId);
    }

    @Transactional
    public AlocacaoResult alocarPlaca(String placa, Long preferidoBoxId) {
        String p = placa == null ? "" : placa.trim().toUpperCase();
        if (p.isEmpty()) throw new IllegalArgumentException("Placa é obrigatória.");

        // CORREÇÃO: Não criar veículo automaticamente - deve existir previamente
        Long veiculoId = findVeiculoIdByPlaca(p)
                .orElseThrow(() -> new IllegalStateException("Veículo com placa " + p + " não cadastrado. Cadastre o veículo primeiro."));

        // já alocada?
        Optional<BuscaBox> ja = buscarBoxPorPlaca(p);
        if (ja.isPresent()) {
            throw new IllegalStateException("Placa já alocada no box " + ja.get().idBox() + " (" + ja.get().nomeBox() + ")");
        }

        Long boxId = (preferidoBoxId != null) ? preferidoBoxId
                : firstBoxLivreId().orElseThrow(() -> new IllegalStateException("Não há boxes livres."));

        Integer ocupados = jdbc.queryForObject(
                "SELECT COUNT(1) FROM TB_VEICULOBOX WHERE TB_BOX_ID_BOX = ?",
                Integer.class, boxId
        );
        if (ocupados != null && ocupados > 0) throw new IllegalStateException("Box já ocupado: " + boxId);

        ocuparBox(boxId);
        vincularVeiculoBox(veiculoId, boxId);

        return new AlocacaoResult(veiculoId, boxId, p);
    }

    /** NOVO: retorna o box atual da placa, se houver (id e nome do box). */
    @Transactional(readOnly = true)
    public Optional<BuscaBox> buscarBoxPorPlaca(String placa) {
        String sql = """
            SELECT b.ID_BOX, b.NOME, b.STATUS
              FROM TB_VEICULO v
              JOIN TB_VEICULOBOX vb ON vb.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
              JOIN TB_BOX b        ON b.ID_BOX = vb.TB_BOX_ID_BOX
             WHERE UPPER(v.PLACA) = ?
            """;
        List<BuscaBox> list = jdbc.query(sql,
                ps -> ps.setString(1, placa.toUpperCase()),
                (rs, i) -> new BuscaBox(rs.getLong("ID_BOX"), rs.getString("NOME"), rs.getString("STATUS")));
        return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
    }

    // ---------- tipos auxiliares ----------
    public record BoxRow(Long idBox, String nome, String status,
                         java.time.LocalDate dataEntrada, java.time.LocalDate dataSaida,
                         String observacao, String placa) {}

    public record AlocacaoResult(Long veiculoId, Long boxId, String placa) {}

    public record BuscaBox(Long idBox, String nomeBox, String status) {}

    // NOVO: Record para carregar os dados completos do box e do veículo
    public record BoxComVeiculoRow(
            Long idBox, String nome, String status, LocalDate dataEntrada, LocalDate dataSaida, String observacao,
            String placa, String modelo, String fabricante, String tagBleId
    ) {}

    // NOVO: Record para vaga completa com dados do pátio
    public record VagaCompletaRow(
            Long idVaga, String nomeBox, String status, String placa, 
            String dataHoraOcupacao, String dataHoraLiberacao,
            Long idPatio, String nomePatio, String endereco
    ) {}

    // NOVO: Método para a consulta que busca detalhes do veículo
    @Transactional(readOnly = true)
    public List<BoxComVeiculoRow> listarBoxesComDetalhesVeiculo() {
        return listarBoxesComDetalhesVeiculo(null);
    }

    @Transactional(readOnly = true)
    public List<BoxComVeiculoRow> listarBoxesComDetalhesVeiculo(Long patioId) {
        log.info("🔍 VagaOracleService: Buscando boxes com patioId = {}", patioId);
        String sql;
        Object[] params;
        
        if (patioId != null) {
            // CORREÇÃO: Incluir JOIN com tabelas de veículos para trazer dados reais
            sql = """
                SELECT b.ID_BOX, b.NOME, b.STATUS, b.DATA_ENTRADA, b.DATA_SAIDA, b.OBSERVACAO,
                       v.PLACA, v.MODELO, v.FABRICANTE, v.TAG_BLE_ID
                  FROM TB_BOX b
                  LEFT JOIN TB_VEICULOBOX vb ON vb.TB_BOX_ID_BOX = b.ID_BOX
                  LEFT JOIN TB_VEICULO v ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
                  WHERE b.TB_PATIO_ID_PATIO = ?
                  ORDER BY b.ID_BOX
                """;
            params = new Object[]{patioId};
            log.info("📝 SQL corrigido com JOIN para trazer dados do veículo: {}", sql);
        } else {
            sql = """
                SELECT b.ID_BOX, b.NOME, b.STATUS, b.DATA_ENTRADA, b.DATA_SAIDA, b.OBSERVACAO,
                       v.PLACA, v.MODELO, v.FABRICANTE, v.TAG_BLE_ID
                  FROM TB_BOX b
                  LEFT JOIN TB_VEICULOBOX vb ON vb.TB_BOX_ID_BOX = b.ID_BOX
                  LEFT JOIN TB_VEICULO v ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
                  ORDER BY b.ID_BOX
                """;
            params = new Object[0];
        }

        log.info("🚀 Executando consulta SQL com params: {}", java.util.Arrays.toString(params));
        try {
            List<BoxComVeiculoRow> resultado = jdbc.query(sql, params, (rs, i) -> {
                log.info("📦 Processando box: ID={}, NOME={}, STATUS={}", 
                    rs.getLong("ID_BOX"), rs.getString("NOME"), rs.getString("STATUS"));
                return new BoxComVeiculoRow(
                    rs.getLong("ID_BOX"),
                    rs.getString("NOME"),
                    rs.getString("STATUS"),
                    rs.getObject("DATA_ENTRADA", LocalDate.class),
                    rs.getObject("DATA_SAIDA", LocalDate.class),
                    rs.getString("OBSERVACAO"),
                    rs.getString("PLACA"),
                    rs.getString("MODELO"),
                    rs.getString("FABRICANTE"),
                    rs.getString("TAG_BLE_ID")
                );
            });
            log.info("✅ VagaOracleService: Retornando {} boxes", resultado.size());
            return resultado;
        } catch (Exception e) {
            log.error("❌ Erro ao executar consulta SQL: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Lista todas as vagas com informações completas do pátio.
     * Retorna dados no formato esperado pelo frontend.
     */
    @Transactional(readOnly = true)
    public List<VagaCompletaRow> listarTodasVagasComDetalhes() {
        log.info("📋 VagaOracleService: Listando todas as vagas com detalhes");
        
        String sql = """
            SELECT 
                b.ID_BOX as idVaga,
                b.NOME as nomeBox,
                b.STATUS as status,
                v.PLACA as placa,
                TO_CHAR(b.DATA_ENTRADA, 'YYYY-MM-DD"T"HH24:MI:SS') as dataHoraOcupacao,
                TO_CHAR(b.DATA_SAIDA, 'YYYY-MM-DD"T"HH24:MI:SS') as dataHoraLiberacao,
                p.ID_PATIO as idPatio,
                p.NOME_PATIO as nomePatio,
                e.LOGRADOURO || ', ' || e.NUMERO || ' - ' || e.BAIRRO || ', ' || e.CIDADE || ' - ' || e.ESTADO as endereco
            FROM TB_BOX b
            JOIN TB_PATIO p ON p.ID_PATIO = b.TB_PATIO_ID_PATIO
            JOIN TB_ENDERECO e ON e.ID_ENDERECO = p.TB_ENDERECO_ID_ENDERECO
            LEFT JOIN TB_VEICULOBOX vb ON vb.TB_BOX_ID_BOX = b.ID_BOX
            LEFT JOIN TB_VEICULO v ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
            ORDER BY p.ID_PATIO, b.ID_BOX
            """;
        
        try {
            List<VagaCompletaRow> resultado = jdbc.query(sql, (rs, i) -> {
                return new VagaCompletaRow(
                    rs.getLong("idVaga"),
                    rs.getString("nomeBox"),
                    rs.getString("status"),
                    rs.getString("placa"),
                    rs.getString("dataHoraOcupacao"),
                    rs.getString("dataHoraLiberacao"),
                    rs.getLong("idPatio"),
                    rs.getString("nomePatio"),
                    rs.getString("endereco")
                );
            });
            
            log.info("✅ VagaOracleService: Retornando {} vagas", resultado.size());
            return resultado;
        } catch (Exception e) {
            log.error("❌ Erro ao listar vagas: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Corrige boxes que estão com status "O" (ocupado) mas sem veículo associado.
     * Retorna o número de boxes corrigidos.
     */
    @Transactional
    public int corrigirBoxesInconsistentes() {
        String sql = """
            UPDATE TB_BOX 
            SET STATUS = 'L', DATA_SAIDA = CURRENT_TIMESTAMP
            WHERE STATUS = 'O' 
            AND ID_BOX NOT IN (
                SELECT DISTINCT TB_BOX_ID_BOX 
                FROM TB_VEICULOBOX 
                WHERE TB_BOX_ID_BOX IS NOT NULL
            )
            """;
        
        int boxesCorrigidos = jdbc.update(sql);
        
        if (boxesCorrigidos > 0) {
            log.info("Corrigidos {} boxes inconsistentes (status ocupado sem veículo associado)", boxesCorrigidos);
        }
        
        return boxesCorrigidos;
    }
}
