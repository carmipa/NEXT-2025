-- ==========================================
-- CORREÇÃO DO PROBLEMA MOLDELO vs MODELO
-- ==========================================
-- Este script verifica e corrige a inconsistência na TB_VEICULO

-- 1. VERIFICAR QUAL COLUNA EXISTE
SELECT column_name, data_type, data_length
FROM user_tab_columns 
WHERE table_name = 'TB_VEICULO' 
AND column_name IN ('MOLDELO', 'MODELO')
ORDER BY column_name;

-- 2. SE EXISTIR APENAS MOLDELO (typo), renomear para MODELO
-- DESCOMENTE A LINHA ABAIXO SE NECESSÁRIO:
-- ALTER TABLE TB_VEICULO RENAME COLUMN MOLDELO TO MODELO;

-- 3. SE EXISTIR APENAS MODELO, tudo OK - não fazer nada

-- 4. SE EXISTIREM AMBAS, verificar dados e decidir qual manter
-- DESCOMENTE AS LINHAS ABAIXO SE NECESSÁRIO:
-- SELECT COUNT(*) as TOTAL_REGISTROS FROM TB_VEICULO;
-- SELECT COUNT(*) as COM_MOLDELO FROM TB_VEICULO WHERE MOLDELO IS NOT NULL;
-- SELECT COUNT(*) as COM_MODELO FROM TB_VEICULO WHERE MODELO IS NOT NULL;

-- 5. Se MOLDELO estiver vazio e MODELO populado, remover MOLDELO:
-- DESCOMENTE SE NECESSÁRIO:
-- ALTER TABLE TB_VEICULO DROP COLUMN MOLDELO;

-- 6. Se MODELO estiver vazio e MOLDELO populado, copiar dados e remover MOLDELO:
-- DESCOMENTE SE NECESSÁRIO:
-- UPDATE TB_VEICULO SET MODELO = MOLDELO WHERE MODELO IS NULL;
-- ALTER TABLE TB_VEICULO DROP COLUMN MOLDELO;

