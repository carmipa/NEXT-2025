# Script PowerShell para limpeza automática de processos Node.js
param(
    [switch]$Force
)

Write-Host "🔥 Limpeza Automática de Processos Node.js" -ForegroundColor Red
Write-Host ""

# Função para matar processos
function Stop-NodeProcesses {
    $processes = @("node", "npm", "npx")
    $killed = 0
    
    foreach ($process in $processes) {
        try {
            $procs = Get-Process -Name $process -ErrorAction SilentlyContinue
            if ($procs) {
                $procs | ForEach-Object {
                    Write-Host "🔪 Matando processo: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Yellow
                    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
                    $killed++
                }
            } else {
                Write-Host "ℹ️  Nenhum processo '$process' encontrado" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "⚠️  Erro ao matar processos '$process': $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($killed -gt 0) {
        Write-Host "✅ $killed processos Node.js finalizados!" -ForegroundColor Green
    } else {
        Write-Host "✅ Nenhum processo Node.js estava rodando" -ForegroundColor Green
    }
}

# Função para limpar portas ocupadas
function Clear-NodePorts {
    Write-Host "🌐 Verificando portas Node.js..." -ForegroundColor Cyan
    
    $ports = @(3000, 3001, 8080, 5000, 4000)
    foreach ($port in $ports) {
        try {
            $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($connection) {
                Write-Host "🔌 Liberando porta $port..." -ForegroundColor Yellow
                $connection | ForEach-Object {
                    try {
                        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
                    } catch {}
                }
            }
        } catch {}
    }
}

# Executar limpeza
Stop-NodeProcesses
Clear-NodePorts

Write-Host ""
Write-Host "🎯 Limpeza automática concluída!" -ForegroundColor Green
Write-Host "💡 Use 'npm run dev:auto' para iniciar com limpeza automática" -ForegroundColor Cyan
