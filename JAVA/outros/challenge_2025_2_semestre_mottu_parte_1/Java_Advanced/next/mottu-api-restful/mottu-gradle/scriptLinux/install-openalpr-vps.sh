#!/bin/bash

echo "========================================"
echo "   INSTALAR OPENALPR NO VPS LINUX"
echo "========================================"
echo

echo "[1/4] Atualizando o sistema..."
ssh root@91.108.120.60 "apt update"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao atualizar o sistema"
    exit 1
fi
echo "✅ Sistema atualizado"

echo
echo "[2/4] Instalando dependências básicas..."
ssh root@91.108.120.60 "apt install -y wget curl build-essential cmake git"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao instalar dependências básicas"
    exit 1
fi
echo "✅ Dependências básicas instaladas"

echo
echo "[3/4] Instalando OpenALPR..."
ssh root@91.108.120.60 "apt install -y openalpr openalpr-daemon openalpr-utils libopenalpr-dev"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao instalar OpenALPR"
    echo
    echo "Tentando instalação manual..."
    ssh root@91.108.120.60 "wget -O - https://deb.openalpr.com/openalpr.gpg.key | apt-key add -"
    ssh root@91.108.120.60 "echo 'deb https://deb.openalpr.com/openalpr-2.3.0/ ubuntu/ main' > /etc/apt/sources.list.d/openalpr.list"
    ssh root@91.108.120.60 "apt update && apt install -y openalpr openalpr-daemon openalpr-utils libopenalpr-dev"
    if [ $? -ne 0 ]; then
        echo "❌ ERRO: Falha na instalação manual do OpenALPR"
        exit 1
    fi
fi
echo "✅ OpenALPR instalado"

echo
echo "[4/4] Verificando a instalação..."
ssh root@91.108.120.60 "alpr --version"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: OpenALPR não está funcionando após a instalação"
    exit 1
fi
echo "✅ OpenALPR funcionando"

echo
echo "========================================"
echo "   OPENALPR INSTALADO COM SUCESSO!"
echo "========================================"
echo
echo "Agora você pode:"
echo "1. Executar ./check-vps-openalpr.sh para verificar"
echo "2. Executar ./deploy-to-vps.sh para fazer o deploy"
echo

