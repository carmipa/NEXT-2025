# 🚀 MOTTU Web

## 🎯 **Como Usar**

### **🏠 Desenvolvimento Normal**
```bash
npm run dev
```
- Usa API em `http://localhost:8080`
- Usa banco local
- Frontend em `http://localhost:3000`

### **🌐 Teste com VPS (Opcional)**
```bash
npm run dev:vps
```
- Usa API em `http://72.61.219.15:8080`
- Usa banco da VPS
- Frontend em `http://localhost:3000`

## 📦 **Instalação**

```bash
npm install
```

## 🔧 **Como Funciona**

### **Desenvolvimento Normal**
1. Certifique-se de que o Spring Boot está rodando em `localhost:8080`
2. Certifique-se de que o Oracle está rodando localmente
3. Execute `npm run dev`
4. Acesse `http://localhost:3000`

### **Teste com VPS (Opcional)**
1. Certifique-se de que a API está rodando na VPS
2. Execute `npm run dev:vps`
3. Acesse `http://localhost:3000`

## 🛠️ **Troubleshooting**

### **Problema: API não responde**
```bash
# Para local
cd ../mottu-gradle
./gradlew bootRun
```

### **Problema: Dados do banco não retornam**
- Verificar se Oracle está rodando
- Verificar configurações de banco
- Verificar se API está respondendo

## 📊 **Verificações**

### **1. Testar API Local**
```bash
curl http://localhost:8080/api/health
```

### **2. Testar API VPS**
```bash
curl http://72.61.219.15:8080/api/health
```

## ✅ **Checklist**

### **🏠 Desenvolvimento Normal**
- [ ] Spring Boot rodando em localhost:8080
- [ ] Oracle rodando localmente
- [ ] Executar `npm run dev`
- [ ] Acessar http://localhost:3000
- [ ] Verificar se dados do banco retornam

### **🌐 Teste com VPS (Opcional)**
- [ ] API rodando na VPS (72.61.219.15:8080)
- [ ] Oracle rodando na VPS
- [ ] Executar `npm run dev:vps`
- [ ] Acessar http://localhost:3000
- [ ] Verificar se dados do banco retornam

## 🎯 **Resumo**

**Para desenvolvimento normal:**
```bash
npm run dev
```

**Para testar com VPS (opcional):**
```bash
npm run dev:vps
```

**É só isso! Use `npm run dev` normalmente!** 🎉

---

**💡 Dica**: Use `npm run dev` para desenvolvimento normal e `npm run dev:vps` apenas quando quiser testar com a VPS!