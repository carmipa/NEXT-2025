# Configuração do OpenCV e OpenALPR

## Problema Identificado

O erro que você está enfrentando na página `/radar/armazenar` está relacionado à configuração do OpenCV e OpenALPR no backend Java.

## Solução Implementada

### 1. Configuração do OpenALPR

O OpenALPR já está configurado no arquivo `application.properties`:

```properties
# OpenALPR Configuration
mottu.ocr.alpr.command=C:\\openalpr_64\\alpr.exe
mottu.ocr.alpr.region=eu
mottu.ocr.alpr.topn=10
mottu.ocr.alpr.minConfidence=70
mottu.ocr.alpr.timeoutMs=30000
mottu.ocr.alpr.debugOutputDir=logs
```

### 2. Verificações Necessárias

#### A. Verificar se o OpenALPR está instalado corretamente:

1. Execute o script de teste:
   ```bash
   test-openalpr-detailed.bat
   ```

2. Verifique se o arquivo `C:\openalpr_64\alpr.exe` existe

3. Verifique se o diretório `C:\openalpr_64\runtime_data\eu` existe

#### B. Verificar se o backend está funcionando:

1. Execute o script de teste do backend:
   ```bash
   test-backend-ocr.bat
   ```

2. Verifique se o Spring Boot está rodando na porta 8080

3. Teste o endpoint: `http://localhost:8080/api/radar/iniciar-sessao`

### 3. Configurações Ajustadas

- **Confiança mínima**: Reduzida de 80% para 70% para melhor detecção
- **Timeout**: Aumentado de 15s para 30s para processamento mais lento
- **Logs de debug**: Habilitados para diagnóstico
- **Fallback**: OpenCV configurado para não falhar se não estiver disponível

### 4. Como Testar

1. **Inicie o backend**:
   ```bash
   cd mottu-gradle
   gradlew bootRun
   ```

2. **Inicie o frontend**:
   ```bash
   cd mottu-web
   npm run dev
   ```

3. **Acesse a página**:
   - Local: `http://localhost:3000/radar/armazenar`
   - Produção: `http://91.108.120.60:3000/radar/armazenar`

4. **Teste o OCR**:
   - Escolha "Carregar do Computador"
   - Faça upload de uma imagem de placa
   - Verifique os logs em `mottu-gradle/logs/`

### 5. Logs de Debug

Os logs de debug do OpenALPR são salvos em:
- `logs/ultima-saida-alpr-cfg-eu.json` - Última execução
- `logs/saida-eu-YYYYMMDD-HHMMSS.json` - Histórico

### 6. Possíveis Problemas e Soluções

#### Problema: "OpenALPR não encontrado"
- **Solução**: Verifique se o OpenALPR está instalado em `C:\openalpr_64\`
- **Alternativa**: Atualize o caminho no `application.properties`

#### Problema: "Timeout executando o OpenALPR"
- **Solução**: Aumente o `timeoutMs` no `application.properties`
- **Verificação**: Teste com uma imagem menor ou de melhor qualidade

#### Problema: "Nenhuma placa encontrada"
- **Solução**: Reduza o `minConfidence` no `application.properties`
- **Verificação**: Use imagens de placa com boa qualidade e iluminação

#### Problema: "Erro interno no reconhecimento"
- **Solução**: Verifique os logs de debug para detalhes específicos
- **Verificação**: Teste o OpenALPR diretamente via linha de comando

### 7. Comandos de Teste Direto

Para testar o OpenALPR diretamente:

```bash
# Teste básico
C:\openalpr_64\alpr.exe -j -c eu -n 10 imagem.jpg

# Teste com configurações específicas
C:\openalpr_64\alpr.exe -j -c eu -n 10 --min_confidence 70 imagem.jpg
```

### 8. Monitoramento

Para monitorar o funcionamento:

1. **Logs do Spring Boot**: Verifique o console onde o `gradlew bootRun` está rodando
2. **Logs de debug**: Verifique os arquivos em `logs/`
3. **Frontend**: Verifique o console do navegador (F12)

## Status Atual

✅ OpenALPR configurado  
✅ Fallback para OpenCV implementado  
✅ Logs de debug habilitados  
✅ Scripts de teste criados  
⚠️ Requer verificação da instalação do OpenALPR  
⚠️ Requer teste com imagens reais de placa  





