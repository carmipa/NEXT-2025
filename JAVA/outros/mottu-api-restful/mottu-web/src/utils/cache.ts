/**
 * Sistema de Cache Simples e Eficiente para Relatórios e Dashboard
 * Focado em performance para relatórios críticos
 */

// Cache em memória simples
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Configurações de TTL por tipo de dados
const CACHE_TTL = {
  dashboard: 30 * 1000,      // 30 segundos
  relatorios: 5 * 60 * 1000, // 5 minutos
  mapas: 60 * 1000,          // 1 minuto
  entidades: 2 * 60 * 1000,  // 2 minutos
  notificacoes: 10 * 1000,   // 10 segundos
} as const;

/**
 * Gera chave de cache baseada na URL
 */
function getCacheKey(url: string, params?: Record<string, any>): string {
  const urlObj = new URL(url, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.set(key, String(value));
      }
    });
  }
  return urlObj.toString();
}

/**
 * Verifica se cache ainda é válido
 */
function isCacheValid(entry: { data: any; timestamp: number; ttl: number }): boolean {
  return (Date.now() - entry.timestamp) < entry.ttl;
}

/**
 * Busca dados do cache
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || !isCacheValid(entry)) {
    if (entry) cache.delete(key); // Remove cache expirado
    return null;
  }
  return entry.data;
}

/**
 * Armazena dados no cache
 */
export function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

/**
 * Fetch com cache inteligente para relatórios
 */
export async function fetchWithCache<T>(
  url: string,
  type: keyof typeof CACHE_TTL,
  params?: Record<string, any>
): Promise<T> {
  const cacheKey = getCacheKey(url, params);
  const ttl = CACHE_TTL[type];
  
  // Tentar buscar do cache
  const cached = getFromCache<T>(cacheKey);
  if (cached) {
    console.log(`🎯 Cache HIT para ${type}:`, url);
    return cached;
  }
  
  console.log(`🔄 Cache MISS para ${type}:`, url);
  
  // Fazer requisição
  const response = await fetch(url, {
    next: {
      revalidate: Math.floor(ttl / 1000), // Converter para segundos
      tags: [type]
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json() as T;
  
  // Armazenar no cache
  setCache(cacheKey, data, ttl);
  
  return data;
}

/**
 * Fetch para dashboard (cache curto)
 */
export async function fetchDashboard<T>(url: string, params?: Record<string, any>): Promise<T> {
  return fetchWithCache<T>(url, 'dashboard', params);
}

/**
 * Fetch para relatórios (cache médio)
 */
export async function fetchRelatorios<T>(url: string, params?: Record<string, any>): Promise<T> {
  return fetchWithCache<T>(url, 'relatorios', params);
}

/**
 * Fetch para mapas (cache médio)
 */
export async function fetchMapas<T>(url: string, params?: Record<string, any>): Promise<T> {
  return fetchWithCache<T>(url, 'mapas', params);
}

/**
 * Invalida cache por tipo
 */
export function invalidateCache(type: keyof typeof CACHE_TTL): void {
  for (const [key, entry] of cache.entries()) {
    if (key.includes(type)) {
      cache.delete(key);
    }
  }
}

/**
 * Limpa todo o cache
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Estatísticas do cache
 */
export function getCacheStats() {
  const now = Date.now();
  let valid = 0;
  let expired = 0;
  
  for (const entry of cache.values()) {
    if (isCacheValid(entry)) {
      valid++;
    } else {
      expired++;
    }
  }
  
  return {
    total: cache.size,
    valid,
    expired,
    hitRate: valid / Math.max(cache.size, 1)
  };
}