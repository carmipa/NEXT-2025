-- Teste específico para boxes do pátio Limão (ID 3)
-- Verificar se há boxes cadastrados e se a consulta está funcionando

-- 1. Verificar se há boxes para o pátio Limão
SELECT 
    b.ID_BOX, 
    b.NOME, 
    b.STATUS, 
    b.DATA_ENTRADA, 
    b.DATA_SAIDA, 
    b.OBSERVACAO,
    p.NOME_PATIO
FROM TB_BOX b
JOIN TB_PATIO p ON p.ID_PATIO = b.TB_PATIO_ID_PATIO
WHERE b.TB_PATIO_ID_PATIO = 3
ORDER BY b.ID_BOX
FETCH FIRST 10 ROWS ONLY;

-- 2. Verificar se há veículos associados aos boxes
SELECT 
    b.ID_BOX, 
    b.NOME, 
    b.STATUS,
    v.PLACA, 
    v.MODELO, 
    v.FABRICANTE, 
    v.TAG_BLE_ID
FROM TB_BOX b
LEFT JOIN TB_VEICULOBOX vb ON vb.TB_BOX_ID_BOX = b.ID_BOX
LEFT JOIN TB_VEICULO v ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
WHERE b.TB_PATIO_ID_PATIO = 3
ORDER BY b.ID_BOX
FETCH FIRST 10 ROWS ONLY;

-- 3. Contar total de boxes por status
SELECT 
    STATUS,
    COUNT(*) as total
FROM TB_BOX 
WHERE TB_PATIO_ID_PATIO = 3
GROUP BY STATUS;





