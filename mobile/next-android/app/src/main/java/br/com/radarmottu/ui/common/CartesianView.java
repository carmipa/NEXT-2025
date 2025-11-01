package br.com.radarmottu.ui.common;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.view.View;
import android.view.animation.LinearInterpolator;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.List;

import br.com.radarmottu.model.Anchor;

public class CartesianView extends View {

    private Paint backgroundPaint, gridPaint, axisPaint, objectPaint, anchorPaint, textPaint, scannerPaint;
    private float objectX = -1000, objectY = -1000;
    private List<Anchor> anchors = new ArrayList<>();
    private float scale = 50f;

    // Variáveis de Animação
    private ValueAnimator scannerAnimator;
    private float scanLineX = 0f;

    public CartesianView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    private void init() {
        int colorGridAndAxis = Color.parseColor("#0C8B4E");
        int colorObject = Color.WHITE;
        int colorAnchor = Color.parseColor("#00BCD4");

        backgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        backgroundPaint.setColor(Color.parseColor("#363636"));
        backgroundPaint.setStyle(Paint.Style.FILL);

        gridPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        gridPaint.setColor(colorGridAndAxis);
        gridPaint.setStrokeWidth(1f);
        gridPaint.setAlpha(100);

        axisPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        axisPaint.setColor(colorGridAndAxis);
        axisPaint.setStrokeWidth(3f);

        objectPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        objectPaint.setColor(colorObject);
        objectPaint.setStyle(Paint.Style.FILL);

        anchorPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        anchorPaint.setColor(colorAnchor);
        anchorPaint.setStyle(Paint.Style.FILL);

        textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setColor(colorObject);
        textPaint.setTextSize(28f);
        textPaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));

        scannerPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        scannerPaint.setStyle(Paint.Style.FILL);
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        // Cria o gradiente quando o tamanho da view for conhecido
        Shader scannerShader = new LinearGradient(
                0, 0, 150, 0, // Largura do gradiente
                new int[]{Color.TRANSPARENT, Color.parseColor("#800C8B4E"), Color.parseColor("#FF0C8B4E")},
                new float[]{0f, 0.9f, 1f},
                Shader.TileMode.CLAMP);
        scannerPaint.setShader(scannerShader);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        int width = getWidth();
        int height = getHeight();
        float centerX = width / 2f;
        float centerY = height / 2f;

        canvas.drawRect(0, 0, width, height, backgroundPaint);

        // Desenha o efeito de scanner
        canvas.save();
        canvas.translate(scanLineX - 150, 0); // Move o canvas para a posição da linha
        canvas.drawRect(0, 0, 150, height, scannerPaint);
        canvas.restore();

        // Desenho da grade e eixos...
        for (float i = centerX; i < width; i += scale) canvas.drawLine(i, 0, i, height, gridPaint);
        for (float i = centerX; i > 0; i -= scale) canvas.drawLine(i, 0, i, height, gridPaint);
        for (float i = centerY; i < height; i += scale) canvas.drawLine(0, i, width, i, gridPaint);
        for (float i = centerY; i > 0; i -= scale) canvas.drawLine(0, i, width, i, gridPaint);
        canvas.drawLine(0, centerY, width, centerY, axisPaint);
        canvas.drawLine(centerX, 0, centerX, height, axisPaint);

        for (Anchor anchor : anchors) {
            float screenX = centerX + (anchor.getPosX() * scale);
            float screenY = centerY - (anchor.getPosY() * scale);
            canvas.drawCircle(screenX, screenY, 15f, anchorPaint);
            canvas.drawText(anchor.getLabel(), screenX + 20, screenY, textPaint);
        }

        if (objectX > -1000) {
            float screenX = centerX + (objectX * scale);
            float screenY = centerY - (objectY * scale);
            canvas.drawCircle(screenX, screenY, 20f, objectPaint);
        }
    }

    public void startAnimation() {
        if (scannerAnimator != null && scannerAnimator.isRunning()) return;
        scannerAnimator = ValueAnimator.ofFloat(0, getWidth());
        scannerAnimator.setDuration(4000);
        scannerAnimator.setRepeatCount(ValueAnimator.INFINITE);
        scannerAnimator.setInterpolator(new LinearInterpolator());
        scannerAnimator.addUpdateListener(animation -> {
            scanLineX = (float) animation.getAnimatedValue();
            invalidate();
        });
        scannerAnimator.start();
    }

    public void stopAnimation() {
        if (scannerAnimator != null) {
            scannerAnimator.cancel();
            scannerAnimator = null;
        }
    }

    public void setAnchors(List<Anchor> anchors) {
        this.anchors = anchors != null ? anchors : new ArrayList<>();
        postInvalidate();
    }

    public void setObjectPosition(float x, float y) {
        this.objectX = x;
        this.objectY = y;
        postInvalidate();
    }
}
