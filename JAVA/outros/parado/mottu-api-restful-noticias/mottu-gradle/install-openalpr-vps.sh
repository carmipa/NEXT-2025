#!/bin/bash

# ==================================================
# SCRIPT DE INSTALAÇÃO OPENALPR PARA VPS
# ==================================================

echo "🔧 Instalando OpenALPR na VPS (72.61.219.15)..."

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

# --- Conectar na VPS e instalar ---
log_info "Conectando na VPS e instalando OpenALPR..."
ssh root@72.61.219.15 << 'VPS_EOF'

echo "🔧 Instalando OpenALPR na VPS..."

# --- Atualizar sistema ---
echo ""
echo "=== ATUALIZANDO SISTEMA ==="
apt update && apt upgrade -y

# --- Instalar dependências ---
echo ""
echo "=== INSTALANDO DEPENDÊNCIAS ==="
apt install -y \
    openalpr \
    openalpr-daemon \
    openalpr-utils \
    libopenalpr-dev \
    opencv-python \
    tesseract-ocr \
    tesseract-ocr-por \
    tesseract-ocr-eng \
    libopencv-dev \
    python3-opencv

# --- Verificar instalação ---
echo ""
echo "=== VERIFICANDO INSTALAÇÃO ==="
if which alpr > /dev/null 2>&1; then
    echo "✅ OpenALPR instalado: $(which alpr)"
    alpr -v
else
    echo "❌ OpenALPR não foi instalado corretamente"
fi

if which tesseract > /dev/null 2>&1; then
    echo "✅ Tesseract instalado: $(which tesseract)"
    tesseract --version
else
    echo "❌ Tesseract não foi instalado corretamente"
fi

# --- Verificar OpenCV ---
echo ""
echo "=== VERIFICANDO OPENCV ==="
if pkg-config --modversion opencv4 > /dev/null 2>&1; then
    echo "✅ OpenCV4: $(pkg-config --modversion opencv4)"
elif pkg-config --modversion opencv > /dev/null 2>&1; then
    echo "✅ OpenCV: $(pkg-config --modversion opencv)"
else
    echo "❌ OpenCV não encontrado"
fi

# --- Configurar OpenALPR ---
echo ""
echo "=== CONFIGURANDO OPENALPR ==="

# Criar diretório de logs se não existir
mkdir -p /opt/mottu/logs
chown -R root:root /opt/mottu/logs

# Verificar se arquivo de configuração existe
if [ -f "/etc/openalpr/openalpr.conf" ]; then
    echo "✅ Arquivo de configuração encontrado"
    cat /etc/openalpr/openalpr.conf
else
    echo "⚠️  Arquivo de configuração não encontrado"
fi

# --- Testar OpenALPR ---
echo ""
echo "=== TESTANDO OPENALPR ==="
if which alpr > /dev/null 2>&1; then
    echo "Testando comando básico..."
    alpr -c eu -n 5 --help 2>&1 | head -5
    echo "✅ Comando alpr funcionando"
else
    echo "❌ Comando alpr não funcionando"
fi

# --- Verificar diretório de runtime ---
echo ""
echo "=== VERIFICANDO RUNTIME DATA ==="
if [ -d "/usr/share/openalpr/runtime_data" ]; then
    echo "✅ Runtime data encontrado:"
    ls -la /usr/share/openalpr/runtime_data
else
    echo "❌ Runtime data não encontrado"
fi

# --- Configurar permissões ---
echo ""
echo "=== CONFIGURANDO PERMISSÕES ==="
chmod +x /usr/bin/alpr
chmod +x /usr/bin/alprd

# --- Verificar status do serviço ---
echo ""
echo "=== VERIFICANDO SERVIÇO ==="
if systemctl is-active --quiet alprd 2>/dev/null; then
    echo "✅ Serviço alprd está ativo"
else
    echo "⚠️  Serviço alprd não está ativo"
    systemctl enable alprd
    systemctl start alprd
fi

# --- Criar script de teste ---
echo ""
echo "=== CRIANDO SCRIPT DE TESTE ==="
cat > /opt/mottu/test-openalpr.sh << 'TEST_EOF'
#!/bin/bash
echo "🧪 Testando OpenALPR..."

# Verificar se alpr está disponível
if which alpr > /dev/null 2>&1; then
    echo "✅ alpr disponível: $(which alpr)"
    
    # Testar comando básico
    echo "Testando comando básico..."
    alpr -c eu -n 5 --help 2>&1 | head -3
    
    # Testar com imagem se disponível
    if [ -f "/tmp/teste-placa.jpg" ]; then
        echo "Testando reconhecimento..."
        alpr -c eu -n 5 -j /tmp/teste-placa.jpg
    else
        echo "⚠️  Nenhuma imagem de teste disponível"
    fi
else
    echo "❌ alpr não disponível"
fi
TEST_EOF

chmod +x /opt/mottu/test-openalpr.sh

echo ""
echo "✅ Instalação do OpenALPR concluída!"
echo "Para testar: /opt/mottu/test-openalpr.sh"

VPS_EOF

# --- Resumo ---
echo ""
log_info "=== RESUMO ==="
log_success "Instalação do OpenALPR concluída na VPS!"
log_info "Para verificar se está funcionando:"
log_info "  ssh root@72.61.219.15"
log_info "  /opt/mottu/test-openalpr.sh"
log_info ""
log_info "Configurações da aplicação:"
log_info "  mottu.ocr.alpr.command=/usr/bin/alpr"
log_info "  mottu.ocr.alpr.region=eu"
log_info "  mottu.ocr.alpr.debugOutputDir=/opt/mottu/logs"



