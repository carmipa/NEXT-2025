#!/bin/bash

# ==================================================
# SCRIPT DE DEPLOY DO NEXT.JS PARA VPS (72.61.219.15)
# ==================================================

echo "🚀 Iniciando deploy do MOTTU Web (Next.js) na VPS..."

# --- Configurações da VPS ---
VPS_IP="72.61.219.15"
APP_NAME="mottu-web"
SERVICE_NAME="mottu-web"
LOG_DIR="/var/log/mottu-web"
APP_DIR="/opt/mottu-web"
NODE_VERSION="18"

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

# --- Verificar se está rodando como root ---
if [ "$EUID" -ne 0 ]; then
    log_error "Execute como root: sudo ./deploy-vps.sh"
    exit 1
fi

# --- Instalar Node.js se necessário ---
if ! command -v node &> /dev/null; then
    log_info "Instalando Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

# --- Verificar versão do Node.js ---
NODE_CURRENT=$(node --version)
log_info "Node.js versão: $NODE_CURRENT"

# --- Instalar PM2 globalmente ---
if ! command -v pm2 &> /dev/null; then
    log_info "Instalando PM2..."
    npm install -g pm2
fi

# --- Parar aplicação existente ---
log_info "Parando aplicação existente..."
pm2 stop $SERVICE_NAME 2>/dev/null || true
pm2 delete $SERVICE_NAME 2>/dev/null || true

# --- Criar diretórios ---
log_info "Criando diretórios..."
mkdir -p $APP_DIR
mkdir -p $LOG_DIR

# --- Configurar variáveis de ambiente ---
log_info "Configurando variáveis de ambiente..."
cat > $APP_DIR/.env.production << EOF
# Configurações para VPS
NEXT_PUBLIC_BACKEND_ORIGIN=http://72.61.219.15:8080
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_APP_URL=http://72.61.219.15:3000
NEXT_PUBLIC_API_URL=http://72.61.219.15:8080/api
NODE_ENV=production
NEXT_PUBLIC_CHARSET=utf-8
EOF

# --- Copiar arquivos da aplicação ---
log_info "Copiando arquivos da aplicação..."
cp -r . $APP_DIR/

# --- Instalar dependências ---
log_info "Instalando dependências..."
cd $APP_DIR
npm ci --production

# --- Build da aplicação ---
log_info "Fazendo build da aplicação..."
npm run build

# --- Configurar PM2 ---
log_info "Configurando PM2..."
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_BACKEND_ORIGIN: 'http://72.61.219.15:8080',
      NEXT_PUBLIC_API_BASE_URL: '/api',
      NEXT_PUBLIC_APP_URL: 'http://72.61.219.15:3000',
      NEXT_PUBLIC_API_URL: 'http://72.61.219.15:8080/api'
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true
  }]
};
EOF

# --- Iniciar aplicação com PM2 ---
log_info "Iniciando aplicação com PM2..."
pm2 start $APP_DIR/ecosystem.config.js

# --- Configurar PM2 para iniciar no boot ---
pm2 startup
pm2 save

# --- Configurar firewall ---
log_info "Configurando firewall..."
ufw allow 3000/tcp
ufw allow 8080/tcp
ufw --force enable

# --- Verificar status ---
sleep 5
if pm2 list | grep -q "$SERVICE_NAME.*online"; then
    log_success "Aplicação iniciada com sucesso!"
    log_info "Status: $(pm2 list | grep $SERVICE_NAME)"
    log_info "Logs: pm2 logs $SERVICE_NAME"
    log_info "Aplicação disponível em: http://$VPS_IP:3000"
    log_info "API disponível em: http://$VPS_IP:8080"
else
    log_error "Falha ao iniciar aplicação!"
    log_info "Verificar logs: pm2 logs $SERVICE_NAME"
    exit 1
fi

# --- Verificar conectividade ---
log_info "Verificando conectividade..."
if curl -s http://localhost:3000 > /dev/null; then
    log_success "Aplicação respondendo localmente!"
else
    log_warning "Aplicação não está respondendo localmente"
fi

log_success "Deploy do Next.js concluído!"
log_info "Comandos úteis:"
log_info "  - Ver logs: pm2 logs $SERVICE_NAME"
log_info "  - Status: pm2 status"
log_info "  - Restart: pm2 restart $SERVICE_NAME"
log_info "  - Stop: pm2 stop $SERVICE_NAME"
log_info "  - Start: pm2 start $SERVICE_NAME"
log_info "  - Monitor: pm2 monit"




