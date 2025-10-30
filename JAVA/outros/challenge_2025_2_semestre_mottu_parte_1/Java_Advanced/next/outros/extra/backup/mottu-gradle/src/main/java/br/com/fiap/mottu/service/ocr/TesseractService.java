package br.com.fiap.mottu.service.ocr;

import br.com.fiap.mottu.exception.InvalidInputException;
import jakarta.annotation.PostConstruct;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.opencv.core.Mat;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.List;

@Service
public class TesseractService {

    private static final Logger log = LoggerFactory.getLogger(TesseractService.class);

    // --- DECLARAÇÃO DAS VARIÁVEIS DE CLASSE (ESTA PARTE ESTAVA FALTANDO) ---
    @Value("${mottu.ocr.lang:por+eng}")
    private String configuredLang;

    @Value("${mottu.ocr.tessdata-path:}")
    private String configuredTessdataPath;

    private File tessdataDirResolved;
    private final OcrSessionManager sessionManager;
    private final Path runtimeRootDir; // <-- A VARIÁVEL QUE FALTAVA
    private final Path runtimeTessdataDir;
    // --- FIM DAS DECLARAÇÕES ---

    public TesseractService(OcrSessionManager sessionManager) {
        this.sessionManager = sessionManager;
        ImageIO.setUseCache(false);

        try {
            // Inicialização das variáveis
            this.runtimeRootDir = Files.createTempDirectory("mottu-ocr-" + Instant.now().toEpochMilli());
            this.runtimeTessdataDir = Files.createDirectories(this.runtimeRootDir.resolve("tessdata"));
            copyTessdataFromClasspath();
            log.info("TesseractService inicializado. Diretório de trabalho: {}", runtimeRootDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Falha crítica ao preparar diretório de trabalho do OCR", e);
        }
    }

    @PostConstruct
    public void init() {
        resolveTessdataPath();
        log.info("Idiomas de OCR configurados='{}'", configuredLang);
    }

    private void resolveTessdataPath() {
        List<String> triedPaths = new ArrayList<>();
        if (configuredTessdataPath != null && !configuredTessdataPath.isBlank()) {
            File f = new File(configuredTessdataPath);
            triedPaths.add("propriedade 'mottu.ocr.tessdata-path': " + f.getAbsolutePath());
            if (f.isDirectory()) {
                tessdataDirResolved = f;
            }
        }
        if (tessdataDirResolved == null) {
            String envPath = System.getenv("TESSDATA_PREFIX");
            if (envPath != null && !envPath.isBlank()) {
                File f = new File(envPath);
                triedPaths.add("variável de ambiente 'TESSDATA_PREFIX': " + f.getAbsolutePath());
                if (f.isDirectory()) {
                    tessdataDirResolved = f;
                }
            }
        }
        if (tessdataDirResolved == null) {
            tessdataDirResolved = this.runtimeTessdataDir.toFile();
            triedPaths.add("extração do classpath para: " + tessdataDirResolved.getAbsolutePath());
        }

        if (tessdataDirResolved != null && tessdataDirResolved.listFiles((dir, name) -> name.endsWith(".traineddata")).length > 0) {
            log.info("✅ Tesseract 'tessdata' localizado com sucesso em: {}", tessdataDirResolved.getAbsolutePath());
        } else {
            log.error("❌ FALHA CRÍTICA: Não foi possível resolver a pasta 'tessdata'. Tentativas: {}", triedPaths);
        }
    }

    private void copyTessdataFromClasspath() throws IOException {
        String[] entries = {"eng.traineddata", "por.traineddata", "osd.traineddata"};
        for (String entry : entries) {
            String resourcePath = "/tessdata/" + entry;
            try (InputStream in = getClass().getResourceAsStream(resourcePath)) {
                if (in == null) {
                    log.warn("Recurso de OCR não encontrado no classpath: {}", resourcePath);
                    continue;
                }
                Files.copy(in, this.runtimeTessdataDir.resolve(entry));
                log.info("Recurso de OCR copiado: {}", entry);
            }
        }
    }

    public void extractPlate(String sessionId, byte[] imageBytes) {
        sessionManager.setSessionProcessing(sessionId);
        try {
            if (imageBytes == null || imageBytes.length == 0) {
                throw new InvalidInputException("Arquivo de imagem está vazio ou corrompido.");
            }
            BufferedImage sourceImage = readImageStrict(imageBytes);
            BufferedImage processedImage = preprocessImageForOcr(sourceImage);
            Path pngTempFile = writePngTemp(processedImage);
            String ocrResult = runTesseractOcr(pngTempFile);
            String normalizedPlate = PlateUtils.normalizeMercosul(ocrResult);

            if (normalizedPlate == null || normalizedPlate.length() < 7) {
                throw new InvalidInputException("Não foi possível reconhecer uma placa válida na imagem.");
            }
            log.info("Sessão {}: Placa reconhecida e normalizada: {}", sessionId, normalizedPlate);
            sessionManager.updateSessionSuccess(sessionId, normalizedPlate);
        } catch (Throwable ex) {
            log.error("Sessão {}: Falha no processo de OCR: {}", sessionId, ex.getMessage(), ex);
            String errorMessage = (ex instanceof InvalidInputException) ? ex.getMessage() : "Erro interno ao processar a imagem.";
            sessionManager.updateSessionError(sessionId, errorMessage);
        }
    }

    private String runTesseractOcr(Path imageFile) throws TesseractException {
        if (tessdataDirResolved == null || !tessdataDirResolved.isDirectory()) {
            throw new TesseractException("Diretório 'tessdata' não foi inicializado.");
        }
        ITesseract tesseract = new Tesseract();
        tesseract.setDatapath(tessdataDirResolved.getParentFile().getAbsolutePath());
        String langToUse = chooseLanguage(configuredLang);
        tesseract.setLanguage(langToUse);
        tesseract.setTessVariable("user_defined_dpi", "300");
        long startTime = System.currentTimeMillis();
        String result = tesseract.doOCR(imageFile.toFile());
        long duration = System.currentTimeMillis() - startTime;
        log.info("Tess4J executado em {} ms com o idioma '{}'", duration, langToUse);
        return result != null ? result.trim() : "";
    }

    private String chooseLanguage(String requested) {
        Set<String> availableLangs = listAvailableLanguages();
        if (availableLangs.isEmpty()) {
            log.error("Nenhum arquivo .traineddata encontrado em {}", tessdataDirResolved);
            return "eng";
        }
        List<String> langsToUse = new ArrayList<>();
        for (String lang : requested.split("\\+")) {
            if (availableLangs.contains(lang.trim())) {
                langsToUse.add(lang.trim());
            }
        }
        if (langsToUse.isEmpty()) {
            if (availableLangs.contains("eng")) {
                log.warn("Idiomas requisitados '{}' não encontrados. Usando fallback 'eng'.", requested);
                return "eng";
            } else {
                String fallback = availableLangs.iterator().next();
                log.warn("Idiomas requisitados '{}' e 'eng' não encontrados. Usando fallback: '{}'", requested, fallback);
                return fallback;
            }
        }
        return String.join("+", langsToUse);
    }

    private Set<String> listAvailableLanguages() {
        Set<String> languages = new HashSet<>();
        if (tessdataDirResolved == null || !tessdataDirResolved.isDirectory()) return languages;
        File[] files = tessdataDirResolved.listFiles((dir, name) -> name.toLowerCase().endsWith(".traineddata"));
        if (files != null) {
            for (File f : files) {
                languages.add(f.getName().replace(".traineddata", ""));
            }
        }
        return languages;
    }

    private BufferedImage readImageStrict(byte[] bytes) throws IOException {
        try (ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (iis == null) throw new IOException("Não foi possível criar ImageInputStream.");
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (!readers.hasNext()) throw new IOException("Formato de imagem não suportado.");
            ImageReader reader = readers.next();
            try {
                reader.setInput(iis, true, true);
                BufferedImage img = reader.read(0);
                if (img == null) throw new IOException("Falha ao decodificar a imagem.");
                return ensureBufferedRgb(img);
            } finally {
                reader.dispose();
            }
        }
    }

    private BufferedImage ensureBufferedRgb(BufferedImage img) {
        if (img.getType() == BufferedImage.TYPE_INT_RGB) return img;
        BufferedImage copy = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = copy.createGraphics();
        try { g.drawImage(img, 0, 0, null); } finally { g.dispose(); }
        return copy;
    }

    private Path writePngTemp(BufferedImage img) throws IOException {
        Path tmp = Files.createTempFile(this.runtimeRootDir, "ocr-processed-", ".png");
        ImageIO.write(img, "png", tmp.toFile());
        return tmp;
    }

    private BufferedImage preprocessImageForOcr(BufferedImage image) throws IOException {
        Mat mat = bufferedImageToMat(image);
        Mat grayMat = new Mat();
        Imgproc.cvtColor(mat, grayMat, Imgproc.COLOR_BGR2GRAY);
        Mat blurredMat = new Mat();
        Imgproc.GaussianBlur(grayMat, blurredMat, new Size(3, 3), 0);
        Mat threshMat = new Mat();
        Imgproc.adaptiveThreshold(blurredMat, threshMat, 255, Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY, 11, 2);
        log.info("Pré-processamento da imagem concluído.");
        return matToBufferedImage(threshMat);
    }

    private Mat bufferedImageToMat(BufferedImage bi) {
        BufferedImage bgrImage = new BufferedImage(bi.getWidth(), bi.getHeight(), BufferedImage.TYPE_3BYTE_BGR);
        bgrImage.getGraphics().drawImage(bi, 0, 0, null);
        byte[] data = ((java.awt.image.DataBufferByte) bgrImage.getRaster().getDataBuffer()).getData();
        Mat mat = new Mat(bi.getHeight(), bi.getWidth(), org.opencv.core.CvType.CV_8UC3);
        mat.put(0, 0, data);
        return mat;
    }

    private BufferedImage matToBufferedImage(Mat mat) throws IOException {
        Path tmp = Files.createTempFile(this.runtimeRootDir, "mat-to-img-", ".png");
        Imgcodecs.imwrite(tmp.toString(), mat);
        BufferedImage image = ImageIO.read(tmp.toFile());
        Files.delete(tmp);
        return image;
    }
}