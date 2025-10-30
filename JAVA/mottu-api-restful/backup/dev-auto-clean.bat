@echo off
echo 🚀 Iniciando desenvolvimento com limpeza automática...
echo.

REM Limpar processos existentes
echo 🧹 Limpando processos Node.js existentes...
call npm run stop

echo.
echo 📦 Instalando dependências...
call npm install

echo.
echo 🌐 Iniciando servidor de desenvolvimento...
echo ⚠️  Pressione Ctrl+C para parar e limpar automaticamente
echo.

REM Iniciar o servidor em background
start /b npm run dev

REM Aguardar o usuário parar
pause

REM Limpeza automática ao sair
echo.
echo 🛑 Parando servidor e limpando processos...
call npm run stop
echo ✅ Limpeza automática concluída!
pause
