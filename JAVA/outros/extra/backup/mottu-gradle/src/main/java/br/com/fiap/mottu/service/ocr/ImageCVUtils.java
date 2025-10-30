package br.com.fiap.mottu.service.ocr;

import org.opencv.core.CvType;
import org.opencv.core.Mat;

import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;

/**
 * Utilitários mínimos para converter entre BufferedImage e Mat.
 * Mantém BGR de forma compatível com o OpenCV.
 */
public final class ImageCVUtils {

    private ImageCVUtils() {}

    public static Mat bufferedToMat(BufferedImage bi) {
        // garante formato 3 canais
        BufferedImage img = new BufferedImage(bi.getWidth(), bi.getHeight(), BufferedImage.TYPE_3BYTE_BGR);
        img.getGraphics().drawImage(bi, 0, 0, null);

        byte[] data = ((DataBufferByte) img.getRaster().getDataBuffer()).getData();
        Mat mat = new Mat(img.getHeight(), img.getWidth(), CvType.CV_8UC3);
        mat.put(0, 0, data);
        return mat;
    }
}
