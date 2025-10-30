# 🖥️ Guia de Scripts Locais para VPS

## 🎯 **Scripts Disponíveis**

### **1. Verificação do OpenALPR**
```bash
# Executar diretamente na VPS
chmod +x check-openalpr-local.sh
./check-openalpr-local.sh
```

### **2. Instalação do OpenALPR**
```bash
# Executar diretamente na VPS
chmod +x install-openalpr-local.sh
./install-openalpr-local.sh
```

## 🚀 **Como Usar**

### **1. Conectar na VPS**
```bash
ssh root@72.61.219.15
```

### **2. Copiar Scripts para VPS**
```bash
# Do seu computador local
scp check-openalpr-local.sh root@72.61.219.15:/opt/mottu/
scp install-openalpr-local.sh root@72.61.219.15:/opt/mottu/
```

### **3. Executar na VPS**
```bash
# Na VPS
cd /opt/mottu
chmod +x *.sh

# Verificar OpenALPR
./check-openalpr-local.sh

# Instalar OpenALPR (se necessário)
./install-openalpr-local.sh
```

## 🔍 **O que os Scripts Fazem**

### **check-openalpr-local.sh**
- ✅ Verifica pacotes instalados
- ✅ Verifica binários disponíveis
- ✅ Verifica versões
- ✅ Verifica OpenCV e Tesseract
- ✅ Verifica arquivos de configuração
- ✅ Verifica runtime data
- ✅ Verifica bibliotecas OpenCV
- ✅ Verifica dependências
- ✅ Verifica status do serviço
- ✅ Testa reconhecimento
- ✅ Testa comando básico

### **install-openalpr-local.sh**
- ✅ Atualiza sistema
- ✅ Instala dependências
- ✅ Verifica instalação
- ✅ Configura OpenALPR
- ✅ Testa OpenALPR
- ✅ Configura permissões
- ✅ Inicia serviços
- ✅ Cria script de teste

## 📊 **Verificações Importantes**

### **1. Pacotes Instalados**
```bash
dpkg -l | grep -i openalpr
dpkg -l | grep -i opencv
dpkg -l | grep -i tesseract
```

### **2. Binários Disponíveis**
```bash
which alpr
which alprd
which tesseract
```

### **3. Versões**
```bash
alpr -v
tesseract --version
pkg-config --modversion opencv4
```

### **4. Configurações**
```bash
cat /etc/openalpr/openalpr.conf
ls -la /usr/share/openalpr/runtime_data
```

### **5. Serviços**
```bash
systemctl status alprd
systemctl is-active alprd
```

## 🛠️ **Troubleshooting**

### **Problema: "Permission denied"**
```bash
chmod +x *.sh
```

### **Problema: "Command not found"**
```bash
# Verificar se está instalado
which alpr

# Se não estiver, instalar
./install-openalpr-local.sh
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
curl -X POST http://localhost:8080/api/radar/iniciar-sessao
```

## ✅ **Checklist de Configuração**

- [ ] Scripts copiados para VPS
- [ ] Scripts com permissão de execução
- [ ] OpenALPR instalado
- [ ] Dependências instaladas
- [ ] Configurações corretas
- [ ] Serviços rodando
- [ ] Teste básico funcionando
- [ ] Aplicação Java funcionando

## 🎯 **Resumo**

**Para usar os scripts locais:**

1. **Conectar na VPS:**
   ```bash
   ssh root@72.61.219.15
   ```

2. **Copiar scripts:**
   ```bash
   scp *.sh root@72.61.219.15:/opt/mottu/
   ```

3. **Executar na VPS:**
   ```bash
   cd /opt/mottu
   chmod +x *.sh
   ./check-openalpr-local.sh
   ./install-openalpr-local.sh
   ```

4. **Verificar funcionamento:**
   ```bash
   /opt/mottu/test-openalpr.sh
   ```

---

**💡 Dica**: Use os scripts locais para ter controle total sobre a instalação e configuração do OpenALPR na VPS!



