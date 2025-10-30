#!/bin/bash

echo "🚀 Testando APIs do Dashboard..."

# Testar se o backend está rodando
echo "1. Verificando se o backend está rodando..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/dashboard/resumo

if [ $? -eq 0 ]; then
    echo "✅ Backend está rodando"
    
    echo "2. Testando endpoint /api/dashboard/resumo..."
    curl -s http://localhost:8080/api/dashboard/resumo | jq '.' || echo "Resposta (sem jq): $(curl -s http://localhost:8080/api/dashboard/resumo)"
    
    echo "3. Testando endpoint /api/dashboard/total-veiculos..."
    curl -s http://localhost:8080/api/dashboard/total-veiculos || echo "Erro no endpoint"
    
    echo "4. Testando endpoint /api/dashboard/total-clientes..."
    curl -s http://localhost:8080/api/dashboard/total-clientes || echo "Erro no endpoint"
    
    echo "5. Testando endpoint /api/veiculos/estacionados..."
    curl -s http://localhost:8080/api/veiculos/estacionados | jq '.' || echo "Resposta (sem jq): $(curl -s http://localhost:8080/api/veiculos/estacionados)"
    
    echo "6. Testando endpoint /api/patios/search (para verificar pátios)..."
    curl -s "http://localhost:8080/api/patios/search?page=0&size=1" | jq '.' || echo "Resposta (sem jq): $(curl -s "http://localhost:8080/api/patios/search?page=0&size=1")"
    
else
    echo "❌ Backend não está rodando. Execute: ./gradlew bootRun"
fi

echo "🎯 Teste concluído!"
