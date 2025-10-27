#!/bin/bash

# ==================================================
# SCRIPT DE DEPLOY PARA VPS (72.61.219.15)
# ==================================================

echo "🚀 Iniciando deploy do MOTTU API na VPS..."

# --- Configurações da VPS ---
VPS_IP="72.61.219.15"
APP_NAME="mottu-api"
JAR_NAME="mottu-gradle-0.0.1-SNAPSHOT.jar"
SERVICE_NAME="mottu-api"
LOG_DIR="/var/log/mottu"
APP_DIR="/opt/mottu"

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

# --- Parar serviço existente ---
log_info "Parando serviço existente..."
systemctl stop $SERVICE_NAME 2>/dev/null || true

# --- Criar diretórios ---
log_info "Criando diretórios..."
mkdir -p $APP_DIR
mkdir -p $LOG_DIR
mkdir -p $APP_DIR/logs

# --- Configurar JVM para VPS ---
export JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication -Dspring.profiles.active=vps -Dspring.datasource.url=jdbc:oracle:thin:@//72.61.219.15:1521/XEPDB1 -Dspring.datasource.username=relacaoDireta -Dspring.datasource.password=paulo1"

# --- Copiar JAR ---
log_info "Copiando JAR para $APP_DIR..."
cp build/libs/$JAR_NAME $APP_DIR/

# --- Criar systemd service ---
log_info "Criando systemd service..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=MOTTU API Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/java $JAVA_OPTS -jar $APP_DIR/$JAR_NAME
Restart=always
RestartSec=10
StandardOutput=append:$LOG_DIR/mottu.log
StandardError=append:$LOG_DIR/mottu-error.log
Environment=SPRING_PROFILES_ACTIVE=vps
Environment=JAVA_OPTS="$JAVA_OPTS"

[Install]
WantedBy=multi-user.target
EOF

# --- Recarregar systemd ---
systemctl daemon-reload

# --- Habilitar e iniciar serviço ---
log_info "Habilitando e iniciando serviço..."
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# --- Verificar status ---
sleep 5
if systemctl is-active --quiet $SERVICE_NAME; then
    log_success "Serviço iniciado com sucesso!"
    log_info "Status: $(systemctl is-active $SERVICE_NAME)"
    log_info "Logs: tail -f $LOG_DIR/mottu.log"
    log_info "API disponível em: http://$VPS_IP:8080"
    log_info "Health check: http://$VPS_IP:8080/api/health"
else
    log_error "Falha ao iniciar serviço!"
    log_info "Verificar logs: journalctl -u $SERVICE_NAME -f"
    exit 1
fi

# --- Configurar firewall ---
log_info "Configurando firewall..."
ufw allow 8080/tcp
ufw allow 3000/tcp
ufw --force enable

# --- Verificar conectividade ---
log_info "Verificando conectividade..."
if curl -s http://localhost:8080/api/health > /dev/null; then
    log_success "API respondendo localmente!"
else
    log_warning "API não está respondendo localmente"
fi

log_success "Deploy concluído!"
log_info "Comandos úteis:"
log_info "  - Ver logs: tail -f $LOG_DIR/mottu.log"
log_info "  - Status: systemctl status $SERVICE_NAME"
log_info "  - Restart: systemctl restart $SERVICE_NAME"
log_info "  - Stop: systemctl stop $SERVICE_NAME"
log_info "  - Start: systemctl start $SERVICE_NAME"
