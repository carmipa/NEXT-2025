@echo off
echo ========================================
echo  Mottu Web - Iniciando com Limpeza
echo ========================================
echo.
echo [1/3] Parando todos os processos Node.js...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Processos Node.js encerrados
) else (
    echo ℹ Nenhum processo Node.js estava rodando
)
echo.
echo [2/3] Aguardando 2 segundos...
timeout /t 2 /nobreak >nul
echo.
echo [3/3] Iniciando servidor Next.js...
echo.
npm run dev












