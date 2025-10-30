# Scripts Linux para Deploy

Esta pasta contém scripts para Linux (.sh) para gerenciar o deploy da aplicação MOTTU na VPS Linux.

## Scripts Disponíveis

### 1. `build-jar.sh`
**Função:** Compila o JAR da aplicação
- Limpa build anterior
- Compila o projeto Java
- Gera o JAR

**Como usar:**
```bash
cd mottu-gradle
chmod +x scriptsLinux/*.sh
./scriptsLinux/build-jar.sh
```

### 2. `deploy-to-vps.sh`
**Função:** Deploy do JAR para a VPS
- Para o serviço na VPS
- Envia o JAR para a VPS
- Inicia o serviço na VPS

**Como usar:**
```bash
cd mottu-gradle
./scriptsLinux/deploy-to-vps.sh
```

### 3. `check-vps-openalpr.sh`
**Função:** Verifica se o OpenALPR está funcionando na VPS
- Verifica se o OpenALPR está instalado
- Testa a versão
- Executa um teste básico

**Como usar:**
```bash
cd mottu-gradle
./scriptsLinux/check-vps-openalpr.sh
```

### 4. `install-openalpr-vps.sh`
**Função:** Instala o OpenALPR na VPS Linux
- Atualiza o sistema
- Instala dependências
- Instala o OpenALPR
- Verifica a instalação

**Como usar:**
```bash
cd mottu-gradle
./scriptsLinux/install-openalpr-vps.sh
```

## Pré-requisitos

1. **SSH configurado** para acessar a VPS sem senha
2. **SCP configurado** para transferir arquivos
3. **OpenALPR instalado** na VPS (use o script de instalação)

## Ordem Recomendada

1. `build-jar.sh` - Compilar o JAR localmente
2. `install-openalpr-vps.sh` - Instalar OpenALPR na VPS (se necessário)
3. `check-vps-openalpr.sh` - Verificar se está funcionando
4. `deploy-to-vps.sh` - Fazer o deploy do JAR

## Configuração SSH

Para usar os scripts sem digitar senha, configure SSH key:

```bash
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
ssh-copy-id root@91.108.120.60
```

## Tornar Scripts Executáveis

```bash
chmod +x scriptsLinux/*.sh
```
