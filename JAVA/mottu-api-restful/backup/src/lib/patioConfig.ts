/**
 * Configuração dos Pátios
 * Este arquivo centraliza os IDs e informações dos pátios para evitar problemas de hardcoding
 */

export interface PatioConfig {
  id: number;
  nome: string;
  prefixos: string[];
  mapaParam: string;
}

export const PATIOS_CONFIG: PatioConfig[] = [
  {
    id: 2,
    nome: "Pátio Mottu Guarulhos",
    prefixos: ["B", "GRU", "Gru"],
    mapaParam: "guarulhos"
  },
  {
    id: 13,
    nome: "Pátio Mottu Limão", 
    prefixos: ["L", "LIM", "LIMAO"],
    mapaParam: "limao"
  }
];

/**
 * Função para determinar o pátio baseado no nome do box
 */
export function getPatioByBoxName(boxName: string): PatioConfig | null {
  for (const patio of PATIOS_CONFIG) {
    if (patio.prefixos.some(prefixo => boxName.startsWith(prefixo))) {
      return patio;
    }
  }
  return null;
}

/**
 * Função para obter pátio por ID
 */
export function getPatioById(id: number): PatioConfig | null {
  return PATIOS_CONFIG.find(patio => patio.id === id) || null;
}

/**
 * Função para obter pátio por nome
 */
export function getPatioByName(nome: string): PatioConfig | null {
  return PATIOS_CONFIG.find(patio => 
    patio.nome.toLowerCase().includes(nome.toLowerCase()) ||
    patio.mapaParam.toLowerCase().includes(nome.toLowerCase())
  ) || null;
}

/**
 * Função para obter URL do mapa baseado no pátio
 */
export function getMapaUrl(patio: PatioConfig): string {
  return `/mapa-2d?mapa=${patio.mapaParam}`;
}
