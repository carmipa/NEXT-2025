# 📷 Guia: Acesso à Câmera e HTTPS

## 🔐 Requisitos de Segurança

### **Quando HTTPS é OBRIGATÓRIO:**

1. **Produção**: Sempre use HTTPS em produção
2. **Rede Local (IP)**: A maioria dos navegadores requer HTTPS quando acessando via IP (ex: `http://192.168.1.100:3000`)
3. **Dispositivos Móveis**: Telefones geralmente requerem HTTPS mesmo em desenvolvimento

### **Quando HTTP FUNCIONA:**

1. **localhost**: `http://localhost:3000` ✅ Funciona
2. **127.0.0.1**: `http://127.0.0.1:3000` ✅ Funciona
3. **Alguns navegadores**: Podem permitir HTTP em contextos locais específicos

## 🛠️ Soluções para Desenvolvimento

### **Opção 1: Usar localhost (Recomendado)**
```bash
# Acesse via localhost em vez de IP
http://localhost:3000/radar/buscar
```

### **Opção 2: Configurar HTTPS Local**

#### **Usando mkcert (Recomendado):**

1. **Instalar mkcert:**
   ```bash
   # Windows (com Chocolatey)
   choco install mkcert
   
   # Ou baixar de: https://github.com/FiloSottile/mkcert/releases
   ```

2. **Instalar certificado local:**
   ```bash
   mkcert -install
   ```

3. **Gerar certificado para localhost:**
   ```bash
   mkcert localhost 127.0.0.1 ::1
   ```

4. **Configurar Next.js para usar HTTPS:**

   Instalar `@next/bundle-analyzer` e criar script customizado, ou usar:

   ```bash
   npm install --save-dev https-localhost
   ```

   Criar arquivo `server.js` na raiz:
   ```javascript
   const { createServer } = require('https');
   const { parse } = require('url');
   const next = require('next');
   const fs = require('fs');
   const path = require('path');

   const dev = process.env.NODE_ENV !== 'production';
   const app = next({ dev });
   const handle = app.getRequestHandler();

   const httpsOptions = {
     key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
     cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
   };

   app.prepare().then(() => {
     createServer(httpsOptions, (req, res) => {
       const parsedUrl = parse(req.url, true);
       handle(req, res, parsedUrl);
     }).listen(3000, (err) => {
       if (err) throw err;
       console.log('> Ready on https://localhost:3000');
     });
   });
   ```

5. **Atualizar package.json:**
   ```json
   {
     "scripts": {
       "dev:https": "node server.js"
     }
   }
   ```

#### **Usando Caddy (Simples):**

1. **Instalar Caddy:** https://caddyserver.com/download

2. **Criar arquivo `Caddyfile`:**
   ```
   localhost:3000 {
       reverse_proxy localhost:3001
   }
   ```

3. **Rodar Next.js em porta diferente:**
   ```bash
   PORT=3001 npm run dev
   ```

4. **Iniciar Caddy:**
   ```bash
   caddy run
   ```

5. **Acessar:** `https://localhost:3000`

### **Opção 3: Usar Upload de Arquivo**

Se HTTPS não for viável em desenvolvimento, use a opção "Carregar do Computador" no scanner, que não requer acesso à câmera em tempo real.

## 📱 Navegadores e Comportamento

| Navegador | HTTP (localhost) | HTTP (IP) | HTTPS (IP) |
|-----------|------------------|-----------|------------|
| Chrome    | ✅ Sim           | ❌ Não    | ✅ Sim     |
| Firefox   | ✅ Sim           | ⚠️ Às vezes | ✅ Sim     |
| Edge      | ✅ Sim           | ❌ Não    | ✅ Sim     |
| Safari    | ✅ Sim           | ❌ Não    | ✅ Sim     |

## 🔍 Verificar Contexto Seguro

O componente `OcrScanner` agora verifica automaticamente se está em um contexto seguro:

```javascript
const isSecureContext = window.isSecureContext;
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
```

## ⚠️ Mensagens de Erro Comuns

### **"NotAllowedError" ou "PermissionDeniedError"**
- **Causa**: Usuário negou permissão de câmera
- **Solução**: Permitir acesso nas configurações do navegador

### **"NotFoundError" ou "DevicesNotFoundError"**
- **Causa**: Nenhuma câmera encontrada
- **Solução**: Verificar se há câmera conectada

### **"NotReadableError" ou "TrackStartError"**
- **Causa**: Câmera sendo usada por outro aplicativo
- **Solução**: Fechar outros aplicativos que usam a câmera

### **Erro de HTTPS**
- **Causa**: Tentando acessar câmera via HTTP (não localhost)
- **Solução**: Usar HTTPS ou acessar via localhost

## 📝 Resumo

- ✅ **Desenvolvimento Local**: Use `http://localhost:3000` - funciona sem HTTPS
- ✅ **Produção**: Sempre use HTTPS
- ✅ **Rede Local**: Configure HTTPS ou use upload de arquivo
- ✅ **Componente Melhorado**: Agora detecta e informa problemas de HTTPS automaticamente




