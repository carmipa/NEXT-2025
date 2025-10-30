@echo off
echo ========================================
echo   REINICIAR SERVIÇO NO VPS
echo ========================================
echo.

echo [1/2] Parando o serviço...
ssh root@91.108.120.60 "sudo systemctl stop mottu.service"
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Aviso: Não foi possível parar o serviço
)

echo.
echo [2/2] Iniciando o serviço...
ssh root@91.108.120.60 "sudo systemctl start mottu.service"
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha ao iniciar o serviço
    pause
    exit /b 1
)
echo ✅ Serviço reiniciado com sucesso

echo.
echo ========================================
echo   SERVIÇO REINICIADO!
echo ========================================
echo.
echo "Para verificar o status:"
echo "ssh root@91.108.120.60 'sudo systemctl status mottu.service'"
echo.
pause

