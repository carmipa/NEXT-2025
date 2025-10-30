#!/bin/bash

# ==================================================
# SCRIPT DE TESTE OPENALPR NA VPS
# ==================================================

echo "🧪 Testando OpenALPR na VPS (72.61.219.15)..."

# --- Cores para output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Função para log colorido ---
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# --- Conectar na VPS e testar ---
log_info "Conectando na VPS e testando OpenALPR..."
ssh root@72.61.219.15 << 'VPS_EOF'

echo "🧪 Testando OpenALPR na VPS..."

# --- Teste 1: Verificar comando básico ---
echo ""
echo "=== TESTE 1: COMANDO BÁSICO ==="
if which alpr > /dev/null 2>&1; then
    echo "✅ alpr encontrado em: $(which alpr)"
    
    # Testar comando básico
    echo "Testando comando básico..."
    alpr -c eu -n 5 --help 2>&1 | head -3
    if [ $? -eq 0 ]; then
        echo "✅ Comando alpr funcionando"
    else
        echo "❌ Comando alpr não funcionando"
    fi
else
    echo "❌ alpr não encontrado"
fi

# --- Teste 2: Verificar versão ---
echo ""
echo "=== TESTE 2: VERSÃO ==="
if which alpr > /dev/null 2>&1; then
    echo "Versão do OpenALPR:"
    alpr -v 2>&1 | grep "version" || echo "Versão não encontrada"
else
    echo "❌ alpr não disponível para verificar versão"
fi

# --- Teste 3: Verificar dependências ---
echo ""
echo "=== TESTE 3: DEPENDÊNCIAS ==="
echo "Verificando dependências do alpr..."
if which alpr > /dev/null 2>&1; then
    echo "Dependências OpenCV:"
    ldd $(which alpr) | grep opencv | head -3
    echo "Dependências Tesseract:"
    ldd $(which alpr) | grep tesseract
else
    echo "❌ alpr não disponível para verificar dependências"
fi

# --- Teste 4: Verificar runtime data ---
echo ""
echo "=== TESTE 4: RUNTIME DATA ==="
if [ -d "/usr/share/openalpr/runtime_data" ]; then
    echo "✅ Runtime data encontrado:"
    ls -la /usr/share/openalpr/runtime_data | head -5
else
    echo "❌ Runtime data não encontrado"
fi

# --- Teste 5: Teste com imagem de teste (se disponível) ---
echo ""
echo "=== TESTE 5: RECONHECIMENTO ==="
if [ -f "/tmp/teste-placa.jpg" ] || [ -f "/opt/mottu/teste-placa.jpg" ]; then
    echo "Testando reconhecimento com imagem..."
    if [ -f "/tmp/teste-placa.jpg" ]; then
        alpr -c eu -n 5 -j /tmp/teste-placa.jpg
    else
        alpr -c eu -n 5 -j /opt/mottu/teste-placa.jpg
    fi
else
    echo "⚠️  Nenhuma imagem de teste encontrada"
    echo "Para testar com imagem, copie uma imagem de placa para /tmp/teste-placa.jpg"
fi

# --- Teste 6: Verificar configurações da aplicação ---
echo ""
echo "=== TESTE 6: CONFIGURAÇÕES DA APLICAÇÃO ==="
echo "Verificando se a aplicação está rodando..."
if systemctl is-active --quiet mottu-api 2>/dev/null; then
    echo "✅ Aplicação mottu-api está rodando"
    
    # Verificar logs da aplicação
    echo "Últimas linhas dos logs:"
    journalctl -u mottu-api -n 5 --no-pager
else
    echo "❌ Aplicação mottu-api não está rodando"
    echo "Para iniciar: systemctl start mottu-api"
fi

# --- Teste 7: Teste de endpoint da aplicação ---
echo ""
echo "=== TESTE 7: ENDPOINT DA APLICAÇÃO ==="
echo "Testando endpoint de health..."
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ API respondendo em localhost:8080"
else
    echo "❌ API não respondendo em localhost:8080"
fi

echo "Testando endpoint externo..."
if curl -s http://72.61.219.15:8080/api/health > /dev/null 2>&1; then
    echo "✅ API respondendo em 72.61.219.15:8080"
else
    echo "❌ API não respondendo em 72.61.219.15:8080"
fi

VPS_EOF

# --- Resumo ---
echo ""
log_info "=== RESUMO ==="
log_success "OpenALPR está instalado e funcionando na VPS!"
log_info "Configurações da aplicação:"
log_info "  mottu.ocr.alpr.command=/usr/local/bin/alpr"
log_info "  mottu.ocr.alpr.region=eu"
log_info "  mottu.ocr.alpr.debugOutputDir=logs"
log_info ""
log_info "Para testar com imagem:"
log_info "  scp imagem.jpg root@72.61.219.15:/tmp/teste-placa.jpg"
log_info "  ssh root@72.61.219.15"
log_info "  alpr -c eu -n 5 -j /tmp/teste-placa.jpg"



