-- Script de diagnóstico para verificar problemas de liberação
-- Execute este script no banco de dados Oracle para verificar o estado atual

-- 1. Verificar estacionamentos ativos para as placas em questão
SELECT 
    e.ID_ESTACIONAMENTO,
    e.TB_VEICULO_ID_VEICULO,
    v.PLACA,
    e.TB_BOX_ID_BOX,
    b.NOME as BOX_NOME,
    e.TB_PATIO_ID_PATIO,
    p.NOME_PATIO,
    e.ESTA_ESTACIONADO,
    e.DATA_ENTRADA,
    e.DATA_SAIDA,
    e.DATA_ULTIMA_ATUALIZACAO
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE v.PLACA IN ('EGX1D92', 'EGC4F67')
ORDER BY e.DATA_ULTIMA_ATUALIZACAO DESC;

-- 2. Verificar status dos boxes relacionados
SELECT 
    b.ID_BOX,
    b.NOME,
    b.STATUS,
    b.DATA_ENTRADA,
    b.DATA_SAIDA,
    p.NOME_PATIO
FROM TB_BOX b
JOIN TB_PATIO p ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE b.NOME IN ('guarulhos001', 'guarulhos002')
ORDER BY b.ID_BOX;

-- 3. Contar estacionamentos ativos por pátio
SELECT 
    p.ID_PATIO,
    p.NOME_PATIO,
    COUNT(*) as ESTACIONAMENTOS_ATIVOS
FROM TB_ESTACIONAMENTO e
JOIN TB_PATIO p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE e.ESTA_ESTACIONADO = 1
GROUP BY p.ID_PATIO, p.NOME_PATIO;

-- 4. Verificar se há inconsistências (box com STATUS='L' mas há estacionamento ativo)
SELECT 
    b.ID_BOX,
    b.NOME,
    b.STATUS as BOX_STATUS,
    e.ID_ESTACIONAMENTO,
    e.ESTA_ESTACIONADO,
    v.PLACA
FROM TB_BOX b
LEFT JOIN TB_ESTACIONAMENTO e ON b.ID_BOX = e.TB_BOX_ID_BOX AND e.ESTA_ESTACIONADO = 1
LEFT JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
WHERE b.NOME IN ('guarulhos001', 'guarulhos002')
ORDER BY b.ID_BOX;

-- 5. Verificar se há múltiplos estacionamentos ativos para o mesmo veículo
SELECT 
    v.PLACA,
    COUNT(*) as TOTAL_ESTACIONAMENTOS_ATIVOS,
    LISTAGG(e.ID_ESTACIONAMENTO, ', ') WITHIN GROUP (ORDER BY e.ID_ESTACIONAMENTO) as IDS_ESTACIONAMENTOS
FROM TB_VEICULO v
JOIN TB_ESTACIONAMENTO e ON v.ID_VEICULO = e.TB_VEICULO_ID_VEICULO
WHERE e.ESTA_ESTACIONADO = 1
GROUP BY v.PLACA
HAVING COUNT(*) > 1;




