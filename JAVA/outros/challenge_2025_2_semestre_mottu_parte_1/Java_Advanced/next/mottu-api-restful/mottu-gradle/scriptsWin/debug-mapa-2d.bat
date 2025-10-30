@echo off
echo ========================================
echo   DEBUG MAPA 2D - ANÁLISE COMPLETA
echo ========================================
echo.

echo [1/4] Iniciando o frontend...
cd ..\mottu-web
start "Frontend Debug" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo [2/4] Aguardando o frontend carregar...
timeout /t 5 /nobreak > nul

echo.
echo [3/4] Abrindo o mapa 2D no navegador...
start http://localhost:3000/mapa-2d

echo.
echo [4/4] Abrindo DevTools automaticamente...
timeout /t 2 /nobreak > nul
echo Abra o DevTools (F12) e vá para a aba Console

echo.
echo ========================================
echo   DEBUG INICIADO!
echo ========================================
echo.
echo "INSTRUÇÕES DE DEBUG:"
echo "1. Abra o DevTools (F12)"
echo "2. Vá para a aba Console"
echo "3. Clique em um pátio para abrir o mapa"
echo "4. Verifique os logs no console:"
echo.
echo "LOGS ESPERADOS:"
echo "- '📊 Dados do mapa Limão recebidos:' - Dados da API"
echo "- '🎯 Boxes mapeados para renderização:' - Dados mapeados"
echo "- '🎨 Renderizando box:' - Cada box sendo renderizado"
echo "- 'Mouse enter box:' - Quando passar o mouse"
echo.
echo "PROBLEMAS POSSÍVEIS:"
echo "- Se não aparecer '📊 Dados do mapa': API não está funcionando"
echo "- Se não aparecer '🎯 Boxes mapeados': Problema no mapeamento"
echo "- Se não aparecer '🎨 Renderizando box': Problema na renderização"
echo "- Se não aparecer 'Mouse enter box': Problema nos eventos"
echo.
pause
