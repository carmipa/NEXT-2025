@echo off
echo ========================================
echo   TESTE MAPA 2D - DEBUG HOVER
echo ========================================
echo.

echo [1/3] Iniciando o frontend...
cd ..\mottu-web
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo [2/3] Aguardando o frontend carregar...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Abrindo o mapa 2D no navegador...
start http://localhost:3000/mapa-2d

echo.
echo ========================================
echo   TESTE INICIADO!
echo ========================================
echo.
echo "Instruções:"
echo "1. Abra o DevTools (F12)"
echo "2. Vá para a aba Console"
echo "3. Clique em um pátio para abrir o mapa"
echo "4. Passe o mouse sobre uma vaga ocupada (vermelha)"
echo "5. Verifique os logs no console"
echo.
echo "Logs esperados:"
echo "- 'Mouse enter box:' com status e veiculo"
echo "- 'Setting tooltip for occupied box'"
echo "- 'Tooltip state:' com dados do tooltip"
echo.
pause
