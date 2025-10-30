# 🚀 Scripts de Desenvolvimento - Mottu Web

## 📋 Scripts Disponíveis

### 1. **Desenvolvimento Normal**
```bash
npm run dev
```
Inicia o servidor Next.js na porta 3000 (ou próxima disponível)

### 2. **Desenvolvimento com Limpeza Automática** ⭐ RECOMENDADO
```bash
npm run dev:clean
```
- Para todos os processos Node.js
- Aguarda 2 segundos
- Inicia um servidor limpo
- **Previne acúmulo de processos**

### 3. **Parar Todos os Servidores**
```bash
npm run stop
```
Encerra todos os processos Node.js em execução

### 4. **Build de Produção**
```bash
npm run build
```
Cria build otimizado para produção

### 5. **Iniciar Produção**
```bash
npm start
```
Inicia servidor em modo produção (após build)

## 🛠️ Scripts Avançados

### **Windows (PowerShell/CMD)**
```bash
.\start-clean.bat
```
Script standalone que:
- Mata processos Node.js
- Limpa a porta
- Inicia servidor

### **Linux/Mac**
```bash
chmod +x start-clean.sh
./start-clean.sh
```
Script standalone para sistemas Unix

## 💡 Dicas de Uso

### ⚠️ **Quando usar `dev:clean`:**
- Quando a porta 3000 está ocupada
- Após erros de build
- Quando múltiplos servidores estão rodando
- Para garantir um ambiente limpo

### ✅ **Quando usar `dev` normal:**
- Primeira execução do dia
- Quando tem certeza que não há processos rodando
- Para economizar tempo de inicialização

## 🔧 Solução de Problemas

### Problema: "Port 3000 is in use"
```bash
npm run stop
npm run dev
```

### Problema: Múltiplos servidores rodando
```bash
npm run dev:clean
```

### Problema: Servidor não responde
```bash
npm run stop
# Aguarde 5 segundos
npm run dev
```

## 📊 Monitoramento de Processos

### Ver processos Node.js rodando (Windows):
```bash
tasklist | findstr node.exe
```

### Ver qual processo está usando a porta 3000:
```bash
netstat -ano | findstr :3000
```

---

**💚 Desenvolvido pela equipe MetaMind Solutions**


