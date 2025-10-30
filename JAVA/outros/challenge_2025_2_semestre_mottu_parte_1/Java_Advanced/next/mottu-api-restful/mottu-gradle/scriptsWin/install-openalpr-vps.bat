@echo off
echo ========================================
echo   INSTALAR OPENALPR NO VPS LINUX
echo ========================================
echo.

echo [1/4] Atualizando o sistema...
ssh root@91.108.120.60 "apt update"
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha ao atualizar o sistema
    pause
    exit /b 1
)
echo ✅ Sistema atualizado

echo.
echo [2/4] Instalando dependências básicas...
ssh root@91.108.120.60 "apt install -y wget curl build-essential cmake git"
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha ao instalar dependências básicas
    pause
    exit /b 1
)
echo ✅ Dependências básicas instaladas

echo.
echo [3/4] Instalando OpenALPR...
ssh root@91.108.120.60 "apt install -y openalpr openalpr-daemon openalpr-utils libopenalpr-dev"
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Falha ao instalar OpenALPR
    echo.
    echo Tentando instalação manual...
    ssh root@91.108.120.60 "wget -O - https://deb.openalpr.com/openalpr.gpg.key | apt-key add -"
    ssh root@91.108.120.60 "echo 'deb https://deb.openalpr.com/openalpr-2.3.0/ ubuntu/ main' > /etc/apt/sources.list.d/openalpr.list"
    ssh root@91.108.120.60 "apt update && apt install -y openalpr openalpr-daemon openalpr-utils libopenalpr-dev"
    if %ERRORLEVEL% neq 0 (
        echo ❌ ERRO: Falha na instalação manual do OpenALPR
        pause
        exit /b 1
    )
)
echo ✅ OpenALPR instalado

echo.
echo [4/4] Verificando a instalação...
ssh root@91.108.120.60 "alpr --version"
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: OpenALPR não está funcionando após a instalação
    pause
    exit /b 1
)
echo ✅ OpenALPR funcionando

echo.
echo ========================================
echo   OPENALPR INSTALADO COM SUCESSO!
echo ========================================
echo.
echo Agora você pode:
echo 1. Executar check-vps-openalpr.bat para verificar
echo 2. Executar deploy-to-vps.bat para fazer o deploy
echo.
pause

