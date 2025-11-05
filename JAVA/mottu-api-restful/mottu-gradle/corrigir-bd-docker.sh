#!/bin/bash
# ==================================================
# Script para executar correção no banco Docker
# ==================================================

# Encontrar o container Oracle
CONTAINER_NAME=$(docker ps --filter "ancestor=oracle/database" --format "{{.Names}}" | head -1)

if [ -z "$CONTAINER_NAME" ]; then
    CONTAINER_NAME=$(docker ps --format "{{.Names}}" | grep -i oracle | head -1)
fi

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ Container Oracle não encontrado!"
    echo "Listando todos os containers..."
    docker ps
    exit 1
fi

echo "✅ Container encontrado: $CONTAINER_NAME"
echo ""

# Executar script SQL via Docker
echo "🔧 Executando correção no banco de dados..."
docker exec -i "$CONTAINER_NAME" sqlplus -s relacaoDireta/paulo1@localhost/XEPDB1 <<EOF
SET ECHO ON
SET FEEDBACK ON
SET VERIFY OFF

-- Verificar estado antes
SELECT 
    'ANTES' as STATUS,
    e.ID_ESTACIONAMENTO,
    v.PLACA,
    b.STATUS as BOX_STATUS,
    e.ESTA_ESTACIONADO
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE v.PLACA IN ('EGX1D92', 'EGC4F67')
ORDER BY e.ID_ESTACIONAMENTO;

-- Corrigir
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

COMMIT;

-- Verificar estado depois
SELECT 
    'DEPOIS' as STATUS,
    e.ID_ESTACIONAMENTO,
    v.PLACA,
    b.STATUS as BOX_STATUS,
    e.ESTA_ESTACIONADO
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE v.PLACA IN ('EGX1D92', 'EGC4F67')
ORDER BY e.ID_ESTACIONAMENTO;

EXIT;
EOF

echo ""
echo "✅ Correção concluída!"





