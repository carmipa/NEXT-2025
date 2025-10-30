
# Tesseract OCR no Spring Boot (Gradle) — Instalação & Configuração (Windows)

Este guia explica **por que** você precisa do Tesseract no seu projeto **Spring Boot com Gradle** e **como instalar e configurar** corretamente no Windows (com foco em PT-BR), incluindo a variável `TESSDATA_PREFIX`, dependências Java (Tess4J) e dicas de troubleshooting.

---

## 📌 Por que preciso dessa dependência?

Se seu backend Java faz **OCR** (reconhecimento de texto em imagens/PDFs), você precisa de:
1) **Binários do Tesseract** instalados no SO (Windows, Linux, etc.), que contêm o executável e os **arquivos de idiomas** (ex.: `por.traineddata`).
2) Uma **biblioteca Java** que dialogue com o Tesseract nativo (ex.: **Tess4J**).

Sem os binários e/ou sem o caminho correto para os dados do Tesseract, você verá erros como:
- `Invalid memory access`
- `Failed loading language 'por'`
- `Could not initialize Tesseract API`

---

## ✅ O que vamos fazer

1. **Instalar o Tesseract no Windows** (winget/choco).
2. **Instalar os dados de idioma** (Português).
3. **Configurar variáveis de ambiente** (`TESSDATA_PREFIX` e (opcional) `PATH`).
4. **Adicionar a dependência no Gradle** (Tess4J).
5. **Apontar o caminho do `tessdata` no Java** (via env ou código).
6. **Testar** com um snippet simples.
7. **Resolver problemas comuns**.

---

## 🧰 Requisitos

- Windows 10/11
- JDK 17+
- Gradle 7+ (ou o wrapper `./gradlew` gerado pelo Spring Initializr)
- (Opcional) Git, PowerShell

---

## 1) Instalar Tesseract (Windows)

### Opção A — **winget** (recomendado)
```powershell
winget install --id=UB-Mannheim.TesseractOCR -e
```
> Durante a instalação, **marque o idioma "Portuguese"** para instalar o `por.traineddata`.

### Opção B — **Chocolatey (choco)**
```powershell
choco install tesseract -y
# Se já tiver instalado:
# choco upgrade tesseract -y
```
> Caso o pacote não inclua o português, baixe o `por.traineddata` (tessdata_fast) e coloque em:
```
C:\Program Files\Tesseract-OCR\tessdata\
```

> **Verifique a instalação:**
```powershell
tesseract --version
tesseract --list-langs
# Procure por 'por' na lista
```

---

## 2) Variáveis de Ambiente (CRÍTICO)

Abra **Iniciar → “Editar as variáveis de ambiente do sistema” → Variáveis de Ambiente...**

Em **Variáveis do sistema**, crie/ajuste:

- **TESSDATA_PREFIX** → `C:\Program Files\Tesseract-OCR\`
    - Importante: deve apontar para a **pasta que contém** a subpasta `tessdata`.
- **(Opcional) PATH** → Adicione `C:\Program Files\Tesseract-OCR\` para usar `tesseract` no terminal.

> **Reinicie sua IDE/terminal** após salvar. Programas só “veem” variáveis na inicialização.

---

## 3) Dependência no **Gradle** (Tess4J)

No `build.gradle` (Groovy) adicione ao `dependencies`:

```gradle
implementation "net.sourceforge.tess4j:tess4j:<VERSAO_ATUAL>"
```
**Atenção:** substitua `<VERSAO_ATUAL>` pela versão mais recente do Tess4J disponível no Maven Central.  
Exemplos de versões recentes: `5.x`. (Se já usa Version Catalog, padronize lá.)

Se usar Kotlin DSL (`build.gradle.kts`):
```kotlin
implementation("net.sourceforge.tess4j:tess4j:<VERSAO_ATUAL>")
```

> Dica: rode um `./gradlew dependencies` ou confira no Maven Central para fixar a versão.

---

## 4) Apontando o caminho do `tessdata` no Java

Você pode **ler o caminho via variável de ambiente** (recomendado) ou **setar via código**.

### Opção A — Usando `TESSDATA_PREFIX` (env)
```java
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

public class OcrService {

    private final Tesseract tess;

    public OcrService() {
        this.tess = new Tesseract();
        // Se TESSDATA_PREFIX estiver configurado, o Tess4J acha a pasta automaticamente.
        // Ainda assim, você pode reforçar explicitamente:
        String base = System.getenv("TESSDATA_PREFIX"); // ex.: C:\Program Files\Tesseract-OCR
        if (base != null && !base.isBlank()) {
            tess.setDatapath(base); // aponta para a pasta QUE CONTÉM 'tessdata'
        }
        tess.setLanguage("por"); // 'por' para Português
    }

    public String ocr(String imagePath) throws TesseractException {
        return tess.doOCR(new java.io.File(imagePath));
    }
}
```

### Opção B — Propriedade no `application.properties`
```properties
ocr.tessdata-base=C:/Program Files/Tesseract-OCR
ocr.lang=por
```
Binder no `@ConfigurationProperties` ou leia via `@Value` e aplique em `tess.setDatapath(...)` / `tess.setLanguage(...)`.

---

## 5) Teste rápido

Crie um teste simples (pode ser um `@SpringBootTest` ou um `main`):

```java
public class OcrSmokeTest {
    public static void main(String[] args) throws Exception {
        var svc = new OcrService();
        System.out.println(svc.ocr("C:/temp/nota_fiscal_teste.png"));
    }
}
```

> Dicas:
> - Use imagem nítida (300dpi+) e com contraste adequado.
> - Teste primeiro com imagens **pequenas** de texto claro em PT-BR.

---

## 6) Problemas comuns & soluções

**1) `Invalid memory access`**
- Normalmente indica **caminho do `tessdata` incorreto** ou falta de permissões/arquivos.
- Verifique `TESSDATA_PREFIX` e se **existe** a subpasta `tessdata` com `por.traineddata` dentro.

**2) `Failed loading language 'por'` / `Could not initialize Tesseract API`**
- Falta o `por.traineddata` ou está no lugar errado.
- Garanta que `C:\\Program Files\\Tesseract-OCR\\tessdata\\por.traineddata` **existe**.
- Cheque `tesseract --list-langs` e confirme que `por` aparece.

**3) Erros em ambiente CI/CD (sem interface)**
- Instale Tesseract via script (choco/winget) na pipeline antes de rodar testes.
- Exemplo (PowerShell):
  ```powershell
  choco install tesseract -y
  $env:TESSDATA_PREFIX = "C:\Program Files\Tesseract-OCR"
  ```

**4) 32 vs 64 bits**
- Use o Tesseract compatível com sua JVM (normalmente **x64**). Misturar 32/64 pode causar falhas nativas.

**5) Permissões**
- Se estiver rodando como **Serviço do Windows**, verifique permissões de leitura na pasta `Tesseract-OCR`.

---

## 7) Script PowerShell opcional (setup + verificação)

Crie `setup-tesseract.ps1` e execute como **Administrador**:
```powershell
# 1) Instala com winget (ou troque por choco, se preferir)
winget install --id=UB-Mannheim.TesseractOCR -e

# 2) Garante TESSDATA_PREFIX no escopo do sistema
[Environment]::SetEnvironmentVariable("TESSDATA_PREFIX", "C:\Program Files\Tesseract-OCR", "Machine")

# 3) (Opcional) adiciona ao PATH do sistema
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($path -notlike "*C:\Program Files\Tesseract-OCR*") {
  [Environment]::SetEnvironmentVariable("Path", $path + ";C:\Program Files\Tesseract-OCR", "Machine")
}

Write-Host "Feche e reabra sua IDE/terminal para aplicar as variáveis."

# 4) Validação
tesseract --version
tesseract --list-langs
```

---

## 8) Notas para Linux (resumo)

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install -y tesseract-ocr tesseract-ocr-por

# Fedora
sudo dnf install -y tesseract tesseract-langpack-por

# Arch
sudo pacman -S tesseract tesseract-data-por
```

> Em Linux, costuma **não** ser necessário setar `TESSDATA_PREFIX`, pois os pacotes já posicionam `tessdata` em local padrão. Se precisar, exporte:  
> `export TESSDATA_PREFIX=/usr/share/tessdata`

---

## 9) Checklist final

- [ ] Tesseract instalado (`tesseract --version` OK).
- [ ] `tesseract --list-langs` mostra `por`.
- [ ] `TESSDATA_PREFIX` aponta para a pasta que **contém** `tessdata`.
- [ ] Dependência do Tess4J adicionada no Gradle e resolvida.
- [ ] Código define `language=por` e, se necessário, `setDatapath(...)`.
- [ ] Ambiente/IDE reiniciado após variáveis de ambiente.

---

## Licenças & créditos

- **Tesseract OCR**: Apache License 2.0
- **Tess4J**: Apache License 2.0

> Consulte as páginas oficiais dos projetos para detalhes de licenças e versões.
