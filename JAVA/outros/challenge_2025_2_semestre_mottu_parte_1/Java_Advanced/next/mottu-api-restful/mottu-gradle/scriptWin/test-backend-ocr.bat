@echo off
echo ========================================
echo TESTE DO BACKEND COM OPENALPR
echo ========================================
echo.

echo 1. Compilando o projeto...
call gradlew clean build -x test
if %errorlevel% neq 0 (
    echo ❌ Erro na compilação
    pause
    exit /b 1
)
echo ✅ Compilação concluída

echo.
echo 2. Iniciando o backend...
echo Aguarde alguns segundos para o Spring Boot inicializar...
echo.

REM Iniciar o backend em background
start /b gradlew bootRun --args="--spring.profiles.active=dev"

REM Aguardar um pouco para o Spring Boot inicializar
timeout /t 30 /nobreak > nul

echo.
echo 3. Testando endpoint de OCR...
echo.

REM Testar se o backend está rodando
curl -s http://localhost:8080/api/radar/iniciar-sessao
if %errorlevel% neq 0 (
    echo ❌ Backend não está respondendo
    echo Verifique se a porta 8080 está livre e se o Spring Boot iniciou corretamente
) else (
    echo ✅ Backend está respondendo
)

echo.
echo 4. Verificando logs...
echo Verifique os logs em: logs/
if exist "logs\ultima-saida-alpr-cfg-eu.json" (
    echo ✅ Logs de debug do OpenALPR encontrados
    type "logs\ultima-saida-alpr-cfg-eu.json"
) else (
    echo ⚠️ Nenhum log de debug do OpenALPR encontrado ainda
)

echo.
echo ========================================
echo TESTE CONCLUÍDO
echo ========================================
echo.
echo Para testar completamente:
echo 1. Acesse http://localhost:3000/radar/armazenar
echo 2. Tente fazer upload de uma imagem de placa
echo 3. Verifique os logs em logs/
echo.
pause





