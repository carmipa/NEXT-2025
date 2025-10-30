@echo off
echo ========================================
echo   TESTE HOVER FINAL - COM DADOS SIMULADOS
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
echo "INSTRUÇÕES:"
echo "1. Abra o DevTools (F12)"
echo "2. Vá para a aba Console"
echo "3. Clique em um pátio para abrir o mapa"
echo "4. Procure por vagas VERMELHAS (ocupadas):"
echo "   - Limão: BLimao001, BLimao002, BLimao003"
echo "   - Guarulhos: Gru001, Gru002, Gru003"
echo "5. Passe o mouse sobre essas vagas vermelhas"
echo.
echo "RESULTADO ESPERADO:"
echo "- Tooltip deve aparecer com:"
echo "  📦 Nome do Box"
echo "  🏍️ Placa do Veículo"
echo "  Modelo, Fabricante, Tag BLE"
echo.
echo "Se não funcionar, verifique os logs no console!"
echo.
pause
