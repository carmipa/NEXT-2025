# 🚨 Solução para Erro 403 - CORS

## 🔍 **Problema Identificado**

O erro **403 Forbidden** está acontecendo porque as configurações de CORS não estão permitindo requisições do frontend para a API na VPS.

## ✅ **Soluções Implementadas**

### **1. Configuração CORS Atualizada**
- ✅ Adicionado IP da VPS (72.61.219.15) nas configurações de desenvolvimento
- ✅ Configurações de produção melhoradas com métodos e headers corretos
- ✅ Headers CORS completos para requisições POST/PUT/DELETE

### **2. Arquivos Modificados**
- `CorsConfig.java` - Configurações CORS atualizadas
- `application-prod.properties` - CORS para produção
- `test-cors.sh` - Script de teste CORS

## 🚀 **Como Resolver**

### **1. Rebuild e Deploy da API**
```bash
# No diretório mottu-gradle
./gradlew clean build -x test
scp build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar root@72.61.219.15:/opt/mottu/
ssh root@72.61.219.15
cd /opt/mottu
systemctl restart mottu-api
```

### **2. Verificar Configurações na VPS**
```bash
# SSH na VPS
ssh root@72.61.219.15

# Verificar se aplicação está rodando
systemctl status mottu-api

# Verificar logs
journalctl -u mottu-api -f
```

### **3. Testar CORS**
```bash
# Executar script de teste
chmod +x test-cors.sh
./test-cors.sh
```

## 🔧 **Configurações CORS**

### **Desenvolvimento (Local)**
```java
// Padrões permitidos:
"http://localhost:*"
"http://127.0.0.1:*"
"http://72.61.219.15:*"
"https://72.61.219.15:*"
```

### **Produção (VPS)**
```properties
# application-prod.properties
cors.allowed-origins=http://72.61.219.15:3000,http://localhost:3000,http://72.61.219.15:3002,http://72.61.219.15:8080
```

## 🛠️ **Troubleshooting**

### **Problema: Ainda retorna 403**
1. Verificar se aplicação está rodando na VPS
2. Verificar se perfil 'prod' está ativo
3. Verificar logs da aplicação
4. Verificar configurações de firewall

### **Problema: CORS não funciona**
1. Verificar se headers CORS estão sendo enviados
2. Verificar se métodos HTTP estão permitidos
3. Verificar se origens estão corretas

### **Problema: Frontend não conecta**
1. Verificar se API está acessível
2. Verificar se CORS está configurado
3. Verificar se firewall está permitindo requisições

## 📊 **Verificações**

### **1. Testar API**
```bash
curl http://72.61.219.15:8080/api/health
```

### **2. Testar CORS**
```bash
curl -H "Origin: http://localhost:3000" http://72.61.219.15:8080/api/clientes
```

### **3. Testar POST**
```bash
curl -X POST -H "Content-Type: application/json" -H "Origin: http://localhost:3000" -d '{"nome":"Teste"}' http://72.61.219.15:8080/api/clientes
```

## ✅ **Checklist de Solução**

- [ ] API está rodando na VPS
- [ ] Configurações CORS atualizadas
- [ ] Rebuild da aplicação executado
- [ ] Deploy na VPS executado
- [ ] Teste de CORS executado
- [ ] Frontend conectando com sucesso
- [ ] Cadastro de motos funcionando

## 🎯 **Resumo**

**O erro 403 foi causado por configurações CORS inadequadas. As correções implementadas devem resolver o problema.**

**Para aplicar as correções:**
1. Rebuild da aplicação
2. Deploy na VPS
3. Teste de CORS
4. Verificação do frontend

---

**💡 Dica**: Use o script `test-cors.sh` para verificar se o CORS está funcionando corretamente!



