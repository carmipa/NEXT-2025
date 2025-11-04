#!/bin/bash

# ==================================================
# SCRIPT DE TESTE DE CONEXÃO COM BANCO DE DADOS
# ==================================================

echo "🔍 Testando conexão com o banco de dados na VPS..."

# --- Configurações do Banco ---
DB_HOST="72.61.219.15"
DB_PORT="1521"
DB_SERVICE="XEPDB1"
DB_USER="relacaoDireta"
DB_PASS="paulo1"

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

# --- Teste 1: Conectividade de Rede ---
log_info "Testando conectividade de rede..."
if ping -c 1 $DB_HOST > /dev/null 2>&1; then
    log_success "Host $DB_HOST está acessível"
else
    log_error "Host $DB_HOST não está acessível"
    exit 1
fi

# --- Teste 2: Porta do Banco ---
log_info "Testando porta $DB_PORT..."
if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    log_success "Porta $DB_PORT está aberta"
else
    log_error "Porta $DB_PORT não está acessível"
    exit 1
fi

# --- Teste 3: Conexão com SQLPlus (se disponível) ---
if command -v sqlplus &> /dev/null; then
    log_info "Testando conexão com SQLPlus..."
    
    # Criar arquivo SQL temporário
    cat > /tmp/test_connection.sql << EOF
SELECT 'Conexão OK' as status FROM DUAL;
SELECT COUNT(*) as table_count FROM USER_TABLES;
EXIT;
EOF

    if echo "$DB_PASS" | sqlplus -S "$DB_USER@$DB_HOST:$DB_PORT/$DB_SERVICE" @/tmp/test_connection.sql > /tmp/sqlplus_result.log 2>&1; then
        log_success "Conexão SQLPlus bem-sucedida"
        log_info "Resultado:"
        cat /tmp/sqlplus_result.log
    else
        log_error "Falha na conexão SQLPlus"
        log_info "Log de erro:"
        cat /tmp/sqlplus_result.log
    fi
    
    # Limpar arquivos temporários
    rm -f /tmp/test_connection.sql /tmp/sqlplus_result.log
else
    log_warning "SQLPlus não encontrado, pulando teste de conexão direta"
fi

# --- Teste 4: Teste com Java (se JAR estiver disponível) ---
if [ -f "build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar" ]; then
    log_info "Testando conexão com aplicação Java..."
    
    # Criar arquivo de propriedades temporário
    cat > /tmp/test-db.properties << EOF
spring.datasource.url=jdbc:oracle:thin:@//$DB_HOST:$DB_PORT/$DB_SERVICE
spring.datasource.username=$DB_USER
spring.datasource.password=$DB_PASS
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
logging.level.org.springframework.jdbc=DEBUG
EOF

    # Testar conexão com Spring Boot
    if java -jar build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar --spring.config.location=classpath:/application.properties,file:/tmp/test-db.properties --spring.profiles.active=test --server.port=0 --spring.jpa.hibernate.ddl-auto=none > /tmp/java_test.log 2>&1 &
    then
        JAVA_PID=$!
        sleep 10
        
        if kill -0 $JAVA_PID 2>/dev/null; then
            log_success "Aplicação Java iniciou com sucesso"
            kill $JAVA_PID 2>/dev/null
        else
            log_error "Falha ao iniciar aplicação Java"
            log_info "Log de erro:"
            cat /tmp/java_test.log
        fi
        
        # Limpar arquivos temporários
        rm -f /tmp/test-db.properties /tmp/java_test.log
    else
        log_error "Falha ao executar teste Java"
    fi
else
    log_warning "JAR não encontrado, pulando teste Java"
fi

# --- Resumo dos Testes ---
echo ""
log_info "=== RESUMO DOS TESTES ==="
log_info "Host: $DB_HOST"
log_info "Porta: $DB_PORT"
log_info "Serviço: $DB_SERVICE"
log_info "Usuário: $DB_USER"
log_info "Schema: RELACAODIRETA"

echo ""
log_success "Testes de conectividade concluídos!"
log_info "Para testar a aplicação completa, execute:"
log_info "  ./gradlew bootRun --args='--spring.profiles.active=vps'"




