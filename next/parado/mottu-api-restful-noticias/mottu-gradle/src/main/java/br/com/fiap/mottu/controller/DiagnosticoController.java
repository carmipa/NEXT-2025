package br.com.fiap.mottu.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ExampleObject;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/diagnostico")
@Slf4j
@SuppressWarnings("unchecked")
@Tag(name = "Diagnóstico", description = "API para diagnóstico e monitoramento do sistema")
public class DiagnosticoController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/tb-noticia")
    @Operation(
        summary = "🔍 Diagnosticar Tabela TB_NOTICIA", 
        description = "Executa diagnóstico completo da tabela TB_NOTICIA, verificando estrutura, índices, constraints e dados existentes."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "✅ Diagnóstico executado com sucesso",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "Exemplo de diagnóstico",
                    value = """
                    {
                      "tabelaExiste": true,
                      "estruturaColunas": [
                        {
                          "nome": "ID_NOTICIA",
                          "tipo": "NUMBER",
                          "tamanho": 19,
                          "nullable": "N"
                        }
                      ],
                      "sequenciaExiste": true,
                      "indices": [
                        {
                          "nome": "PK_NOTICIA",
                          "tipo": "NORMAL",
                          "status": "VALID"
                        }
                      ],
                      "constraints": [
                        {
                          "nome": "PK_NOTICIA",
                          "tipo": "P"
                        }
                      ],
                      "totalRegistros": 5,
                      "versaoOracle": "Oracle Database 21c Express Edition"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "❌ Erro durante diagnóstico",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "Erro de diagnóstico",
                    value = """
                    {
                      "timestamp": "2025-10-28T19:00:00",
                      "status": 500,
                      "error": "Erro Interno do Servidor",
                      "message": "Erro durante execução do diagnóstico"
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<Map<String, Object>> diagnosticarTbNoticia() {
        log.info("Iniciando diagnóstico da tabela TB_NOTICIA");
        
        Map<String, Object> resultado = new HashMap<>();
        
        try {
            // 1. Verificar se a tabela existe
            Query tabelaExiste = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = 'TB_NOTICIA'"
            );
            Long tabelaCount = ((Number) tabelaExiste.getSingleResult()).longValue();
            resultado.put("tabelaExiste", tabelaCount > 0);
            
            if (tabelaCount > 0) {
                // 2. Verificar estrutura da tabela
                Query estrutura = entityManager.createNativeQuery(
                    "SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE, COLUMN_ID " +
                    "FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'TB_NOTICIA' ORDER BY COLUMN_ID"
                );
                List<Object[]> colunas = estrutura.getResultList();
                
                List<Map<String, Object>> estruturaColunas = new ArrayList<>();
                for (Object[] coluna : colunas) {
                    Map<String, Object> colunaInfo = new HashMap<>();
                    colunaInfo.put("nome", coluna[0]);
                    colunaInfo.put("tipo", coluna[1]);
                    colunaInfo.put("tamanho", coluna[2]);
                    colunaInfo.put("nullable", coluna[3]);
                    colunaInfo.put("ordem", coluna[4]);
                    estruturaColunas.add(colunaInfo);
                }
                resultado.put("estruturaColunas", estruturaColunas);
                
                // 3. Verificar sequência
                Query sequenciaExiste = entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM USER_SEQUENCES WHERE SEQUENCE_NAME = 'SEQ_NOTICIA'"
                );
                Long sequenciaCount = ((Number) sequenciaExiste.getSingleResult()).longValue();
                resultado.put("sequenciaExiste", sequenciaCount > 0);
                
                // 4. Verificar índices
                Query indices = entityManager.createNativeQuery(
                    "SELECT INDEX_NAME, INDEX_TYPE, STATUS FROM USER_INDEXES WHERE TABLE_NAME = 'TB_NOTICIA' ORDER BY INDEX_NAME"
                );
                List<Object[]> indicesList = indices.getResultList();
                
                List<Map<String, Object>> indicesInfo = new ArrayList<>();
                for (Object[] indice : indicesList) {
                    Map<String, Object> indiceInfo = new HashMap<>();
                    indiceInfo.put("nome", indice[0]);
                    indiceInfo.put("tipo", indice[1]);
                    indiceInfo.put("status", indice[2]);
                    indicesInfo.add(indiceInfo);
                }
                resultado.put("indices", indicesInfo);
                
                // 5. Verificar constraints
                Query constraints = entityManager.createNativeQuery(
                    "SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE FROM USER_CONSTRAINTS WHERE TABLE_NAME = 'TB_NOTICIA' ORDER BY CONSTRAINT_NAME"
                );
                List<Object[]> constraintsList = constraints.getResultList();
                
                List<Map<String, Object>> constraintsInfo = new ArrayList<>();
                for (Object[] constraint : constraintsList) {
                    Map<String, Object> constraintInfo = new HashMap<>();
                    constraintInfo.put("nome", constraint[0]);
                    constraintInfo.put("tipo", constraint[1]);
                    constraintsInfo.add(constraintInfo);
                }
                resultado.put("constraints", constraintsInfo);
                
                // 6. Verificar dados existentes
                Query totalRegistros = entityManager.createNativeQuery("SELECT COUNT(*) FROM TB_NOTICIA");
                Long total = ((Number) totalRegistros.getSingleResult()).longValue();
                resultado.put("totalRegistros", total);
                
                // 7. Verificar dados de exemplo
                if (total > 0) {
                    Query dadosExemplo = entityManager.createNativeQuery(
                        "SELECT ID_NOTICIA, FONTE, DATA_CAPTURA, ATIVO, CATEGORIA, SENTIMENTO, " +
                        "CASE WHEN DADOS_JSON IS NOT NULL THEN 'JSON_PRESENTE' ELSE 'JSON_AUSENTE' END as STATUS_JSON, " +
                        "CASE WHEN DADOS_JSON IS NOT NULL THEN LENGTH(DADOS_JSON) ELSE 0 END as TAMANHO_JSON " +
                        "FROM TB_NOTICIA WHERE ROWNUM <= 3"
                    );
                    List<Object[]> exemplos = dadosExemplo.getResultList();
                    
                    List<Map<String, Object>> dadosExemploInfo = new ArrayList<>();
                    for (Object[] exemplo : exemplos) {
                        Map<String, Object> exemploInfo = new HashMap<>();
                        exemploInfo.put("id", exemplo[0]);
                        exemploInfo.put("fonte", exemplo[1]);
                        exemploInfo.put("dataCaptura", exemplo[2]);
                        exemploInfo.put("ativo", exemplo[3]);
                        exemploInfo.put("categoria", exemplo[4]);
                        exemploInfo.put("sentimento", exemplo[5]);
                        exemploInfo.put("statusJson", exemplo[6]);
                        exemploInfo.put("tamanhoJson", exemplo[7]);
                        dadosExemploInfo.add(exemploInfo);
                    }
                    resultado.put("dadosExemplo", dadosExemploInfo);
                }
                
                // 8. Verificar versão do Oracle
                Query versaoOracle = entityManager.createNativeQuery("SELECT BANNER FROM V$VERSION WHERE ROWNUM = 1");
                String versao = (String) versaoOracle.getSingleResult();
                resultado.put("versaoOracle", versao);
                
                // 9. Testar suporte a JSON
                try {
                    Query jsonTest = entityManager.createNativeQuery(
                        "SELECT CASE WHEN JSON_EXTRACT('{\"teste\": \"valor\"}', '$.teste') IS NOT NULL THEN 'JSON_SUPPORTED' ELSE 'JSON_NOT_SUPPORTED' END FROM DUAL"
                    );
                    String jsonSupport = (String) jsonTest.getSingleResult();
                    resultado.put("jsonSupport", jsonSupport);
                } catch (Exception e) {
                    resultado.put("jsonSupport", "JSON_NOT_SUPPORTED - Erro: " + e.getMessage());
                }
                
            } else {
                resultado.put("erro", "Tabela TB_NOTICIA não existe");
            }
            
            resultado.put("status", "SUCCESS");
            log.info("Diagnóstico concluído com sucesso");
            
        } catch (Exception e) {
            log.error("Erro durante diagnóstico", e);
            resultado.put("status", "ERROR");
            resultado.put("erro", e.getMessage());
        }
        
        return ResponseEntity.ok(resultado);
    }
}
