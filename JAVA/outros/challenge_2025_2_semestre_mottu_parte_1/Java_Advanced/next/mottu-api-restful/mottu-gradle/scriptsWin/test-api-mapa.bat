@echo off
echo ========================================
echo   TESTE API MAPA - VERIFICAR DADOS
echo ========================================
echo.

echo [1/3] Testando API do mapa Limão...
curl -X GET "http://localhost:8080/api/vagas/mapa?patioId=1" -H "Content-Type: application/json" | jq .
if %errorlevel% neq 0 (
    echo ❌ ERRO: API não está respondendo ou jq não está instalado
    echo Tentando sem jq...
    curl -X GET "http://localhost:8080/api/vagas/mapa?patioId=1" -H "Content-Type: application/json"
)

echo.
echo [2/3] Testando API do mapa Guarulhos...
curl -X GET "http://localhost:8080/api/vagas/mapa?patioId=2" -H "Content-Type: application/json" | jq .
if %errorlevel% neq 0 (
    echo ❌ ERRO: API não está respondendo ou jq não está instalado
    echo Tentando sem jq...
    curl -X GET "http://localhost:8080/api/vagas/mapa?patioId=2" -H "Content-Type: application/json"
)

echo.
echo [3/3] Verificando se o backend está rodando...
curl -X GET "http://localhost:8080/api/patios" -H "Content-Type: application/json"
if %errorlevel% neq 0 (
    echo ❌ ERRO: Backend não está rodando na porta 8080
    echo Execute: cd mottu-gradle && .\gradlew.bat bootRun
)

echo.
echo ========================================
echo   TESTE API CONCLUÍDO!
echo ========================================
echo.
pause
