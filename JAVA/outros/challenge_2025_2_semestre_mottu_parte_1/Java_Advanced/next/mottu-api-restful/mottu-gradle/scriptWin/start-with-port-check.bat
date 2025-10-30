@echo off
echo ========================================
echo    MOTTU - Gerenciador de Portas
echo ========================================
echo.

REM Verificar se Java está instalado
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java não encontrado! Instale o Java 21 ou superior.
    pause
    exit /b 1
)

echo ✅ Java encontrado!

REM Verificar se Gradle está disponível
gradlew --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Gradle wrapper não encontrado!
    pause
    exit /b 1
)

echo ✅ Gradle wrapper encontrado!
echo.

REM Verificar portas comuns
echo 🔍 Verificando portas comuns...
set /a port_8080=0
set /a port_8081=0
set /a port_8082=0

REM Verificar porta 8080
netstat -ano | findstr :8080 >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Porta 8080 está ocupada
    set /a port_8080=1
) else (
    echo ✅ Porta 8080 está disponível
)

REM Verificar porta 8081
netstat -ano | findstr :8081 >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Porta 8081 está ocupada
    set /a port_8081=1
) else (
    echo ✅ Porta 8081 está disponível
)

REM Verificar porta 8082
netstat -ano | findstr :8082 >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Porta 8082 está ocupada
    set /a port_8082=1
) else (
    echo ✅ Porta 8082 está disponível
)

echo.

REM Decidir qual porta usar
if %port_8080%==0 (
    echo 🎯 Usando porta padrão 8080
    set "SPRING_PORT=8080"
) else if %port_8081%==0 (
    echo 🎯 Usando porta alternativa 8081
    set "SPRING_PORT=8081"
) else if %port_8082%==0 (
    echo 🎯 Usando porta alternativa 8082
    set "SPRING_PORT=8082"
) else (
    echo 🎲 Usando porta dinâmica (Spring Boot escolherá automaticamente)
    set "SPRING_PORT=0"
)

echo.
echo 🚀 Iniciando aplicação MOTTU na porta %SPRING_PORT%...
echo.
echo 💡 Dica: Se a porta estiver ocupada, o Spring Boot tentará automaticamente
echo    as portas 8081, 8082, 8083, etc.
echo.

REM Iniciar a aplicação
set "JAVA_OPTS=-Xmx1024m -Xms512m"
gradlew bootRun -Dserver.port=%SPRING_PORT% %JAVA_OPTS%

echo.
echo 🏁 Aplicação finalizada.
pause
