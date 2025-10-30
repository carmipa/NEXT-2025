#!/bin/bash

echo "========================================"
echo "   COMPILAR JAR MOTTU"
echo "========================================"
echo

echo "[1/2] Limpando build anterior..."
./gradlew clean
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha na limpeza"
    exit 1
fi
echo "✅ Limpeza concluída"

echo
echo "[2/2] Compilando o JAR..."
./gradlew bootJar
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha na compilação"
    exit 1
fi
echo "✅ JAR compilado com sucesso"

echo
echo "========================================"
echo "   COMPILAÇÃO CONCLUÍDA!"
echo "========================================"
echo
echo "JAR gerado em: build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar"
echo
echo "Para fazer o deploy:"
echo "./scriptsLinux/deploy-to-vps.sh"
echo

