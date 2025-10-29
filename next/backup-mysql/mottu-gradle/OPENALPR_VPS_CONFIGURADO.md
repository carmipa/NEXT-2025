# ✅ OpenALPR Configurado na VPS

## 🎯 **Status da Instalação**

### **✅ OpenALPR Funcionando:**
- **Versão**: 2.3.0
- **Localização**: `/usr/local/bin/alpr`
- **Comando**: Funcionando corretamente

### **✅ Dependências Instaladas:**
- **OpenCV**: 4.6.0 (completo com todas as bibliotecas)
- **Tesseract**: 5.3.4
- **Runtime Data**: Disponível em `/usr/share/openalpr/runtime_data`

## 🔧 **Configurações Corrigidas**

### **1. application-prod.properties**
```properties
# OpenALPR Configuration para Linux
mottu.ocr.alpr.command=/usr/local/bin/alpr
mottu.ocr.alpr.region=eu
mottu.ocr.alpr.topn=10
mottu.ocr.alpr.minConfidence=70
mottu.ocr.alpr.timeoutMs=30000
mottu.ocr.alpr.debugOutputDir=logs
```

### **2. application-vps.properties**
```properties
# OpenALPR Configuration (Linux VPS)
mottu.ocr.alpr.command=/usr/local/bin/alpr
mottu.ocr.alpr.region=eu
mottu.ocr.alpr.topn=10
mottu.ocr.alpr.minConfidence=70
mottu.ocr.alpr.timeoutMs=30000
mottu.ocr.alpr.debugOutputDir=logs
```

## 🧪 **Como Testar**

### **1. Teste Básico na VPS**
```bash
# SSH na VPS
ssh root@72.61.219.15

# Testar comando básico
alpr -c eu -n 5 --help

# Testar com imagem (se disponível)
alpr -c eu -n 5 -j /caminho/para/imagem.jpg
```

### **2. Teste Automático**
```bash
# No diretório mottu-gradle
chmod +x test-openalpr-vps.sh
./test-openalpr-vps.sh
```

### **3. Teste da Aplicação**
```bash
# Verificar se aplicação está rodando
systemctl status mottu-api

# Verificar logs
journalctl -u mottu-api -f

# Testar endpoint
curl http://72.61.219.15:8080/api/health
```

## 📊 **Verificações Importantes**

### **1. OpenALPR Funcionando**
- ✅ Comando: `/usr/local/bin/alpr`
- ✅ Versão: 2.3.0
- ✅ Dependências: OpenCV 4.6.0, Tesseract 5.3.4
- ✅ Runtime Data: Disponível

### **2. Aplicação Java**
- ✅ Configurações atualizadas
- ✅ Caminho correto: `/usr/local/bin/alpr`
- ✅ Região: `eu`
- ✅ Debug: Habilitado

### **3. Teste de Funcionamento**
- ✅ Comando básico funcionando
- ✅ Dependências carregadas
- ✅ Runtime data disponível
- ⚠️ Serviço alprd não ativo (não necessário)

## 🚀 **Próximos Passos**

### **1. Rebuild da Aplicação**
```bash
# No diretório mottu-gradle
./gradlew clean build -x test
```

### **2. Deploy na VPS**
```bash
# Copiar JAR para VPS
scp build/libs/mottu-gradle-0.0.1-SNAPSHOT.jar root@72.61.219.15:/opt/mottu/

# SSH na VPS
ssh root@72.61.219.15
cd /opt/mottu

# Reiniciar aplicação
systemctl restart mottu-api
```

### **3. Testar OCR**
```bash
# Verificar logs da aplicação
journalctl -u mottu-api -f

# Testar endpoint de OCR
curl -X POST http://72.61.219.15:8080/api/radar/iniciar-sessao
```

## 🛠️ **Troubleshooting**

### **Problema: "alpr: command not found"**
```bash
# Verificar se está instalado
which alpr

# Se não estiver, reinstalar
apt install -y openalpr openalpr-utils
```

### **Problema: "OpenCV not found"**
```bash
# Verificar versão
pkg-config --modversion opencv4

# Se não estiver, reinstalar
apt install -y libopencv-dev python3-opencv
```

### **Problema: "Runtime data not found"**
```bash
# Verificar diretório
ls -la /usr/share/openalpr/runtime_data

# Se não existir, reinstalar
apt install -y openalpr
```

## ✅ **Checklist de Configuração**

- [x] OpenALPR instalado na VPS
- [x] Dependências (OpenCV, Tesseract) instaladas
- [x] Configurações da aplicação atualizadas
- [x] Caminho correto configurado (`/usr/local/bin/alpr`)
- [x] Runtime data disponível
- [x] Teste básico funcionando
- [ ] Aplicação Java atualizada
- [ ] Deploy na VPS executado
- [ ] Teste de OCR funcionando

## 🎯 **Resumo**

**OpenALPR está configurado e funcionando na VPS!**

**Configurações corretas:**
- Caminho: `/usr/local/bin/alpr`
- Região: `eu`
- Versão: 2.3.0
- Dependências: OpenCV 4.6.0, Tesseract 5.3.4

**Próximos passos:**
1. Rebuild da aplicação
2. Deploy na VPS
3. Teste de OCR
4. Verificação do funcionamento

---

**💡 Dica**: Use o script `test-openalpr-vps.sh` para verificar se tudo está funcionando corretamente!



