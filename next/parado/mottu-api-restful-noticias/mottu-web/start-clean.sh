#!/bin/bash

echo "========================================"
echo " Mottu Web - Iniciando com Limpeza"
echo "========================================"
echo ""

echo "[1/3] Parando todos os processos Node.js..."
pkill -f node > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Processos Node.js encerrados"
else
    echo "ℹ Nenhum processo Node.js estava rodando"
fi

echo ""
echo "[2/3] Aguardando 2 segundos..."
sleep 2

echo ""
echo "[3/3] Iniciando servidor Next.js..."
echo ""
npm run dev












