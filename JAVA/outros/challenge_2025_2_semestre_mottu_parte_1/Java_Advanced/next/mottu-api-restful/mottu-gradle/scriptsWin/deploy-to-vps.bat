@echo off
echo ========================================
echo   DEPLOY MOTTU PARA VPS LINUX
echo ========================================
echo.

echo [1/4] Compilando o projeto...
call gradlew.bat clean bootJar
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha na compilação
    pause
    exit /b 1
)
echo ✅ Compilação concluída

echo.
echo [2/4] Parando o serviço no VPS...
ssh root@91.108.120.60 "sudo systemctl stop mottu.service"
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Aviso: Não foi possível parar o serviço (pode não estar rodando)
)

echo.
echo [3/4] Enviando o JAR para o VPS...
scp "build\libs\mottu-gradle-0.0.1-SNAPSHOT.jar" root@91.108.120.60:/opt/app/mottu-app.jar
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha no upload do JAR
    pause
    exit /b 1
)
echo ✅ JAR enviado com sucesso

echo.
echo [4/4] Iniciando o serviço no VPS...
ssh root@91.108.120.60 "sudo systemctl start mottu.service"
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha ao iniciar o serviço
    pause
    exit /b 1
)
echo ✅ Serviço iniciado com sucesso

echo.
echo ========================================
echo   DEPLOY CONCLUÍDO COM SUCESSO!
echo ========================================
echo.
echo O sistema está rodando em:
echo - Frontend: http://91.108.120.60:3000
echo - Backend:  http://91.108.120.60:8080/api
echo.
echo Para verificar o status:
echo ssh root@91.108.120.60 "sudo systemctl status mottu.service"
echo.
pause

