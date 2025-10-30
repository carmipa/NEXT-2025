# 🗄️ Configurações do Banco de Dados VPS - ATUALIZADAS

## ✅ **Configurações Corrigidas para VPS (72.61.219.15)**

### **Detalhes da Conexão Oracle:**
- **Host**: `72.61.219.15`
- **Porta**: `1521`
- **Serviço**: `XEPDB1`
- **Usuário**: `relacaoDireta`
- **Senha**: `paulo1`
- **Schema**: `RELACAODIRETA`

### **URL de Conexão JDBC:**
```properties
spring.datasource.url=jdbc:oracle:thin:@//72.61.219.15:1521/XEPDB1
```

## 📁 **Arquivos Atualizados:**

### 1. **application-vps.properties**
```properties
# Database Configuration (VPS)
spring.datasource.url=jdbc:oracle:thin:@//72.61.219.15:1521/XEPDB1
spring.datasource.username=relacaoDireta
spring.datasource.password=paulo1
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# Hibernate Schema
spring.jpa.properties.hibernate.schema=RELACAODIRETA
spring.jpa.properties.hibernate.default_schema=RELACAODIRETA
spring.jpa.properties.hibernate.connection.username=relacaoDireta
spring.jpa.properties.hibernate.connection.password=paulo1
spring.jpa.properties.hibernate.connection.url=jdbc:oracle:thin:@//72.61.219.15:1521/XEPDB1
```

### 2. **deploy-vps.sh**
```bash
# JVM Options com configurações de banco
export JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication -Dspring.profiles.active=vps -Dspring.datasource.url=jdbc:oracle:thin:@//72.61.219.15:1521/XEPDB1 -Dspring.datasource.username=relacaoDireta -Dspring.datasource.password=paulo1"
```

### 3. **test-db-connection.sh** (NOVO)
Script para testar conectividade com o banco de dados.

## 🚀 **Comandos para Deploy:**

### **1. Build da Aplicação:**
```bash
./gradlew clean build -x test
```

### **2. Teste de Conexão (Local):**
```bash
chmod +x test-db-connection.sh
./test-db-connection.sh
```

### **3. Upload para VPS:**
```bash
scp build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar root@72.61.219.15:/opt/mottu/
scp deploy-vps.sh root@72.61.219.15:/opt/mottu/
scp test-db-connection.sh root@72.61.219.15:/opt/mottu/
```

### **4. Deploy na VPS:**
```bash
ssh root@72.61.219.15
cd /opt/mottu
chmod +x deploy-vps.sh
chmod +x test-db-connection.sh
./test-db-connection.sh  # Testar conexão primeiro
./deploy-vps.sh         # Deploy da aplicação
```

## 🔍 **Verificações Pós-Deploy:**

### **1. Status do Serviço:**
```bash
systemctl status mottu-api
```

### **2. Logs da Aplicação:**
```bash
tail -f /var/log/mottu/mottu.log
```

### **3. Teste da API:**
```bash
# Health check
curl http://72.61.219.15:8080/api/health

# Teste de conexão com banco
curl http://72.61.219.15:8080/actuator/health
```

### **4. Verificar Conectividade com Banco:**
```bash
# Na VPS
./test-db-connection.sh
```

## 🛠️ **Troubleshooting:**

### **Problema: Erro de Conexão com Banco**
```bash
# Verificar se Oracle está rodando
systemctl status oracle-xe

# Testar conectividade
telnet 72.61.219.15 1521

# Verificar logs da aplicação
journalctl -u mottu-api -f
```

### **Problema: Schema não encontrado**
- Verificar se o usuário `relacaoDireta` tem acesso ao schema `RELACAODIRETA`
- Verificar se as tabelas existem no schema correto

### **Problema: CORS**
- Verificar se o frontend está usando o IP correto: `72.61.219.15`
- Verificar configurações CORS no arquivo `application-vps.properties`

## 📊 **Monitoramento:**

### **Endpoints de Health:**
- **Geral**: `http://72.61.219.15:8080/api/health`
- **Banco**: `http://72.61.219.15:8080/actuator/health`
- **Métricas**: `http://72.61.219.15:8080/actuator/metrics`

### **Logs Importantes:**
- **Aplicação**: `/var/log/mottu/mottu.log`
- **Sistema**: `journalctl -u mottu-api -f`
- **Banco**: Verificar logs do Oracle

## ✅ **Checklist de Deploy:**

- [ ] Build da aplicação executado
- [ ] Teste de conexão com banco executado
- [ ] Upload dos arquivos para VPS
- [ ] Script de deploy executado
- [ ] Serviço iniciado com sucesso
- [ ] Health check respondendo
- [ ] Logs sem erros
- [ ] CORS configurado corretamente
- [ ] Frontend acessando API

---

**IP da VPS**: 72.61.219.15  
**Porta da API**: 8080  
**Banco**: Oracle XEPDB1  
**Schema**: RELACAODIRETA  
**Usuário**: relacaoDireta




