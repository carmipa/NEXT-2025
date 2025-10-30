# Scripts Windows para Deploy

Esta pasta contém scripts para Windows (.bat) para gerenciar o deploy da aplicação MOTTU na VPS Linux.

## Scripts Disponíveis

### 1. `build-and-deploy.bat`
**Função:** Build e deploy completo da aplicação
- Compila o projeto Java (gradlew.bat bootJar)
- Para o serviço na VPS
- Envia o JAR para a VPS
- **NÃO** reinicia o serviço (você precisa fazer manualmente)

**Como usar:**
```cmd
cd mottu-gradle
scriptsWin\build-and-deploy.bat
```

### 2. `restart-vps-service.bat`
**Função:** Reinicia o serviço na VPS
- Para o serviço na VPS
- Inicia o serviço na VPS

**Como usar:**
```cmd
cd mottu-gradle
scriptsWin\restart-vps-service.bat
```

### 3. `check-vps-openalpr.bat`
**Função:** Verifica se o OpenALPR está funcionando na VPS
- Verifica se o OpenALPR está instalado
- Testa a versão
- Executa um teste básico

**Como usar:**
```cmd
cd mottu-gradle
scriptsWin\check-vps-openalpr.bat
```

### 4. `install-openalpr-vps.bat`
**Função:** Instala o OpenALPR na VPS Linux
- Atualiza o sistema
- Instala dependências
- Instala o OpenALPR
- Verifica a instalação

**Como usar:**
```cmd
cd mottu-gradle
scriptsWin\install-openalpr-vps.bat
```

## Pré-requisitos

1. **SSH configurado** para acessar a VPS sem senha
2. **SCP configurado** para transferir arquivos
3. **OpenALPR instalado** na VPS (use o script de instalação)

## Ordem Recomendada

1. `build-and-deploy.bat` - Compilar e enviar JAR para VPS
2. `restart-vps-service.bat` - Reiniciar serviço na VPS
3. `check-vps-openalpr.bat` - Verificar se OpenALPR está funcionando
4. `install-openalpr-vps.bat` - Instalar OpenALPR na VPS (se necessário)

## Configuração SSH

Para usar os scripts sem digitar senha, configure SSH key:

```cmd
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
ssh-copy-id root@91.108.120.60
```
