# 🚀 Gerenciamento Automático de Portas - MOTTU

## 📋 Visão Geral

O projeto MOTTU agora possui um sistema inteligente de gerenciamento de portas que evita conflitos automaticamente.

## 🎯 Funcionalidades

### ✅ **Porta Dinâmica**
- Se a porta 8080 estiver ocupada, tenta automaticamente 8081, 8082, etc.
- Não interfere com outros serviços do sistema
- Funciona em qualquer ambiente

### ✅ **Detecção Automática**
- Verifica disponibilidade de portas antes de iniciar
- Sugere portas alternativas se necessário
- Logs informativos sobre o status das portas

### ✅ **CORS Inteligente**
- CORS configurado para aceitar portas dinâmicas automaticamente
- Frontend (localhost:3000) sempre funciona
- Backend aceita conexões em portas 8080-8085
- Suporte para IPs locais e tethering

### ✅ **Scripts de Inicialização**
- Scripts para Windows (.bat) e Linux/Mac (.sh)
- Verificação automática de dependências
- Inicialização inteligente com fallback de portas

## 🛠️ Como Usar

### **Opção 1: Scripts Automáticos (Recomendado)**

#### Windows:
```bash
# Execute o script de inicialização
./start-with-port-check.bat
```

#### Linux/Mac:
```bash
# Execute o script de inicialização
./start-with-port-check.sh
```

### **Opção 2: Gradle Direto**
```bash
# Porta específica
./gradlew bootRun -Dserver.port=8081

# Porta dinâmica (Spring Boot escolhe)
./gradlew bootRun -Dserver.port=0
```

### **Opção 3: Configuração Manual**

Edite `application.properties`:
```properties
# Porta específica
server.port=8081

# Porta dinâmica (recomendado)
server.port=0
```

## 🔧 Configurações Disponíveis

### **application.properties**
```properties
# Porta com fallback automático
server.port=${PORT:8080}

# Tipo de aplicação web
spring.main.web-application-type=servlet
```

### **Variáveis de Ambiente**
```bash
# Definir porta via variável de ambiente
export PORT=8081
./gradlew bootRun
```

## 🌐 Configuração CORS

### **Desenvolvimento (Automático)**
O CORS está configurado para aceitar automaticamente:

**Frontend (Next.js):**
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://192.168.0.3:3000` (IP local)
- `http://10.199.82.137:3000` (Tethering)

**Backend (Spring Boot) - Portas Dinâmicas:**
- `http://localhost:8080-8085`
- `http://127.0.0.1:8080-8085`
- `http://192.168.0.3:8080-8082`
- `http://10.199.82.137:8080-8082`

### **Logs CORS**
```
🌐 CORS Config: Configurando CORS para ambiente DESENVOLVIMENTO com porta do servidor: 8081
🔓 CORS Config: Desenvolvimento configurado com 23 origens permitidas
🌐 CORS: Configurado para aceitar frontend em localhost:3000
🌐 CORS: Backend aceitará conexões em portas 8080-8085 automaticamente
```

## 📊 Verificação de Portas

### **Verificar Portas Ocupadas**
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

### **Fechar Processo em Porta**
```bash
# Windows (substitua PID pelo ID do processo)
taskkill /PID 23716 /F

# Linux/Mac (substitua PID pelo ID do processo)
kill -9 23716
```

## 🎯 Portas de Fallback

O sistema tenta automaticamente estas portas em ordem:
1. **8080** (padrão)
2. **8081** (alternativa 1)
3. **8082** (alternativa 2)
4. **8083** (alternativa 3)
5. **8084** (alternativa 4)
6. **8085** (alternativa 5)
7. **3000** (alternativa 6)
8. **3001** (alternativa 7)
9. **3002** (alternativa 8)
10. **Porta aleatória** (se todas estiverem ocupadas)

## 📝 Logs e Monitoramento

### **Logs de Porta**
```
🚀 PortManager: Verificando configuração de porta...
📍 Porta configurada: 8080
✅ Porta 8080 está disponível
```

### **Logs de Conflito**
```
⚠️  Porta 8080 está ocupada!
💡 Sugestão: Use a porta 8081 como alternativa
🔧 Para usar automaticamente, configure: server.port=8081
```

## 🔍 Solução de Problemas

### **Problema: Porta sempre ocupada**
```bash
# Solução 1: Use porta dinâmica
server.port=0

# Solução 2: Use porta específica livre
server.port=8081

# Solução 3: Feche processos conflitantes
taskkill /PID <PID> /F
```

### **Problema: Aplicação não inicia**
```bash
# Verifique se Java está instalado
java -version

# Verifique se Gradle está disponível
./gradlew --version

# Verifique logs de erro
./gradlew bootRun --info
```

## 🎉 Benefícios

- ✅ **Zero Configuração**: Funciona automaticamente
- ✅ **Sem Conflitos**: Nunca mais problemas de porta ocupada
- ✅ **Multi-Ambiente**: Funciona em dev, test e prod
- ✅ **Logs Informativos**: Sempre sabe qual porta está sendo usada
- ✅ **Fallback Inteligente**: Tenta múltiplas portas automaticamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da aplicação
2. Execute o script de verificação de portas
3. Use `server.port=0` para porta dinâmica
4. Consulte este documento

---

**Desenvolvido para o projeto MOTTU - FIAP 2025** 🚀
