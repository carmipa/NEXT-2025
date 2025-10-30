@echo off
echo Testando OpenALPR...
echo.

REM Verificar se o executável existe
if not exist "C:\openalpr_64\alpr.exe" (
    echo ERRO: OpenALPR não encontrado em C:\openalpr_64\alpr.exe
    echo Verifique se o OpenALPR está instalado corretamente.
    pause
    exit /b 1
)

echo ✅ OpenALPR encontrado em C:\openalpr_64\alpr.exe
echo.

REM Testar comando básico
echo Testando comando básico...
"C:\openalpr_64\alpr.exe" --help
echo.

REM Testar com uma imagem de exemplo (se existir)
if exist "test-image.jpg" (
    echo Testando com imagem de exemplo...
    "C:\openalpr_64\alpr.exe" -j -c eu -n 10 test-image.jpg
) else (
    echo Aviso: Nenhuma imagem de teste encontrada (test-image.jpg)
)

echo.
echo Teste concluído!
pause





