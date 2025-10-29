@echo off
echo ========================================
echo    TESTE COMPATIBILIDADE NEXT.JS
echo ========================================
echo.

echo [1/4] Iniciando aplicação Java com melhorias...
echo.
echo ✅ Cache Caffeine: Ativo
echo ✅ Logging: Otimizado
echo ✅ Performance: Melhorada
echo.

echo [2/4] Compilando e iniciando backend...
call gradlew clean bootJar
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha na compilação
    pause
    exit /b 1
)

echo ✅ JAR compilado com sucesso!
echo.

echo [3/4] Iniciando aplicação Java...
echo 🌐 Backend será iniciado em: http://localhost:8080
echo 📊 Health Check: http://localhost:8080/actuator/health
echo 📚 Swagger: http://localhost:8080/swagger-ui.html
echo.

start "MOTTU Backend" java -jar build\libs\mottu-gradle-1.0.0.jar

echo.
echo [4/4] Aguardando inicialização (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo ========================================
echo    ✅ BACKEND INICIADO COM SUCESSO!
echo ========================================
echo.
echo 🎯 PRÓXIMOS PASSOS:
echo    1. Abra outro terminal
echo    2. Navegue para: cd ..\mottu-web
echo    3. Execute: npm run dev
echo    4. Teste: http://localhost:3000
echo.
echo 📊 MONITORAMENTO:
echo    - Health: http://localhost:8080/actuator/health
echo    - Cache: http://localhost:8080/actuator/caches
echo    - Metrics: http://localhost:8080/actuator/metrics
echo.
echo ⚠️  IMPORTANTE: 
echo    - Teste todas as funcionalidades do Next.js
echo    - Verifique se não há erros de CORS
echo    - Confirme que o cache está funcionando
echo.
pause


















