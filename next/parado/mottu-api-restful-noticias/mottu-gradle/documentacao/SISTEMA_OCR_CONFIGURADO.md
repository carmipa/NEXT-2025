# Sistema OCR Configurado - OpenALPR + OpenCV + Tesseract

## ✅ Configuração Atual

### 1. **OpenALPR (Principal)**
- **Função**: Reconhecimento principal de placas no padrão Mercosul
- **Configuração**: Via linha de comando (`alpr`)
- **Local**: 
  - Windows: `C:\openalpr_64\alpr.exe`
  - VPS Linux: `/usr/local/bin/alpr`
- **Região**: `eu` (compatível com padrão Mercosul brasileiro)
- **Confiança mínima**: 70%

### 2. **OpenCV (Suporte)**
- **Função**: Pré-processamento de imagens para melhor qualidade
- **Configuração**: Via biblioteca Java (`org.openpnp:opencv:4.9.0-0`)
- **Recursos**: Conversão para escala de cinza, blur gaussiano, threshold adaptativo
- **Fallback**: Se OpenCV falhar, usa processamento básico Java

### 3. **Tesseract (Fallback)**
- **Função**: Reconhecimento secundário caso OpenALPR falhe
- **Configuração**: Via biblioteca Java (`net.sourceforge.tess4j:tess4j:5.11.0`)
- **Idiomas**: Português + Inglês (`por+eng`)

## 🔄 Fluxo de Processamento

1. **Upload da imagem** → Backend recebe via API
2. **Pré-processamento** → OpenCV melhora a qualidade da imagem
3. **Reconhecimento principal** → OpenALPR tenta reconhecer a placa
4. **Fallback** → Se OpenALPR falhar, Tesseract tenta reconhecer
5. **Normalização** → Placa é normalizada para padrão Mercosul
6. **Resposta** → Resultado retornado para o frontend

## 📁 Arquivos Configurados

### Backend Java
- `build.gradle` - Dependências configuradas
- `application.properties` - Configurações do OpenALPR
- `OpenCvLoader.java` - Carregamento do OpenCV com fallback
- `OpenAlprService.java` - Serviço principal do OpenALPR
- `TesseractService.java` - Serviço de fallback com OpenCV

### Frontend Next.js
- `OcrScanner.tsx` - Interface de upload e reconhecimento
- `armazenar/page.tsx` - Página principal de armazenamento

## 🚀 Como Testar

### 1. **Teste Local (Windows)**
```bash
cd mottu-gradle
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

### 2. **Teste VPS (Linux)**
```bash
cd mottu-gradle
./gradlew bootRun --args="--spring.profiles.active=dev"
```

### 3. **Teste Frontend**
- Acesse: `http://localhost:3000/radar/armazenar`
- Teste com: "Carregar do Computador"
- Upload uma imagem de placa Mercosul

## 🔧 Configurações por Ambiente

### Windows (Desenvolvimento)
```properties
mottu.ocr.alpr.command=C:\\openalpr_64\\alpr.exe
mottu.ocr.alpr.region=eu
mottu.ocr.alpr.minConfidence=70
```

### VPS Linux (Produção)
```properties
mottu.ocr.alpr.command=alpr
mottu.ocr.alpr.region=eu
mottu.ocr.alpr.minConfidence=70
```

## 📊 Logs de Debug

Os logs são salvos em:
- `logs/ultima-saida-alpr-cfg-eu.json` - Última execução do OpenALPR
- `logs/saida-eu-YYYYMMDD-HHMMSS.json` - Histórico de execuções

## ✅ Status Atual

- ✅ OpenALPR configurado e funcionando
- ✅ OpenCV configurado com fallback
- ✅ Tesseract configurado como fallback secundário
- ✅ Sistema híbrido implementado
- ✅ Configurações para Windows e Linux
- ✅ Logs de debug habilitados
- ⏳ Teste em produção pendente

## 🎯 Próximos Passos

1. **Testar localmente** com imagens de placas Mercosul
2. **Deploy no VPS** e testar em produção
3. **Ajustar confiança mínima** se necessário
4. **Monitorar logs** para otimizações





