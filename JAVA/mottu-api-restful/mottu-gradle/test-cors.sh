#!/bin/bash

# ==================================================
# SCRIPT DE TESTE CORS PARA VPS
# ==================================================

echo "🔍 Testando CORS na VPS (72.61.219.15:8080)..."

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

# --- Teste 1: Health Check ---
log_info "=== TESTE 1: Health Check ==="
if curl -s http://72.61.219.15:8080/api/health > /dev/null 2>&1; then
    log_success "✅ Health Check OK"
else
    log_error "❌ Health Check falhou"
fi

# --- Teste 2: CORS Preflight ---
log_info "=== TESTE 2: CORS Preflight ==="
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://72.61.219.15:8080/api/clientes 2>/dev/null)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    log_success "✅ CORS Preflight OK"
    echo "Headers CORS:"
    echo "$CORS_RESPONSE" | grep -i "access-control"
else
    log_error "❌ CORS Preflight falhou"
    echo "Response:"
    echo "$CORS_RESPONSE"
fi

# --- Teste 3: POST Request ---
log_info "=== TESTE 3: POST Request ==="
POST_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"nome":"Teste CORS","email":"teste@cors.com"}' \
  http://72.61.219.15:8080/api/clientes 2>&1)

if echo "$POST_RESPONSE" | grep -q "403"; then
    log_error "❌ POST Request retornou 403 - CORS não configurado corretamente"
    echo "Response: $POST_RESPONSE"
elif echo "$POST_RESPONSE" | grep -q "200\|201"; then
    log_success "✅ POST Request OK"
else
    log_warning "⚠️  POST Request retornou: $POST_RESPONSE"
fi

# --- Teste 4: GET Request ---
log_info "=== TESTE 4: GET Request ==="
GET_RESPONSE=$(curl -s -H "Origin: http://localhost:3000" http://72.61.219.15:8080/api/clientes 2>&1)

if echo "$GET_RESPONSE" | grep -q "403"; then
    log_error "❌ GET Request retornou 403 - CORS não configurado corretamente"
elif echo "$GET_RESPONSE" | grep -q "200"; then
    log_success "✅ GET Request OK"
else
    log_warning "⚠️  GET Request retornou: $GET_RESPONSE"
fi

# --- Resumo ---
echo ""
log_info "=== RESUMO ==="
log_info "Se todos os testes passaram, o CORS está configurado corretamente."
log_info "Se algum teste falhou, verifique:"
log_info "  1. Se a aplicação está rodando na VPS"
log_info "  2. Se o perfil 'prod' está ativo"
log_info "  3. Se as configurações CORS estão corretas"
log_info "  4. Se o firewall está permitindo as requisições"

echo ""
log_info "Para verificar logs da aplicação na VPS:"
log_info "  ssh root@72.61.219.15"
log_info "  journalctl -u mottu-api -f"



