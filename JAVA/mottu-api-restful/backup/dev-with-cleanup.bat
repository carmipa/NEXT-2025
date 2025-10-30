@echo off
echo 🚀 Iniciando servidor de desenvolvimento com limpeza automática...
echo.

REM Função para limpar processos ao sair
:cleanup
echo.
echo 🧹 Limpando processos Node.js...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
taskkill /f /im npx.exe 2>nul
echo ✅ Limpeza concluída!
exit /b 0

REM Configurar trap para capturar Ctrl+C
trap cleanup INT

echo 📦 Instalando dependências...
call npm install

echo.
echo 🌐 Iniciando servidor de desenvolvimento...
echo ⚠️  Pressione Ctrl+C para parar e limpar automaticamente
echo.

REM Iniciar o servidor
call npm run dev

REM Se chegou aqui, executar limpeza
call :cleanup
