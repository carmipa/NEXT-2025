@echo off
echo ========================================
echo   CRIAR DADOS DE TESTE PARA HOVER
echo ========================================
echo.

echo [1/4] Criando veículo de teste para Limão...
curl -X POST "http://localhost:8080/api/veiculos" -H "Content-Type: application/json" -d "{\"placa\":\"ABC1234\",\"modelo\":\"Honda CB 600F\",\"fabricante\":\"Honda\",\"tagBleId\":\"TAG001\"}"
echo.

echo [2/4] Criando veículo de teste para Guarulhos...
curl -X POST "http://localhost:8080/api/veiculos" -H "Content-Type: application/json" -d "{\"placa\":\"XYZ9876\",\"modelo\":\"Yamaha MT-07\",\"fabricante\":\"Yamaha\",\"tagBleId\":\"TAG002\"}"
echo.

echo [3/4] Ocupando vaga BLimao001 no Limão...
curl -X PUT "http://localhost:8080/api/vagas/102/ocupar" -H "Content-Type: application/json" -d "{\"placa\":\"ABC1234\"}"
echo.

echo [4/4] Ocupando vaga Gru001 no Guarulhos...
curl -X PUT "http://localhost:8080/api/vagas/2/ocupar" -H "Content-Type: application/json" -d "{\"placa\":\"XYZ9876\"}"
echo.

echo ========================================
echo   DADOS DE TESTE CRIADOS!
echo ========================================
echo.
echo "Agora teste o hover no mapa 2D:"
echo "1. Acesse: http://localhost:3000/mapa-2d"
echo "2. Clique em um pátio"
echo "3. Passe o mouse sobre as vagas ocupadas (vermelhas)"
echo.
pause
