-- ==========================================
-- SIMPLES: REMOVER COLUNA MOLDELO
-- ==========================================

-- 1. Verificar se existem dados em MOLDELO que não estão em MODELO
SELECT ID_VEICULO, PLACA, MOLDELO, MODELO 
FROM TB_VEICULO 
WHERE MOLDELO IS NOT NULL AND (MODELO IS NULL OR MODELO = '');

-- 2. Se houver dados em MOLDELO e MODELO estiver vazio, copiar
UPDATE TB_VEICULO 
SET MODELO = MOLDELO 
WHERE MOLDELO IS NOT NULL AND (MODELO IS NULL OR MODELO = '');

-- 3. Remover a coluna MOLDELO
ALTER TABLE TB_VEICULO DROP COLUMN MOLDELO;

COMMIT;

