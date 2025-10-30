-- ==========================================
-- ANÁLISE COMPLETA DO BANCO DE DADOS MOTTU
-- ==========================================
-- Este script verifica a estrutura atual e identifica problemas
-- SEM ALTERAR TABELAS EXISTENTES

-- 1. VERIFICAR EXISTÊNCIA DAS TABELAS PRINCIPAIS
SELECT 'TB_PATIO' as TABELA, COUNT(*) as EXISTE FROM user_tables WHERE table_name = 'TB_PATIO'
UNION ALL
SELECT 'TB_ZONA', COUNT(*) FROM user_tables WHERE table_name = 'TB_ZONA'
UNION ALL
SELECT 'TB_BOX', COUNT(*) FROM user_tables WHERE table_name = 'TB_BOX'
UNION ALL
SELECT 'TB_VEICULO', COUNT(*) FROM user_tables WHERE table_name = 'TB_VEICULO'
UNION ALL
SELECT 'TB_VEICULOBOX', COUNT(*) FROM user_tables WHERE table_name = 'TB_VEICULOBOX'
UNION ALL
SELECT 'TB_CLIENTE', COUNT(*) FROM user_tables WHERE table_name = 'TB_CLIENTE'
UNION ALL
SELECT 'TB_CONTATO', COUNT(*) FROM user_tables WHERE table_name = 'TB_CONTATO'
UNION ALL
SELECT 'TB_ENDERECO', COUNT(*) FROM user_tables WHERE table_name = 'TB_ENDERECO'
UNION ALL
SELECT 'TB_RASTREAMENTO', COUNT(*) FROM user_tables WHERE table_name = 'TB_RASTREAMENTO'
UNION ALL
SELECT 'TB_LOG_MOVIMENTACAO', COUNT(*) FROM user_tables WHERE table_name = 'TB_LOG_MOVIMENTACAO';

-- 2. VERIFICAR COLUNAS CRÍTICAS DA TB_VEICULO (MOLDELO vs MODELO)
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns 
WHERE table_name = 'TB_VEICULO' 
AND column_name IN ('MOLDELO', 'MODELO')
ORDER BY column_name;

-- 3. VERIFICAR ESTRUTURA DA TB_ZONA (FK composta para pátio)
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns 
WHERE table_name = 'TB_ZONA'
AND column_name IN ('TB_PATIO_ID_PATIO', 'TB_PATIO_STATUS')
ORDER BY column_name;

-- 4. VERIFICAR ESTRUTURA DA TB_BOX (FK para pátio)
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns 
WHERE table_name = 'TB_BOX'
AND column_name IN ('TB_PATIO_ID_PATIO', 'STATUS')
ORDER BY column_name;

-- 5. VERIFICAR CONSTRAINTS DE FK CRÍTICAS
SELECT 
    c.constraint_name,
    c.table_name,
    c.r_constraint_name,
    r.table_name as REFERENCED_TABLE
FROM user_constraints c
LEFT JOIN user_constraints r ON c.r_constraint_name = r.constraint_name
WHERE c.table_name IN ('TB_ZONA', 'TB_BOX', 'TB_VEICULOBOX')
AND c.constraint_type = 'R'
ORDER BY c.table_name;

-- 6. VERIFICAR SEQUENCES EXISTENTES
SELECT sequence_name, last_number
FROM user_sequences 
WHERE sequence_name LIKE 'SEQ_TB_%'
ORDER BY sequence_name;

-- 7. VERIFICAR DADOS EXISTENTES (contagem)
SELECT 'TB_PATIO' as TABELA, COUNT(*) as REGISTROS FROM TB_PATIO
UNION ALL
SELECT 'TB_ZONA', COUNT(*) FROM TB_ZONA
UNION ALL
SELECT 'TB_BOX', COUNT(*) FROM TB_BOX
UNION ALL
SELECT 'TB_VEICULO', COUNT(*) FROM TB_VEICULO
UNION ALL
SELECT 'TB_VEICULOBOX', COUNT(*) FROM TB_VEICULOBOX
UNION ALL
SELECT 'TB_CLIENTE', COUNT(*) FROM TB_CLIENTE;

-- 8. VERIFICAR STATUS DISTINTOS EM TB_BOX
SELECT DISTINCT STATUS, COUNT(*) as QUANTIDADE
FROM TB_BOX
GROUP BY STATUS
ORDER BY STATUS;

-- 9. VERIFICAR STATUS DISTINTOS EM TB_PATIO
SELECT DISTINCT STATUS, COUNT(*) as QUANTIDADE
FROM TB_PATIO
GROUP BY STATUS
ORDER BY STATUS;

-- 10. VERIFICAR STATUS DISTINTOS EM TB_ZONA
SELECT DISTINCT STATUS, COUNT(*) as QUANTIDADE
FROM TB_ZONA
GROUP BY STATUS
ORDER BY STATUS;

-- ==========================================
-- RESUMO DA ANÁLISE
-- ==========================================
/*
POSSÍVEIS PROBLEMAS IDENTIFICADOS:

1. TB_VEICULO: Verificar se existe coluna MOLDELO ou MODELO
   - Se existir MOLDELO: pode ser typo, considerar renomear
   - Se existir MODELO: ajustar código Java para usar MODELO

2. TB_LOG_MOVIMENTACAO: Tabela nova, pode ser criada sem problemas

3. FK COMPOSTA TB_ZONA: Verificar se TB_PATIO_STATUS existe e é consistente

4. SEQUENCES: Verificar se todas as sequences necessárias existem

SOLUÇÕES RECOMENDADAS:
- Apenas criar novas tabelas (TB_LOG_MOVIMENTACAO)
- Não alterar estrutura de tabelas existentes
- Ajustar código Java se necessário para compatibilidade
*/

