/**
 * Utilitários para validação de placas no padrão Mercosul
 */

/**
 * Valida se uma placa está no formato Mercosul (ABC1D23)
 * @param plate - A placa a ser validada
 * @returns true se a placa está no formato Mercosul válido
 */
export const isValidMercosulPlate = (plate: string): boolean => {
    if (!plate) return false;
    
    const cleanPlate = plate.trim().toUpperCase();
    
    // Formato Mercosul: ABC1D23 (7 caracteres)
    // 3 letras + 1 número + 1 letra + 2 números
    const mercosulFormatRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    
    return mercosulFormatRegex.test(cleanPlate);
};

/**
 * Normaliza uma placa para o formato padrão (maiúscula, sem espaços)
 * @param plate - A placa a ser normalizada
 * @returns A placa normalizada ou string vazia se inválida
 */
export const normalizePlate = (plate: string): string => {
    if (!plate) return '';
    
    const cleanPlate = plate.trim().toUpperCase();
    
    if (isValidMercosulPlate(cleanPlate)) {
        return cleanPlate;
    }
    
    return '';
};

/**
 * Mensagem de erro padrão para placas inválidas
 */
export const INVALID_PLATE_MESSAGE = 'A placa deve seguir o padrão Mercosul (ABC1D23) com 7 caracteres.';

/**
 * Valida e retorna mensagem de erro se a placa for inválida
 * @param plate - A placa a ser validada
 * @returns string vazia se válida, mensagem de erro se inválida
 */
export const validatePlate = (plate: string): string => {
    if (!plate) return 'A placa é obrigatória.';
    if (!isValidMercosulPlate(plate)) return INVALID_PLATE_MESSAGE;
    return '';
};






