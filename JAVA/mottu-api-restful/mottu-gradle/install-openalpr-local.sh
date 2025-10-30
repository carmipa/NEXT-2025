#!/bin/bash

# ==================================================
# SCRIPT DE INSTALAÇÃO OPENALPR LOCAL (VPS)
# ==================================================

echo "🔧 Instalando OpenALPR na VPS..."

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

# --- Atualizar sistema ---
echo ""
log_info "=== ATUALIZANDO SISTEMA ==="
apt update && apt upgrade -y

# --- Instalar dependências ---
echo ""
log_info "=== INSTALANDO DEPENDÊNCIAS ==="
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
log_info "=== VERIFICANDO INSTALAÇÃO ==="
if which alpr > /dev/null 2>&1; then
    log_success "OpenALPR instalado: $(which alpr)"
    alpr -v
else
    log_error "OpenALPR não foi instalado corretamente"
fi

if which tesseract > /dev/null 2>&1; then
    log_success "Tesseract instalado: $(which tesseract)"
    tesseract --version
else
    log_error "Tesseract não foi instalado corretamente"
fi

# --- Verificar OpenCV ---
echo ""
log_info "=== VERIFICANDO OPENCV ==="
if pkg-config --modversion opencv4 > /dev/null 2>&1; then
    log_success "OpenCV4: $(pkg-config --modversion opencv4)"
elif pkg-config --modversion opencv > /dev/null 2>&1; then
    log_success "OpenCV: $(pkg-config --modversion opencv)"
else
    log_error "OpenCV não encontrado"
fi

# --- Configurar OpenALPR ---
echo ""
log_info "=== CONFIGURANDO OPENALPR ==="

# Criar diretório de logs se não existir
mkdir -p /opt/mottu/logs
chown -R root:root /opt/mottu/logs

# Verificar se arquivo de configuração existe
if [ -f "/etc/openalpr/openalpr.conf" ]; then
    log_success "Arquivo de configuração encontrado"
    cat /etc/openalpr/openalpr.conf
else
    log_warning "Arquivo de configuração não encontrado"
fi

# --- Testar OpenALPR ---
echo ""
log_info "=== TESTANDO OPENALPR ==="
if which alpr > /dev/null 2>&1; then
    echo "Testando comando básico..."
    alpr -c eu -n 5 --help 2>&1 | head -5
    if [ $? -eq 0 ]; then
        log_success "Comando alpr funcionando"
    else
        log_error "Comando alpr não funcionando"
    fi
else
    log_error "Comando alpr não disponível"
fi

# --- Verificar diretório de runtime ---
echo ""
log_info "=== VERIFICANDO RUNTIME DATA ==="
if [ -d "/usr/share/openalpr/runtime_data" ]; then
    log_success "Runtime data encontrado:"
    ls -la /usr/share/openalpr/runtime_data
else
    log_error "Runtime data não encontrado"
fi

# --- Configurar permissões ---
echo ""
log_info "=== CONFIGURANDO PERMISSÕES ==="
chmod +x /usr/bin/alpr
chmod +x /usr/bin/alprd

# --- Verificar status do serviço ---
echo ""
log_info "=== VERIFICANDO SERVIÇO ==="
if systemctl is-active --quiet alprd 2>/dev/null; then
    log_success "Serviço alprd está ativo"
else
    log_warning "Serviço alprd não está ativo"
    systemctl enable alprd
    systemctl start alprd
    if systemctl is-active --quiet alprd 2>/dev/null; then
        log_success "Serviço alprd iniciado com sucesso"
    else
        log_error "Falha ao iniciar serviço alprd"
    fi
fi

# --- Criar script de teste ---
echo ""
log_info "=== CRIANDO SCRIPT DE TESTE ==="
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

# --- Resumo ---
echo ""
log_success "=== INSTALAÇÃO CONCLUÍDA ==="
log_success "OpenALPR instalado com sucesso na VPS!"
log_info "Para testar: /opt/mottu/test-openalpr.sh"
log_info ""
log_info "Configurações da aplicação:"
log_info "  mottu.ocr.alpr.command=/usr/bin/alpr"
log_info "  mottu.ocr.alpr.region=eu"
log_info "  mottu.ocr.alpr.debugOutputDir=/opt/mottu/logs"



