package br.com.radarmottu.ui.common;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class PlateExtractor {

    // Regex para o padrão Mercosul LLLNLNN
    private static final Pattern mercosulRegex = Pattern.compile("^[A-Z]{3}\\d[A-Z]\\d{2}$");

    // Mapas para correção de caracteres
    private static final Map<Character, Character> correcaoParaLetra = new HashMap<>();
    private static final Map<Character, Character> correcaoParaNumero = new HashMap<>();

    static {
        correcaoParaLetra.put('0', 'O');
        correcaoParaLetra.put('1', 'I');
        correcaoParaLetra.put('8', 'B');
        correcaoParaLetra.put('5', 'S');
        correcaoParaLetra.put('2', 'Z');

        correcaoParaNumero.put('O', '0');
        correcaoParaNumero.put('I', '1');
        correcaoParaNumero.put('B', '8');
        correcaoParaNumero.put('S', '5');
        correcaoParaNumero.put('Z', '2');
        correcaoParaNumero.put('G', '0');
    }

    public static String extractPlate(String fullText) {
        if (fullText == null || fullText.isEmpty()) {
            return null;
        }

        // 1. Limpeza total: Remove espaços e quebras de linha
        String textoLimpo = fullText.replaceAll("\\s", "").toUpperCase();

        // 2. Janela deslizante de 7 caracteres
        for (int i = 0; i <= textoLimpo.length() - 7; i++) {
            String candidato = textoLimpo.substring(i, i + 7);

            // Tentativa 1: Checar o candidato original
            if (mercosulRegex.matcher(candidato).matches()) {
                return candidato;
            }

            // Tentativa 2: Aplicar correções
            char[] chars = candidato.toCharArray();

            // Posições 0, 1, 2: Deve ser Letra
            for (int j : new int[]{0, 1, 2}) {
                if (Character.isDigit(chars[j]) && correcaoParaLetra.containsKey(chars[j])) {
                    chars[j] = correcaoParaLetra.get(chars[j]);
                }
            }
            // Posição 3: Deve ser Número
            if (Character.isLetter(chars[3]) && correcaoParaNumero.containsKey(chars[3])) {
                chars[3] = correcaoParaNumero.get(chars[3]);
            }
            // Posição 4: Deve ser Letra
            if (Character.isDigit(chars[4]) && correcaoParaLetra.containsKey(chars[4])) {
                chars[4] = correcaoParaLetra.get(chars[4]);
            }
            // Posições 5, 6: Deve ser Número
            for (int j : new int[]{5, 6}) {
                if (Character.isLetter(chars[j]) && correcaoParaNumero.containsKey(chars[j])) {
                    chars[j] = correcaoParaNumero.get(chars[j]);
                }
            }

            String placaCorrigida = new String(chars);
            if (mercosulRegex.matcher(placaCorrigida).matches()) {
                return placaCorrigida;
            }
        }

        return null; // Nenhuma placa encontrada
    }
}