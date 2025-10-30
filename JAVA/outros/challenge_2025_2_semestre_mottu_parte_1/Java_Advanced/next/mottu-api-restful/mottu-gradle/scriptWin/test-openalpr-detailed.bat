@echo off
echo ========================================
echo TESTE DETALHADO DO OPENALPR
echo ========================================
echo.

REM Verificar se o executável existe
echo 1. Verificando se o OpenALPR existe...
if not exist "C:\openalpr_64\alpr.exe" (
    echo ❌ ERRO: OpenALPR não encontrado em C:\openalpr_64\alpr.exe
    echo.
    echo Verifique se:
    echo - O OpenALPR está instalado em C:\openalpr_64\
    echo - O arquivo alpr.exe existe nesse diretório
    echo - Você tem permissões para acessar o diretório
    echo.
    pause
    exit /b 1
) else (
    echo ✅ OpenALPR encontrado em C:\openalpr_64\alpr.exe
)

echo.
echo 2. Testando comando de ajuda...
"C:\openalpr_64\alpr.exe" --help
echo.

echo 3. Testando comando básico com região EU...
"C:\openalpr_64\alpr.exe" -j -c eu -n 10 --help
echo.

echo 4. Verificando arquivos de configuração...
if exist "C:\openalpr_64\runtime_data\eu" (
    echo ✅ Diretório de configuração EU encontrado
    dir "C:\openalpr_64\runtime_data\eu" /b
) else (
    echo ⚠️  Diretório de configuração EU não encontrado
    echo Verifique se C:\openalpr_64\runtime_data\eu existe
)

echo.
echo 5. Testando com uma imagem de exemplo...
if exist "test-image.jpg" (
    echo Testando com test-image.jpg...
    "C:\openalpr_64\alpr.exe" -j -c eu -n 10 test-image.jpg
) else (
    echo ℹ️  Nenhuma imagem de teste encontrada (test-image.jpg)
    echo Para testar completamente, coloque uma imagem de placa no diretório atual
)

echo.
echo ========================================
echo TESTE CONCLUÍDO
echo ========================================
pause





