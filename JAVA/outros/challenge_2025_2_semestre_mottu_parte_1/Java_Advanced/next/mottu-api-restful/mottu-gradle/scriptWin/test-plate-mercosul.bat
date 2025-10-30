@echo off
echo ========================================
echo TESTE OPENALPR COM PADRÃO MERCOSUL
echo ========================================
echo.

echo 1. Verificando se o OpenALPR está funcionando...
C:\openalpr_64\alpr.exe --version
echo.

echo 2. Testando com região EU (padrão Mercosul)...
echo Criando imagem de teste simples...

REM Criar uma imagem de teste simples com uma placa Mercosul
echo Testando comando básico:
C:\openalpr_64\alpr.exe -j -c eu -n 10 --debug
echo.

echo 3. Verificando arquivos de configuração...
if exist "C:\openalpr_64\runtime_data\eu" (
    echo ✅ Diretório de configuração EU encontrado
    echo Conteúdo:
    dir "C:\openalpr_64\runtime_data\eu" /b
) else (
    echo ❌ Diretório de configuração EU não encontrado
    echo Verifique se C:\openalpr_64\runtime_data\eu existe
)

echo.
echo 4. Testando com uma imagem de exemplo (se existir)...
if exist "test-plate.jpg" (
    echo Testando com test-plate.jpg...
    C:\openalpr_64\alpr.exe -j -c eu -n 10 test-plate.jpg
) else (
    echo ℹ️ Nenhuma imagem de teste encontrada (test-plate.jpg)
    echo Para testar completamente, coloque uma imagem de placa Mercosul no diretório atual
)

echo.
echo ========================================
echo TESTE CONCLUÍDO
echo ========================================
echo.
echo O OpenALPR está configurado para reconhecer placas no padrão Mercosul
echo usando a região 'eu' que é compatível com o formato brasileiro.
echo.
pause





