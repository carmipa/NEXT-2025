# Script de desenvolvimento com limpeza automática
Write-Host "🚀 Iniciando desenvolvimento com limpeza automática..." -ForegroundColor Green
Write-Host ""

# Limpar processos existentes
Write-Host "🧹 Limpando processos Node.js existentes..." -ForegroundColor Yellow
& .\auto-cleanup.ps1

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🌐 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "⚠️  Pressione Ctrl+C para parar e limpar automaticamente" -ForegroundColor Red
Write-Host ""

# Configurar limpeza ao sair
$cleanup = {
    Write-Host ""
    Write-Host "🛑 Parando servidor..." -ForegroundColor Red
    & .\auto-cleanup.ps1
    Write-Host "✅ Limpeza automática concluída!" -ForegroundColor Green
    exit
}

# Registrar handler para Ctrl+C
[Console]::TreatControlCAsInput = $false
$null = Register-EngineEvent PowerShell.Exiting -Action $cleanup

try {
    # Iniciar o servidor
    npm run dev
}
finally {
    # Executar limpeza ao sair
    & $cleanup
}
