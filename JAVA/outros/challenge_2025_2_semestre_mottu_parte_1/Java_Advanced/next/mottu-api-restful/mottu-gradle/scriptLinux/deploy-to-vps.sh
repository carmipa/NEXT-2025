#!/bin/bash

echo "========================================"
echo "   DEPLOY MOTTU PARA VPS LINUX"
echo "========================================"
echo

echo "[1/4] Compilando o projeto..."
./gradlew clean bootJar
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha na compilação"
    exit 1
fi
echo "✅ Compilação concluída"

echo
echo "[2/4] Parando o serviço no VPS..."
ssh root@91.108.120.60 "sudo systemctl stop mottu.service"
if [ $? -ne 0 ]; then
    echo "⚠️  Aviso: Não foi possível parar o serviço (pode não estar rodando)"
fi

echo
echo "[3/4] Enviando o JAR para o VPS..."
scp "build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar" root@91.108.120.60:/opt/app/mottu-app.jar
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha no upload do JAR"
    exit 1
fi
echo "✅ JAR enviado com sucesso"

echo
echo "[4/4] Iniciando o serviço no VPS..."
ssh root@91.108.120.60 "sudo systemctl start mottu.service"
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao iniciar o serviço"
    exit 1
fi
echo "✅ Serviço iniciado com sucesso"

echo
echo "========================================"
echo "   DEPLOY CONCLUÍDO COM SUCESSO!"
echo "========================================"
echo
echo "O sistema está rodando em:"
echo "- Frontend: http://91.108.120.60:3000"
echo "- Backend:  http://91.108.120.60:8080/api"
echo
echo "Para verificar o status:"
echo "ssh root@91.108.120.60 'sudo systemctl status mottu.service'"
echo

