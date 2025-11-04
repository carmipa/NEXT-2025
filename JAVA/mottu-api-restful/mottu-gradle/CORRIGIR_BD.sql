-- ==================================================
-- Script para corrigir inconsistência de liberação
-- Execute diretamente no SQL Developer
-- ==================================================

-- ==================================================
-- 1. VERIFICAR ESTADO ATUAL (ANTES DA CORREÇÃO)
-- ==================================================
SELECT 
    'ANTES' as STATUS,
    e.ID_ESTACIONAMENTO,
    v.PLACA,
    b.ID_BOX,
    b.NOME as BOX_NOME,
    b.STATUS as BOX_STATUS,
    e.ESTA_ESTACIONADO,
    e.DATA_SAIDA,
    TO_CHAR(e.DATA_ULTIMA_ATUALIZACAO, 'DD/MM/YYYY HH24:MI:SS') as ULTIMA_ATUALIZACAO
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE v.PLACA IN ('EGX1D92', 'EGC4F67')
ORDER BY e.ID_ESTACIONAMENTO;

-- ==================================================
-- 2. CORRIGIR INCONSISTÊNCIA
-- ==================================================
UPDATE RELACAODIRETA.TB_ESTACIONAMENTO e
SET 
    e.ESTA_ESTACIONADO = 0,
    e.DATA_SAIDA = CURRENT_TIMESTAMP,
    e.DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP
WHERE e.ESTA_ESTACIONADO = 1
AND EXISTS (
    SELECT 1 
    FROM RELACAODIRETA.TB_BOX b 
    WHERE b.ID_BOX = e.TB_BOX_ID_BOX 
    AND b.STATUS = 'L'
);

-- ==================================================
-- 3. COMMIT (IMPORTANTE!)
-- ==================================================
COMMIT;

-- ==================================================
-- 4. VERIFICAR ESTADO APÓS CORREÇÃO
-- ==================================================
SELECT 
    'DEPOIS' as STATUS,
    e.ID_ESTACIONAMENTO,
    v.PLACA,
    b.ID_BOX,
    b.NOME as BOX_NOME,
    b.STATUS as BOX_STATUS,
    e.ESTA_ESTACIONADO,
    e.DATA_SAIDA,
    TO_CHAR(e.DATA_ULTIMA_ATUALIZACAO, 'DD/MM/YYYY HH24:MI:SS') as ULTIMA_ATUALIZACAO
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE v.PLACA IN ('EGX1D92', 'EGC4F67')
ORDER BY e.ID_ESTACIONAMENTO;

-- ==================================================
-- 5. VERIFICAR SE AINDA HÁ INCONSISTÊNCIAS
-- ==================================================
SELECT 
    COUNT(*) as INCONSISTENCIAS_RESTANTES
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE e.ESTA_ESTACIONADO = 1
AND b.STATUS = 'L';
