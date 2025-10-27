# 🔧 Guia de Configuração OpenALPR para VPS

## 🎯 **Problema Identificado**

O OpenALPR precisa estar configurado corretamente na VPS para funcionar com a aplicação Java.

## ✅ **Soluções Implementadas**

### **1. Scripts de Verificação e Instalação**
- ✅ `check-openalpr-vps.sh` - Verifica se OpenALPR está instalado
- ✅ `install-openalpr-vps.sh` - Instala OpenALPR na VPS
- ✅ Configurações atualizadas para Linux

### **2. Configurações Atualizadas**
- ✅ Caminho correto: `/usr/bin/alpr` (em vez de `/usr/local/bin/alpr`)
- ✅ Configurações de produção atualizadas
- ✅ Configurações da VPS atualizadas

## 🚀 **Como Instalar OpenALPR na VPS**

### **1. Instalação Automática**
```bash
# No diretório mottu-gradle
chmod +x install-openalpr-vps.sh
./install-openalpr-vps.sh
```

### **2. Instalação Manual**
```bash
# SSH na VPS
ssh root@72.61.219.15

# Atualizar sistema
apt update && apt upgrade -y

# Instalar OpenALPR e dependências
apt install -y \
    openalpr \
    openalpr-daemon \
    openalpr-utils \
    libopenalpr-dev \
    opencv-python \
    tesseract-ocr \
    tesseract-ocr-por \
    tesseract-ocr-eng \
    libopencv-dev \
    python3-opencv
```

## 🔍 **Como Verificar se Está Funcionando**

### **1. Verificação Automática**
```bash
# No diretório mottu-gradle
chmod +x check-openalpr-vps.sh
./check-openalpr-vps.sh
```

### **2. Verificação Manual**
```bash
# SSH na VPS
ssh root@72.61.219.15

# Verificar se alpr está instalado
which alpr
alpr -v

# Verificar dependências
tesseract --version
pkg-config --modversion opencv4

# Testar comando básico
alpr -c eu -n 5 --help
```

## 🔧 **Configurações da Aplicação**

### **1. application-prod.properties**
```properties
# OpenALPR Configuration para Linux
mottu.ocr.alpr.command=/usr/bin/alpr
mottu.ocr.alpr.region=eu
mottu.ocr.alpr.topn=10
mottu.ocr.alpr.minConfidence=70
mottu.ocr.alpr.timeoutMs=30000
mottu.ocr.alpr.debugOutputDir=logs
```

### **2. application-vps.properties**
```properties
# OpenALPR Configuration (Linux VPS)
mottu.ocr.alpr.command=/usr/bin/alpr
mottu.ocr.alpr.region=eu
mottu.ocr.alpr.topn=10
mottu.ocr.alpr.minConfidence=70
mottu.ocr.alpr.timeoutMs=30000
mottu.ocr.alpr.debugOutputDir=logs
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
# Instalar OpenCV
apt install -y libopencv-dev python3-opencv

# Verificar versão
pkg-config --modversion opencv4
```

### **Problema: "Tesseract not found"**
```bash
# Instalar Tesseract
apt install -y tesseract-ocr tesseract-ocr-por tesseract-ocr-eng

# Verificar versão
tesseract --version
```

### **Problema: "Runtime data not found"**
```bash
# Verificar diretório de runtime
ls -la /usr/share/openalpr/runtime_data

# Se não existir, reinstalar
apt install -y openalpr
```

## 📊 **Verificações Importantes**

### **1. Verificar Instalação**
```bash
# Verificar pacotes instalados
dpkg -l | grep -i openalpr

# Verificar binários
which alpr
which alprd

# Verificar versões
alpr -v
tesseract --version
```

### **2. Verificar Dependências**
```bash
# Verificar OpenCV
pkg-config --modversion opencv4

# Verificar bibliotecas
ls -la /usr/lib/x86_64-linux-gnu | grep opencv

# Verificar dependências do alpr
ldd $(which alpr) | grep opencv
```

### **3. Verificar Configuração**
```bash
# Verificar arquivo de configuração
cat /etc/openalpr/openalpr.conf

# Verificar runtime data
ls -la /usr/share/openalpr/runtime_data
```

## 🧪 **Teste de Funcionamento**

### **1. Teste Básico**
```bash
# Testar comando básico
alpr -c eu -n 5 --help

# Testar com imagem (se disponível)
alpr -c eu -n 5 -j /caminho/para/imagem.jpg
```

### **2. Teste da Aplicação**
```bash
# Verificar logs da aplicação
journalctl -u mottu-api -f

# Testar endpoint de OCR
curl -X POST http://72.61.219.15:8080/api/radar/iniciar-sessao
```

## ✅ **Checklist de Configuração**

- [ ] OpenALPR instalado na VPS
- [ ] Dependências (OpenCV, Tesseract) instaladas
- [ ] Configurações da aplicação atualizadas
- [ ] Caminho correto configurado (`/usr/bin/alpr`)
- [ ] Runtime data disponível
- [ ] Teste básico funcionando
- [ ] Aplicação Java funcionando
- [ ] Endpoint de OCR respondendo

## 🎯 **Resumo**

**Para configurar OpenALPR na VPS:**

1. **Instalar dependências:**
   ```bash
   ./install-openalpr-vps.sh
   ```

2. **Verificar instalação:**
   ```bash
   ./check-openalpr-vps.sh
   ```

3. **Atualizar aplicação:**
   - Rebuild da aplicação
   - Deploy na VPS
   - Testar endpoint de OCR

4. **Verificar funcionamento:**
   - Logs da aplicação
   - Teste de reconhecimento
   - Endpoint de OCR

---

**💡 Dica**: Use os scripts `check-openalpr-vps.sh` e `install-openalpr-vps.sh` para automatizar a configuração!



