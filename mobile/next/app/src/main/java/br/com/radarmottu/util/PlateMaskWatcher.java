package br.com.radarmottu.util;

import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;

public class PlateMaskWatcher implements TextWatcher {

    private final EditText editText;
    private boolean isUpdating = false;

    public PlateMaskWatcher(EditText editText) {
        this.editText = editText;
    }

    @Override
    public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {}

    @Override
    public void afterTextChanged(Editable s) {
        if (isUpdating) {
            return;
        }

        isUpdating = true;

        // Remove qualquer caractere que não seja letra ou número
        String cleanString = s.toString().replaceAll("[^a-zA-Z0-9]", "").toUpperCase();

        // Aplica a lógica da máscara Mercosul (LLLNLNN)
        StringBuilder formatted = new StringBuilder();
        int len = cleanString.length();

        for (int i = 0; i < len; i++) {
            char c = cleanString.charAt(i);
            if (i < 3) { // As primeiras 3 são letras
                if (Character.isLetter(c)) {
                    formatted.append(c);
                }
            } else if (i == 3) { // A quarta é um número
                if (Character.isDigit(c)) {
                    formatted.append(c);
                }
            } else if (i == 4) { // A quinta é uma letra
                if (Character.isLetter(c)) {
                    formatted.append(c);
                }
            } else if (i < 7) { // As duas últimas são números
                if (Character.isDigit(c)) {
                    formatted.append(c);
                }
            }
        }

        editText.setText(formatted.toString());
        editText.setSelection(formatted.length());

        isUpdating = false;
    }
}
