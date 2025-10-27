package br.com.radarmottu.ui.common;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.SoundPool;
import android.os.Handler;
import android.os.Looper;
import android.util.Log; // ADICIONADO: Importação para a classe Log

import br.com.radarmottu.R;

public class SoundManager {

    // ADICIONADO: TAG para filtrar as mensagens no Logcat
    private static final String TAG = "SoundManager";

    private SoundPool soundPool;
    private int soundId;
    private boolean isLoaded = false;
    private boolean isPlaying = false;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable beeper;

    public SoundManager(Context context) {
        AudioAttributes attributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
        soundPool = new SoundPool.Builder().setAudioAttributes(attributes).setMaxStreams(1).build();

        // ADICIONADO: Log para saber que tentamos carregar o som
        Log.d(TAG, "Iniciando o carregamento do arquivo de som...");
        soundId = soundPool.load(context, R.raw.beep, 1);

        // MODIFICADO: Adicionamos logs para saber se o carregamento teve sucesso ou falhou
        soundPool.setOnLoadCompleteListener((sp, sampleId, status) -> {
            if (status == 0) {
                isLoaded = true;
                Log.d(TAG, "SUCESSO! Arquivo de som carregado.");
            } else {
                isLoaded = false;
                Log.e(TAG, "ERRO! Falha ao carregar o arquivo de som. Status: " + status);
            }
        });
    }

    public void startBeeping(float distance) {
        // ADICIONADO: Log para saber se o método foi chamado e qual o estado das variáveis
        Log.d(TAG, "startBeeping chamado. isLoaded=" + isLoaded + ", isPlaying=" + isPlaying);

        if (!isLoaded || isPlaying) return;
        isPlaying = true;

        beeper = new Runnable() {
            @Override
            public void run() {
                long delay = calculateDelay(distance);
                float pitch = calculatePitch(distance);
                soundPool.play(soundId, 1, 1, 0, 0, pitch);
                handler.postDelayed(this, delay);
            }
        };
        handler.post(beeper);
    }

    public void stopBeeping() {
        isPlaying = false;
        handler.removeCallbacksAndMessages(null);
    }

    public void release() {
        if (soundPool != null) {
            soundPool.release();
            soundPool = null;
        }
    }

    private long calculateDelay(float distance) {
        if (distance < 1.5) return 200;
        if (distance > 10) return 1500;
        return (long) (1500 - (1300 * (10 - distance) / 8.5));
    }

    private float calculatePitch(float distance) {
        if (distance < 1.5) return 1.8f;
        if (distance > 10) return 0.8f;
        return (float) (0.8 + (1.0 * (10 - distance) / 8.5));
    }
}