package br.com.fiap.mottu.service.ocr;

import java.text.Normalizer;
import java.util.Collection;
import java.util.Comparator;
import java.util.Objects;

/**
 * Utilitários para limpeza, normalização (padrão Mercosul) e "fuzzy match" de placas.
 * Mantido no pacote service.ocr, seguindo o padrão do projeto.
 */
public final class PlateUtils {

    private PlateUtils() {}

    /** Remove acentos, espaços, traços e qualquer caractere não [A-Za-z0-9], e coloca em UPPERCASE. */
    public static String cleanRaw(String s) {
        if (s == null) return "";
        String nfd = Normalizer.normalize(s, Normalizer.Form.NFD);
        String noMarks = nfd.replaceAll("\\p{M}", "");
        return noMarks.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
    }

    /**
     * Normaliza para o formato Mercosul (LLLNLNN – 7 chars).
     * Faz mapeamento heurístico letra↔número por posição para corrigir confusões comuns do OCR.
     */
    public static String normalizeMercosul(String raw) {
        String s = cleanRaw(raw);
        if (s.length() < 7) return s; // retorna o que tiver; o chamador decide se aceita

        char[] a = s.toCharArray();
        // Posições: 0..2 (letras), 3 (número), 4 (letra), 5..6 (números)
        fixAsLetter(a, 0);
        fixAsLetter(a, 1);
        fixAsLetter(a, 2);
        fixAsDigit(a, 3);
        fixAsLetter(a, 4);
        fixAsDigit(a, 5);
        fixAsDigit(a, 6);

        String out = new String(a);
        return out.substring(0, 7);
    }

    private static void fixAsLetter(char[] a, int i) {
        if (i >= a.length) return;
        char c = a[i];
        // Se veio dígito parecido com letra, converte
        switch (c) {
            case '0': a[i] = 'O'; break;
            case '1': a[i] = 'I'; break; // ou 'L', preferimos I
            case '2': a[i] = 'Z'; break;
            case '5': a[i] = 'S'; break;
            case '6': a[i] = 'G'; break;
            case '8': a[i] = 'B'; break;
            case '4': a[i] = 'A'; break;
            case '7': a[i] = 'T'; break;
            default: a[i] = Character.toUpperCase(c);
        }
    }

    private static void fixAsDigit(char[] a, int i) {
        if (i >= a.length) return;
        char c = Character.toUpperCase(a[i]);
        switch (c) {
            case 'O': case 'Q': case 'D': a[i] = '0'; break;
            case 'I': case 'L': a[i] = '1'; break;
            case 'Z': a[i] = '2'; break;
            case 'S': a[i] = '5'; break;
            case 'B': a[i] = '8'; break;
            case 'G': a[i] = '6'; break;
            case 'A': a[i] = '4'; break; // menos comum, mas ajuda
            case 'T': a[i] = '7'; break;
            default: a[i] = c;
        }
        if (!Character.isDigit(a[i])) {
            // fallback: se ainda ficou letra, força para 0
            a[i] = '0';
        }
    }

    /** Distância de Levenshtein iterativa. */
    public static int levenshtein(String a, String b) {
        if (Objects.equals(a, b)) return 0;
        if (a == null || a.isEmpty()) return b == null ? 0 : b.length();
        if (b == null || b.isEmpty()) return a.length();

        int[] prev = new int[b.length() + 1];
        int[] curr = new int[b.length() + 1];

        for (int j = 0; j <= b.length(); j++) prev[j] = j;

        for (int i = 1; i <= a.length(); i++) {
            curr[0] = i;
            char ca = a.charAt(i - 1);
            for (int j = 1; j <= b.length(); j++) {
                int cost = (ca == b.charAt(j - 1)) ? 0 : 1;
                curr[j] = Math.min(
                        Math.min(curr[j - 1] + 1, prev[j] + 1),
                        prev[j - 1] + cost
                );
            }
            int[] tmp = prev; prev = curr; curr = tmp;
        }
        return prev[b.length()];
    }

    /**
     * Retorna o melhor match (menor distância) até maxDistance ou null.
     * A coleção pode ser a lista de placas do repositório já normalizadas.
     */
    public static String bestCandidate(Collection<String> knownPlates, String candidate, int maxDistance) {
        if (candidate == null) return null;
        return knownPlates.stream()
                .min(Comparator.comparingInt(p -> levenshtein(p, candidate)))
                .filter(best -> levenshtein(best, candidate) <= maxDistance)
                .orElse(null);
    }
}
