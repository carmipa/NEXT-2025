-- Teste da consulta do endpoint /api/vagas/mapa
-- Verificar se há boxes cadastrados e se a consulta está funcionando

-- 1. Verificar todos os boxes
SELECT COUNT(*) as total_boxes FROM TB_BOX;

-- 2. Verificar boxes por pátio
SELECT 
    p.ID_PATIO,
    p.NOME_PATIO,
    COUNT(b.ID_BOX) as total_boxes
FROM TB_PATIO p
LEFT JOIN TB_BOX b ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
GROUP BY p.ID_PATIO, p.NOME_PATIO
ORDER BY p.ID_PATIO;

-- 3. Testar a consulta exata do endpoint para pátio Limão (ID 3)
SELECT 
    b.ID_BOX, 
    b.NOME, 
    b.STATUS, 
    b.DATA_ENTRADA, 
    b.DATA_SAIDA, 
    b.OBSERVACAO,
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

-- 4. Testar a consulta exata do endpoint para pátio Guarulhos (ID 2)
SELECT 
    b.ID_BOX, 
    b.NOME, 
    b.STATUS, 
    b.DATA_ENTRADA, 
    b.DATA_SAIDA, 
    b.OBSERVACAO,
    v.PLACA, 
    v.MODELO, 
    v.FABRICANTE, 
    v.TAG_BLE_ID
FROM TB_BOX b
LEFT JOIN TB_VEICULOBOX vb ON vb.TB_BOX_ID_BOX = b.ID_BOX
LEFT JOIN TB_VEICULO v ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
WHERE b.TB_PATIO_ID_PATIO = 2
ORDER BY b.ID_BOX
FETCH FIRST 10 ROWS ONLY;

-- 5. Verificar se há veículos cadastrados
SELECT COUNT(*) as total_veiculos FROM TB_VEICULO;

-- 6. Verificar se há vínculos veículo-box
SELECT COUNT(*) as total_vinculos FROM TB_VEICULOBOX;





