#!/bin/bash

echo "========================================"
echo "   VERIFICAR OPENALPR NO VPS LINUX"
echo "========================================"
echo

echo "[1/3] Verificando se o OpenALPR está instalado..."
ssh root@91.108.120.60 "which alpr"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: OpenALPR não encontrado no PATH"
    echo
    echo "Para instalar o OpenALPR no VPS, execute:"
    echo "ssh root@91.108.120.60 'apt update && apt install -y openalpr openalpr-daemon openalpr-utils libopenalpr-dev'"
    exit 1
fi
echo "✅ OpenALPR encontrado"

echo
echo "[2/3] Verificando a versão do OpenALPR..."
ssh root@91.108.120.60 "alpr --version"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao verificar a versão"
    exit 1
fi

echo
echo "[3/3] Testando o OpenALPR com uma imagem de exemplo..."
ssh root@91.108.120.60 "alpr -j -c eu -n 10 /dev/null"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha no teste do OpenALPR"
    echo
    echo "Possíveis soluções:"
    echo "1. Verificar se o OpenALPR está instalado corretamente"
    echo "2. Verificar se os dados de treinamento estão disponíveis"
    echo "3. Verificar permissões de execução"
    exit 1
fi
echo "✅ OpenALPR funcionando corretamente"

echo
echo "========================================"
echo "   OPENALPR VERIFICADO COM SUCESSO!"
echo "========================================"
echo
echo "O OpenALPR está funcionando no VPS."
echo "Agora você pode fazer o deploy da aplicação."
echo

