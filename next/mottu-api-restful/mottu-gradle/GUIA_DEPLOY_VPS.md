# 🚀 Guia de Deploy para VPS (72.61.219.15)

## 📋 Pré-requisitos

### Na VPS (Ubuntu/Debian):
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Java 17
sudo apt install openjdk-17-jdk -y

# Instalar Oracle XE (se necessário)
# Seguir instruções específicas do Oracle

# Instalar OpenALPR (para OCR)
sudo apt install openalpr openalpr-daemon openalpr-utils libopenalpr-dev -y

# Instalar dependências adicionais
sudo apt install curl wget unzip -y
```

## 🔧 Configuração da Aplicação

### 1. Build da Aplicação
```bash
# No ambiente de desenvolvimento
./gradlew clean build -x test
```

### 2. Upload para VPS
```bash
# Copiar JAR para VPS
scp build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar root@72.61.219.15:/opt/mottu/

# Copiar script de deploy
scp deploy-vps.sh root@72.61.219.15:/opt/mottu/
scp jvm-vps.conf root@72.61.219.15:/opt/mottu/
```

### 3. Deploy na VPS
```bash
# Conectar na VPS
ssh root@72.61.219.15

# Executar script de deploy
cd /opt/mottu
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## ⚙️ Configurações Específicas

### Perfil Ativo
- **Desenvolvimento**: `dev`
- **Produção VPS**: `vps` (novo perfil criado)

### Configurações de Banco
```properties
# application-vps.properties
spring.datasource.url=jdbc:oracle:thin:@//72.61.219.15:1521/XEPDB1
spring.datasource.username=relacaoDireta
spring.datasource.password=paulo1
spring.jpa.properties.hibernate.schema=RELACAODIRETA
```

### Configurações CORS
```properties
cors.allowed-origins=http://72.61.219.15:3000,http://localhost:3000,http://72.61.219.15:3002,http://72.61.219.15:8080
```

## 🔍 Verificação do Deploy

### 1. Verificar Status do Serviço
```bash
systemctl status mottu-api
```

### 2. Verificar Logs
```bash
# Logs da aplicação
tail -f /var/log/mottu/mottu.log

# Logs do sistema
journalctl -u mottu-api -f
```

### 3. Testar Endpoints
```bash
# Health check
curl http://72.61.219.15:8080/api/health

# API principal
curl http://72.61.219.15:8080/api/clientes
```

## 🛠️ Comandos Úteis

### Gerenciamento do Serviço
```bash
# Iniciar
systemctl start mottu-api

# Parar
systemctl stop mottu-api

# Reiniciar
systemctl restart mottu-api

# Status
systemctl status mottu-api

# Habilitar auto-start
systemctl enable mottu-api
```

### Monitoramento
```bash
# Verificar uso de memória
ps aux | grep java

# Verificar portas
netstat -tlnp | grep :8080

# Verificar logs em tempo real
tail -f /var/log/mottu/mottu.log
```

## 🔒 Configurações de Segurança

### Firewall
```bash
# Permitir portas necessárias
ufw allow 8080/tcp
ufw allow 3000/tcp
ufw allow 22/tcp
ufw enable
```

### Configurações de Segurança
- ✅ CORS configurado para IP da VPS
- ✅ Headers de segurança habilitados
- ✅ Logs de erro não expõem stack trace
- ✅ Sessões configuradas com timeout
- ✅ Cookies seguros configurados

## 📊 Monitoramento

### Endpoints de Monitoramento
- **Health**: `http://72.61.219.15:8080/api/health`
- **Info**: `http://72.61.219.15:8080/actuator/info`
- **Metrics**: `http://72.61.219.15:8080/actuator/metrics`

### Logs Importantes
- **Aplicação**: `/var/log/mottu/mottu.log`
- **GC**: `/var/log/mottu/gc.log`
- **Erros**: `/var/log/mottu/mottu-error.log`

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Serviço não inicia
```bash
# Verificar logs
journalctl -u mottu-api -f

# Verificar configuração
systemctl cat mottu-api
```

#### 2. Erro de conexão com banco
```bash
# Verificar se Oracle está rodando
systemctl status oracle-xe

# Testar conexão
sqlplus mottu/mottu123@localhost:1521/XE
```

#### 3. Erro de CORS
- Verificar se IP está correto nas configurações
- Verificar se frontend está usando IP correto

#### 4. Erro de memória
```bash
# Verificar uso de memória
free -h
ps aux --sort=-%mem | head

# Ajustar JVM se necessário
nano /etc/systemd/system/mottu-api.service
```

## 📈 Otimizações

### JVM Otimizada
- **Heap**: 512MB - 2GB
- **GC**: G1GC
- **Compressão**: Habilitada
- **Tiered Compilation**: Habilitada

### Pool de Conexões
- **Máximo**: 15 conexões
- **Mínimo**: 3 conexões idle
- **Timeout**: 60s

### Cache
- **Tipo**: Caffeine
- **Tamanho**: 1000 itens
- **TTL**: 30 minutos

## 🔄 Atualizações

### Deploy de Nova Versão
```bash
# 1. Parar serviço
systemctl stop mottu-api

# 2. Backup da versão atual
cp /opt/mottu/mottu-gradle-0.0.1-SNAPSHOT.jar /opt/mottu/backup/

# 3. Copiar nova versão
scp build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar root@72.61.219.15:/opt/mottu/

# 4. Iniciar serviço
systemctl start mottu-api
```

## 📞 Suporte

### Logs para Análise
```bash
# Coletar logs completos
tar -czf mottu-logs-$(date +%Y%m%d).tar.gz /var/log/mottu/ /opt/mottu/logs/
```

### Informações do Sistema
```bash
# Informações da VPS
uname -a
free -h
df -h
java -version
```

---

**IP da VPS**: 72.61.219.15  
**Porta da API**: 8080  
**Perfil Ativo**: vps  
**Logs**: /var/log/mottu/
