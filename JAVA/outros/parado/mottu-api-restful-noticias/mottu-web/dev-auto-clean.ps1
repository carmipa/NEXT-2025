# Script PowerShell para desenvolvimento com limpeza automática
Write-Host "🚀 Iniciando desenvolvimento com limpeza automática..." -ForegroundColor Green
Write-Host ""

# Função de limpeza
function Clean-NodeProcesses {
    Write-Host "🧹 Limpando processos Node.js..." -ForegroundColor Yellow
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Get-Process -Name "npx" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Processos Node.js finalizados!" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️  Nenhum processo Node.js encontrado" -ForegroundColor Gray
    }
}

# Limpar processos existentes
Clean-NodeProcesses

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🌐 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "⚠️  Pressione Ctrl+C para parar e limpar automaticamente" -ForegroundColor Red
Write-Host ""

# Configurar limpeza automática ao sair
$cleanup = {
    Write-Host ""
    Write-Host "🛑 Parando servidor..." -ForegroundColor Red
    Clean-NodeProcesses
    Write-Host "✅ Limpeza automática concluída!" -ForegroundColor Green
}

# Registrar handler para Ctrl+C e fechamento
Register-EngineEvent PowerShell.Exiting -Action $cleanup
[Console]::TreatControlCAsInput = $false

try {
    # Iniciar o servidor
    npm run dev
}
catch {
    Write-Host "🛑 Servidor interrompido pelo usuário" -ForegroundColor Yellow
}
finally {
    # Executar limpeza
    & $cleanup
}
