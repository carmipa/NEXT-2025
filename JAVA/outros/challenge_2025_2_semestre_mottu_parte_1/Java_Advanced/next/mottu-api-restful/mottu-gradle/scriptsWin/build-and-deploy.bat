@echo off
echo ========================================
echo   BUILD E DEPLOY MOTTU (WINDOWS)
echo ========================================
echo.

echo [1/3] Compilando o JAR...
call gradlew.bat bootJar
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha na compilação
    pause
    exit /b 1
)
echo ✅ JAR compilado com sucesso

echo.
echo [2/3] Parando o serviço no VPS...
ssh root@91.108.120.60 "sudo systemctl stop mottu.service"
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Aviso: Não foi possível parar o serviço (pode não estar rodando)
)

echo.
echo [3/3] Enviando o JAR para o VPS...
scp "build\libs\mottu-gradle-0.0.1-SNAPSHOT.jar" root@91.108.120.60:/opt/app/mottu-app.jar
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha no upload do JAR
    pause
    exit /b 1
)
echo ✅ JAR enviado com sucesso

echo.
echo ========================================
echo   BUILD E DEPLOY CONCLUÍDOS!
echo ========================================
echo.
echo "Agora execute no VPS:"
echo "ssh root@91.108.120.60 'sudo systemctl restart mottu.service'"
echo.
echo "Para verificar o status:"
echo "ssh root@91.108.120.60 'sudo systemctl status mottu.service'"
echo.
pause

