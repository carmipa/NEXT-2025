// mottu-gradle/src/main/java/br/com/fiap/mottu/service/ocr/OcrSessionManager.java

package br.com.fiap.mottu.service.ocr;

import org.springframework.stereotype.Component;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OcrSessionManager {
    private final ConcurrentHashMap<String, OcrSession> sessions = new ConcurrentHashMap<>();

    public OcrSession createSession() {
        String sessionId = UUID.randomUUID().toString();
        OcrSession session = new OcrSession(sessionId);
        sessions.put(sessionId, session);
        return session;
    }

    public Optional<OcrSession> getSession(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }

    public void updateSessionSuccess(String sessionId, String plate) {
        Optional.ofNullable(sessions.get(sessionId)).ifPresent(session -> {
            session.setStatus(OcrSession.Status.COMPLETED);
            session.setRecognizedPlate(plate);
        });
    }

    public void updateSessionError(String sessionId, String errorMessage) {
        Optional.ofNullable(sessions.get(sessionId)).ifPresent(session -> {
            session.setStatus(OcrSession.Status.ERROR);
            session.setErrorMessage(errorMessage);
        });
    }

    public void setSessionProcessing(String sessionId) {
        Optional.ofNullable(sessions.get(sessionId)).ifPresent(session -> {
            session.setStatus(OcrSession.Status.PROCESSING);
        });
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }
}