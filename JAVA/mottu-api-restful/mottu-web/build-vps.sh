#!/bin/bash

# ==================================================
# SCRIPT DE BUILD OTIMIZADO PARA VPS
# ==================================================

echo "🔨 Fazendo build otimizado do MOTTU Web para VPS..."

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

# --- Verificar se Node.js está instalado ---
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

# --- Verificar se npm está instalado ---
if ! command -v npm &> /dev/null; then
    log_error "npm não encontrado. Instale npm primeiro."
    exit 1
fi

# --- Verificar versões ---
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_info "Node.js: $NODE_VERSION"
log_info "npm: $NPM_VERSION"

# --- Limpar instalações anteriores ---
log_info "Limpando instalações anteriores..."
rm -rf node_modules
rm -rf .next
rm -rf out
rm -rf build

# --- Instalar dependências ---
log_info "Instalando dependências..."
npm ci

# --- Configurar variáveis de ambiente para build ---
log_info "Configurando variáveis de ambiente para build..."
export NEXT_PUBLIC_BACKEND_ORIGIN="http://72.61.219.15:8080"
export NEXT_PUBLIC_API_BASE_URL="/api"
export NEXT_PUBLIC_APP_URL="http://72.61.219.15:3000"
export NEXT_PUBLIC_API_URL="http://72.61.219.15:8080/api"
export NODE_ENV="production"
export NEXT_PUBLIC_CHARSET="utf-8"

# --- Build da aplicação ---
log_info "Fazendo build da aplicação..."
npm run build

# --- Verificar se build foi bem-sucedido ---
if [ -d ".next" ]; then
    log_success "Build concluído com sucesso!"
    
    # --- Mostrar informações do build ---
    log_info "Arquivos gerados:"
    ls -la .next/
    
    # --- Verificar tamanho do build ---
    BUILD_SIZE=$(du -sh .next | cut -f1)
    log_info "Tamanho do build: $BUILD_SIZE"
    
    # --- Criar arquivo de informações do build ---
    cat > build-info.txt << EOF
# Informações do Build - MOTTU Web
Data: $(date)
Node.js: $NODE_VERSION
npm: $NPM_VERSION
Tamanho: $BUILD_SIZE
IP da VPS: 72.61.219.15
Porta: 3000
API: http://72.61.219.15:8080
EOF
    
    log_success "Arquivo build-info.txt criado"
    
else
    log_error "Falha no build da aplicação!"
    exit 1
fi

# --- Criar script de deploy ---
log_info "Criando script de deploy..."
cat > deploy-to-vps.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying MOTTU Web to VPS..."

# Configurações
VPS_IP="72.61.219.15"
APP_DIR="/opt/mottu-web"

# Copiar arquivos para VPS
echo "Copiando arquivos para VPS..."
scp -r . root@$VPS_IP:$APP_DIR/

# Conectar na VPS e executar deploy
echo "Conectando na VPS e executando deploy..."
ssh root@$VPS_IP << 'VPS_EOF'
cd /opt/mottu-web
chmod +x deploy-vps.sh
./deploy-vps.sh
VPS_EOF

echo "✅ Deploy concluído!"
EOF

chmod +x deploy-to-vps.sh
log_success "Script deploy-to-vps.sh criado"

log_success "Build otimizado concluído!"
log_info "Próximos passos:"
log_info "  1. Testar localmente: npm start"
log_info "  2. Deploy na VPS: ./deploy-to-vps.sh"
log_info "  3. Ou copiar arquivos manualmente para VPS"




