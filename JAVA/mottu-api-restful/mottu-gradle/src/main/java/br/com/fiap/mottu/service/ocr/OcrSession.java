// mottu-gradle/src/main/java/br/com/fiap/mottu/service/ocr/OcrSession.java

package br.com.fiap.mottu.service.ocr;

import lombok.Data;

@Data
public class OcrSession {
    public enum Status {
        PENDING, // Aguardando a imagem do celular
        PROCESSING, // Processando a imagem no backend
        COMPLETED, // Placa reconhecida com sucesso
        ERROR // Ocorreu um erro
    }

    private final String id;
    private Status status = Status.PENDING;
    private String recognizedPlate;
    private String errorMessage;
}