#!/bin/bash

echo "========================================"
echo "    MOTTU - Gerenciador de Portas"
echo "========================================"
echo

# Verificar se Java está instalado
if ! command -v java &> /dev/null; then
    echo "❌ Java não encontrado! Instale o Java 21 ou superior."
    exit 1
fi

echo "✅ Java encontrado!"

# Verificar se Gradle está disponível
if [ ! -f "./gradlew" ]; then
    echo "❌ Gradle wrapper não encontrado!"
    exit 1
fi

echo "✅ Gradle wrapper encontrado!"
echo

# Verificar portas comuns
echo "🔍 Verificando portas comuns..."

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Porta $port está ocupada"
        return 1
    else
        echo "✅ Porta $port está disponível"
        return 0
    fi
}

# Verificar portas
port_8080_available=0
port_8081_available=0
port_8082_available=0

if check_port 8080; then
    port_8080_available=1
fi

if check_port 8081; then
    port_8081_available=1
fi

if check_port 8082; then
    port_8082_available=1
fi

echo

# Decidir qual porta usar
if [ $port_8080_available -eq 1 ]; then
    echo "🎯 Usando porta padrão 8080"
    SPRING_PORT=8080
elif [ $port_8081_available -eq 1 ]; then
    echo "🎯 Usando porta alternativa 8081"
    SPRING_PORT=8081
elif [ $port_8082_available -eq 1 ]; then
    echo "🎯 Usando porta alternativa 8082"
    SPRING_PORT=8082
else
    echo "🎲 Usando porta dinâmica (Spring Boot escolherá automaticamente)"
    SPRING_PORT=0
fi

echo
echo "🚀 Iniciando aplicação MOTTU na porta $SPRING_PORT..."
echo
echo "💡 Dica: Se a porta estiver ocupada, o Spring Boot tentará automaticamente"
echo "   as portas 8081, 8082, 8083, etc."
echo

# Iniciar a aplicação
export JAVA_OPTS="-Xmx1024m -Xms512m"
./gradlew bootRun -Dserver.port=$SPRING_PORT $JAVA_OPTS

echo
echo "🏁 Aplicação finalizada."

