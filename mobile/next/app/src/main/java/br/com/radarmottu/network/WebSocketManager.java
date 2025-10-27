package br.com.radarmottu.network;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.gson.Gson;

import java.util.concurrent.TimeUnit;

import br.com.radarmottu.model.WebSocketMessage;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;

public class WebSocketManager {

    private static final String TAG = "WebSocketManager";
    // CORRIGIDO: Apontando para o endpoint WebSocket correto exposto pelo Nginx.
    private static final String WEBSOCKET_URL = "ws://72.61.219.15/radarmotu-api/ws";

    private OkHttpClient client;
    private WebSocket webSocket;
    private final WebSocketListener listener;
    private final Gson gson = new Gson();

    // Interface pública para callbacks
    public interface WebSocketListener {
        void onMessage(WebSocketMessage message);
        void onError(String error);
    }

    public WebSocketManager(WebSocketListener listener) {
        this.listener = listener;
        this.client = new OkHttpClient.Builder()
                .pingInterval(15, TimeUnit.SECONDS)
                .build();
    }

    public void start() {
        Request request = new Request.Builder().url(WEBSOCKET_URL).build();
        webSocket = client.newWebSocket(request, new SocketListener());
        Log.d(TAG, "Iniciando WebSocket: " + WEBSOCKET_URL);
    }

    public void stop() {
        if (webSocket != null) {
            webSocket.close(1000, "Cliente desconectando.");
        }
    }

    private class SocketListener extends okhttp3.WebSocketListener {
        @Override
        public void onOpen(@NonNull WebSocket webSocket, @NonNull Response response) {
            Log.d(TAG, "WebSocket conectado!");
        }

        @Override
        public void onMessage(@NonNull WebSocket webSocket, @NonNull String text) {
            try {
                WebSocketMessage message = gson.fromJson(text, WebSocketMessage.class);
                if (listener != null) {
                    listener.onMessage(message);
                }
            } catch (Exception e) {
                Log.e(TAG, "Erro ao processar mensagem do WebSocket", e);
                if (listener != null) {
                    listener.onError("Erro de deserialização: " + e.getMessage());
                }
            }
        }

        @Override
        public void onFailure(@NonNull WebSocket webSocket, @NonNull Throwable t, @Nullable Response response) {
            Log.e(TAG, "Falha no WebSocket", t);
            if (listener != null) {
                listener.onError(t.getMessage());
            }
        }

        @Override
        public void onClosing(@NonNull WebSocket webSocket, int code, @NonNull String reason) {
            webSocket.close(1000, null);
            Log.d(TAG, "WebSocket fechando: " + reason);
        }
    }
}
