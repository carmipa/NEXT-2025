// Monitor de desenvolvimento com limpeza automática
const { spawn } = require('child_process');
const os = require('os');

console.log('🚀 Iniciando monitor de desenvolvimento...');
console.log('⚠️  Pressione Ctrl+C para parar e limpar automaticamente');
console.log('');

// Função para limpar processos Node.js
function cleanup() {
    console.log('');
    console.log('🧹 Limpando processos Node.js...');
    
    const isWindows = os.platform() === 'win32';
    
    if (isWindows) {
        // Windows
        const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe', '/T'], { stdio: 'inherit' });
        killProcess.on('close', () => {
            const killNpm = spawn('taskkill', ['/F', '/IM', 'npm.exe', '/T'], { stdio: 'inherit' });
            killNpm.on('close', () => {
                const killNpx = spawn('taskkill', ['/F', '/IM', 'npx.exe', '/T'], { stdio: 'inherit' });
                killNpx.on('close', () => {
                    console.log('✅ Limpeza automática concluída!');
                    process.exit(0);
                });
            });
        });
    } else {
        // Linux/Mac
        const killProcess = spawn('pkill', ['-f', 'node'], { stdio: 'inherit' });
        killProcess.on('close', () => {
            const killNpm = spawn('pkill', ['-f', 'npm'], { stdio: 'inherit' });
            killNpm.on('close', () => {
                const killNpx = spawn('pkill', ['-f', 'npx'], { stdio: 'inherit' });
                killNpx.on('close', () => {
                    console.log('✅ Limpeza automática concluída!');
                    process.exit(0);
                });
            });
        });
    }
}

// Capturar sinais de interrupção
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Iniciar o servidor Next.js
const devProcess = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true 
});

devProcess.on('close', (code) => {
    console.log(`\n🛑 Servidor finalizado com código ${code}`);
    cleanup();
});

devProcess.on('error', (err) => {
    console.error('❌ Erro ao iniciar servidor:', err);
    cleanup();
});
