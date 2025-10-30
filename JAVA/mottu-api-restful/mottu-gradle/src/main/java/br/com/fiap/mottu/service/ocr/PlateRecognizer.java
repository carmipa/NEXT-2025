package br.com.fiap.mottu.service.ocr;

/**
 * Contrato simples para reconhecedores de placa.
 * Implementações devem:
 *  - Marcar a sessão como PROCESSING ao iniciar
 *  - Atualizar a sessão com COMPLETED + plate OU ERROR + mensagem
 *  - Executar o processamento de forma assíncrona (não bloquear o controller)
 */
public interface PlateRecognizer {

    /**
     * Dispara o reconhecimento da placa para a sessão informada.
     * A implementação deve retornar imediatamente e processar em background.
     *
     * @param sessionId  ID da sessão (gerenciado por OcrSessionManager)
     * @param imageBytes bytes da imagem enviada (JPEG/PNG, etc.)
     */
    void extractPlate(String sessionId, byte[] imageBytes);
}
