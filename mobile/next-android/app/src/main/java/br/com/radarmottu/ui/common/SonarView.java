package br.com.radarmottu.ui.common;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Shader;
import android.graphics.SweepGradient;
import android.util.AttributeSet;
import android.view.View;
import android.view.animation.LinearInterpolator;

import androidx.annotation.Nullable;

public class SonarView extends View {

    // --- Variáveis de Configuração ---
    private float metersToShow = 10.0f; // Raio do radar em metros

    // --- Pincéis de Desenho ---
    private Paint backgroundPaint;
    private Paint gridPaint;
    private Paint blipPaint;
    private Paint centerPaint;
    private Paint sweepPaint; // Pincel para a linha sólida
    private Paint sweepGradientPaint; // Pincel para a onda de luz (gradiente)

    // --- Variáveis de Animação ---
    private ValueAnimator sweepAnimator;
    private float sweepAngle = 0f; // Ângulo para a linha
    private Matrix gradientMatrix; // Matriz para girar o gradiente
    private Shader sweepGradientShader;

    // --- Variáveis de Posição ---
    private float tagX = -1;
    private float tagY = -1;

    // --- Construtores Obrigatórios ---
    public SonarView(Context context) { super(context); init(); }
    public SonarView(Context context, @Nullable AttributeSet attrs) { super(context, attrs); init(); }
    public SonarView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) { super(context, attrs, defStyleAttr); init(); }

    private void init() {
        // Pincel do fundo
        backgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        backgroundPaint.setColor(Color.parseColor("#363636"));
        backgroundPaint.setStyle(Paint.Style.FILL);

        // Pincel da grade circular
        gridPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        gridPaint.setColor(Color.parseColor("#0C8B4E"));
        gridPaint.setStyle(Paint.Style.STROKE);
        gridPaint.setStrokeWidth(2f);

        // Pincel do blip da tag
        blipPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        blipPaint.setColor(Color.WHITE);
        blipPaint.setStyle(Paint.Style.FILL);

        // Pincel do ponto central
        centerPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        centerPaint.setColor(Color.WHITE);
        centerPaint.setStyle(Paint.Style.FILL);

        // Pincel para a LINHA de varredura (sólida)
        sweepPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        sweepPaint.setColor(Color.parseColor("#0C8B4E")); // Cor primária sólida
        sweepPaint.setStrokeWidth(4f);

        // Pincel para a ONDA de luz (gradiente)
        sweepGradientPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        sweepGradientPaint.setStyle(Paint.Style.FILL);

        // Matriz que usaremos para girar o gradiente
        gradientMatrix = new Matrix();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        float width = getWidth();
        float height = getHeight();
        float centerX = width / 2;
        float centerY = height / 2;
        float maxRadius = Math.min(width, height) / 2;

        // Cria o gradiente na primeira vez que o onDraw é chamado
        if (sweepGradientShader == null) {
            sweepGradientShader = new SweepGradient(
                    centerX, centerY,
                    new int[]{Color.TRANSPARENT, Color.parseColor("#800C8B4E")},
                    new float[]{0.9f, 1.0f}
            );
            sweepGradientPaint.setShader(sweepGradientShader);
        }

        // --- Ordem de Desenho ---

        // 1. Fundo
        canvas.drawRect(0, 0, width, height, backgroundPaint);

        // 2. Onda de luz (Gradiente)
        canvas.drawCircle(centerX, centerY, maxRadius, sweepGradientPaint);

        // 3. Grade de círculos
        int circleCount = 4;
        for (int i = 1; i <= circleCount; i++) {
            float radius = maxRadius * i / circleCount;
            canvas.drawCircle(centerX, centerY, radius, gridPaint);
        }

        // 4. Crosshair (sua versão melhorada, contida no radar)
        canvas.drawLine(centerX, centerY - maxRadius, centerX, centerY + maxRadius, gridPaint);
        canvas.drawLine(centerX - maxRadius, centerY, centerX + maxRadius, centerY, gridPaint);

        // 5. Linha de varredura sólida
        float angleInRadians = (float) Math.toRadians(sweepAngle);
        float endX = centerX + (float) (maxRadius * Math.cos(angleInRadians));
        float endY = centerY + (float) (maxRadius * Math.sin(angleInRadians));
        canvas.drawLine(centerX, centerY, endX, endY, sweepPaint);

        // 6. Ponto central
        canvas.drawCircle(centerX, centerY, 10f, centerPaint);

        // 7. Blip da tag (sua versão melhorada, que fixa na borda)
        if (tagX != -1 && tagY != -1) {
            float distanceInMeters = (float) Math.sqrt(Math.pow(tagX, 2) + Math.pow(tagY, 2));
            float displayX, displayY;

            if (distanceInMeters > metersToShow) {
                float angle = (float) Math.atan2(tagY, tagX);
                displayX = centerX + (maxRadius * (float) Math.cos(angle));
                displayY = centerY + (maxRadius * (float) Math.sin(angle));
            } else {
                float pixelsPerMeter = maxRadius / metersToShow;
                displayX = centerX + (tagX * pixelsPerMeter);
                displayY = centerY + (tagY * pixelsPerMeter);
            }
            canvas.drawCircle(displayX, displayY, 15f, blipPaint);
        }
    }

    public void updateTagPosition(float x, float y) {
        this.tagX = x;
        this.tagY = y;
        invalidate();
    }

    public void startAnimation() {
        if (sweepAnimator != null && sweepAnimator.isRunning()) return;

        sweepAnimator = ValueAnimator.ofFloat(0, 360);
        sweepAnimator.setDuration(3000);
        sweepAnimator.setRepeatCount(ValueAnimator.INFINITE);
        sweepAnimator.setInterpolator(new LinearInterpolator());
        sweepAnimator.addUpdateListener(animation -> {
            float angle = (float) animation.getAnimatedValue();

            // Atualiza o ângulo para a linha sólida
            sweepAngle = angle;

            // Rotaciona o gradiente da onda de luz
            gradientMatrix.setRotate(angle, getWidth() / 2f, getHeight() / 2f);
            if (sweepGradientShader != null) {
                sweepGradientShader.setLocalMatrix(gradientMatrix);
            }

            // Força o redesenho
            invalidate();
        });
        sweepAnimator.start();
    }

    public void stopAnimation() {
        if (sweepAnimator != null) {
            sweepAnimator.cancel();
            sweepAnimator = null;
        }
    }
}