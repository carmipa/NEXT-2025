#!/bin/bash

# ==================================================
# SCRIPT DE VERIFICAÇÃO OPENALPR PARA VPS
# ==================================================

echo "🔍 Verificando OpenALPR na VPS (72.61.219.15)..."

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

# --- Conectar na VPS ---
log_info "Conectando na VPS..."
ssh root@72.61.219.15 << 'VPS_EOF'

echo "🔍 Verificando OpenALPR na VPS..."

# --- Verificar pacotes instalados ---
echo ""
echo "=== PACOTES INSTALADOS ==="
if dpkg -l | egrep -i 'openalpr|alprd|opencv|tesseract' > /dev/null 2>&1; then
    echo "✅ Pacotes relacionados encontrados:"
    dpkg -l | egrep -i 'openalpr|alprd|opencv|tesseract'
else
    echo "❌ Nenhum pacote relacionado encontrado"
fi

# --- Verificar binários ---
echo ""
echo "=== BINÁRIOS DISPONÍVEIS ==="
if which alpr > /dev/null 2>&1; then
    echo "✅ alpr encontrado em: $(which alpr)"
else
    echo "❌ alpr não encontrado"
fi

if which alprd > /dev/null 2>&1; then
    echo "✅ alprd encontrado em: $(which alprd)"
else
    echo "❌ alprd não encontrado"
fi

# --- Verificar versões ---
echo ""
echo "=== VERSÕES ==="
if which alpr > /dev/null 2>&1; then
    echo "OpenALPR CLI:"
    alpr -v 2>&1 || alpr --version 2>&1
else
    echo "❌ alpr não disponível para verificar versão"
fi

if which alprd > /dev/null 2>&1; then
    echo ""
    echo "OpenALPR Daemon:"
    alprd -v 2>&1
else
    echo "❌ alprd não disponível para verificar versão"
fi

# --- Verificar OpenCV ---
echo ""
echo "=== OPENCV ==="
if pkg-config --modversion opencv4 > /dev/null 2>&1; then
    echo "✅ OpenCV4: $(pkg-config --modversion opencv4)"
elif pkg-config --modversion opencv > /dev/null 2>&1; then
    echo "✅ OpenCV: $(pkg-config --modversion opencv)"
else
    echo "❌ OpenCV não encontrado via pkg-config"
fi

# --- Verificar Tesseract ---
echo ""
echo "=== TESSERACT ==="
if which tesseract > /dev/null 2>&1; then
    echo "✅ Tesseract: $(tesseract --version 2>&1 | head -1)"
else
    echo "❌ Tesseract não encontrado"
fi

# --- Verificar arquivos de configuração ---
echo ""
echo "=== ARQUIVOS DE CONFIGURAÇÃO ==="
if [ -f "/etc/openalpr/openalpr.conf" ]; then
    echo "✅ openalpr.conf encontrado:"
    cat /etc/openalpr/openalpr.conf
else
    echo "❌ openalpr.conf não encontrado em /etc/openalpr"
fi

if [ -f "/etc/openalpr/alprd.conf" ]; then
    echo ""
    echo "✅ alprd.conf encontrado:"
    cat /etc/openalpr/alprd.conf
else
    echo "❌ alprd.conf não encontrado em /etc/openalpr"
fi

# --- Verificar diretório de runtime ---
echo ""
echo "=== RUNTIME DATA ==="
if [ -d "/usr/share/openalpr/runtime_data" ]; then
    echo "✅ Runtime data encontrado:"
    ls -la /usr/share/openalpr/runtime_data
else
    echo "❌ Runtime data não encontrado em /usr/share/openalpr"
fi

# --- Verificar bibliotecas OpenCV ---
echo ""
echo "=== BIBLIOTECAS OPENCV ==="
if [ -d "/usr/lib/x86_64-linux-gnu" ]; then
    echo "Bibliotecas OpenCV instaladas:"
    ls -1 /usr/lib/x86_64-linux-gnu | grep -i opencv || echo "Nenhuma biblioteca OpenCV encontrada"
else
    echo "❌ Diretório de bibliotecas não encontrado"
fi

# --- Verificar dependências do alpr ---
echo ""
echo "=== DEPENDÊNCIAS DO ALPR ==="
if which alpr > /dev/null 2>&1; then
    echo "Dependências do alpr:"
    ldd $(which alpr) | egrep -i 'opencv|tesseract' || echo "Nenhuma dependência OpenCV/Tesseract encontrada"
else
    echo "❌ alpr não disponível para verificar dependências"
fi

# --- Verificar status do serviço ---
echo ""
echo "=== STATUS DO SERVIÇO ==="
if systemctl is-active --quiet alprd 2>/dev/null; then
    echo "✅ Serviço alprd está ativo"
    systemctl status alprd --no-pager
else
    echo "❌ Serviço alprd não está ativo"
fi

# --- Teste de reconhecimento (se houver imagem de teste) ---
echo ""
echo "=== TESTE DE RECONHECIMENTO ==="
if [ -f "/tmp/teste-placa.jpg" ] || [ -f "/opt/mottu/teste-placa.jpg" ]; then
    echo "Testando reconhecimento..."
    alpr -c eu -n 5 -j /tmp/teste-placa.jpg 2>/dev/null || alpr -c eu -n 5 -j /opt/mottu/teste-placa.jpg 2>/dev/null || echo "❌ Teste de reconhecimento falhou"
else
    echo "⚠️  Nenhuma imagem de teste encontrada para testar reconhecimento"
fi

VPS_EOF

# --- Resumo ---
echo ""
log_info "=== RESUMO ==="
log_info "Verificação do OpenALPR concluída na VPS"
log_info "Se houver problemas, verifique:"
log_info "  1. Se OpenALPR está instalado corretamente"
log_info "  2. Se as dependências (OpenCV, Tesseract) estão instaladas"
log_info "  3. Se os arquivos de configuração estão corretos"
log_info "  4. Se o serviço está rodando"

echo ""
log_info "Para instalar OpenALPR na VPS:"
log_info "  apt update && apt install openalpr openalpr-daemon openalpr-utils libopenalpr-dev"



