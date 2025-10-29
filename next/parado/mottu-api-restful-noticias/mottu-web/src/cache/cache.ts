/**
 * Sistema de Cache Inteligente para Frontend
 * Implementa cache por categoria com TTL e invalidação automática
 */

export interface CacheConfig {
  revalidate: number; // TTL em segundos
  tags: string[];      // Tags para invalidação
  staleWhileRevalidate?: boolean; // Permitir dados stale
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

// Configurações de cache por categoria
export const CACHE_CONFIG: Record<string, CacheConfig> = {
  // Dashboard - dados que mudam frequentemente
  dashboard: {
    revalidate: 30, // 30 segundos
    tags: ['dashboard', 'ocupacao'],
    staleWhileRevalidate: true
  },
  
  // Relatórios - dados que mudam menos frequentemente
  relatorios: {
    revalidate: 300, // 5 minutos
    tags: ['relatorios', 'analytics'],
    staleWhileRevalidate: true
  },
  
  // Mapas - dados espaciais
  mapas: {
    revalidate: 60, // 1 minuto
    tags: ['mapas', 'vagas'],
    staleWhileRevalidate: true
  },
  
  // Dados de entidades (clientes, veículos, etc.)
  entidades: {
    revalidate: 120, // 2 minutos
    tags: ['entidades', 'crud'],
    staleWhileRevalidate: true
  },
  
  // Notificações - dados em tempo real
  notificacoes: {
    revalidate: 10, // 10 segundos
    tags: ['notificacoes', 'sistema'],
    staleWhileRevalidate: false
  },
  
  // Dados estáticos (configurações, etc.)
  estaticos: {
    revalidate: 3600, // 1 hora
    tags: ['estaticos', 'config'],
    staleWhileRevalidate: true
  }
};

// Cache em memória (Map)
const cache = new Map<string, CacheEntry<any>>();

/**
 * Gera chave de cache baseada na URL e parâmetros
 */
function generateCacheKey(url: string, params?: Record<string, any>): string {
  const urlObj = new URL(url, window.location.origin);
  
  // Adicionar parâmetros à chave
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
 * Verifica se um cache entry ainda é válido
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  const now = Date.now();
  return (now - entry.timestamp) < entry.ttl;
}

/**
 * Busca dados do cache
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  if (!isCacheValid(entry)) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Armazena dados no cache
 */
export function setCache<T>(key: string, data: T, config: CacheConfig): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl: config.revalidate * 1000, // Converter para ms
    tags: config.tags
  };
  
  cache.set(key, entry);
}

/**
 * Invalida cache por tag
 */
export function invalidateCacheByTag(tag: string): void {
  for (const [key, entry] of cache.entries()) {
    if (entry.tags.includes(tag)) {
      cache.delete(key);
    }
  }
}

/**
 * Invalida cache por chave
 */
export function invalidateCacheByKey(key: string): void {
  cache.delete(key);
}

/**
 * Limpa todo o cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Retorna estatísticas do cache
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const entry of cache.values()) {
    if (isCacheValid(entry)) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }
  
  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    hitRate: validEntries / Math.max(cache.size, 1)
  };
}

/**
 * Função principal de fetch com cache inteligente
 */
export async function fetchWithCache<T>(
  url: string,
  category: keyof typeof CACHE_CONFIG,
  params?: Record<string, any>,
  options: RequestInit = {}
): Promise<T> {
  const config = CACHE_CONFIG[category];
  const cacheKey = generateCacheKey(url, params);
  
  // Tentar buscar do cache primeiro
  const cachedData = getFromCache<T>(cacheKey);
  if (cachedData) {
    console.log(`🎯 Cache HIT para ${category}:`, cacheKey);
    return cachedData;
  }
  
  console.log(`🔄 Cache MISS para ${category}:`, cacheKey);
  
  // Fazer requisição com configuração de cache do Next.js
  const fetchOptions: RequestInit = {
    ...options,
    next: {
      revalidate: config.revalidate,
      tags: config.tags
    }
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as T;
    
    // Armazenar no cache
    setCache(cacheKey, data, config);
    
    return data;
  } catch (error) {
    console.error(`❌ Erro ao buscar dados para ${category}:`, error);
    throw error;
  }
}

/**
 * Função para fetch com revalidação forçada
 */
export async function fetchWithRevalidation<T>(
  url: string,
  category: keyof typeof CACHE_CONFIG,
  params?: Record<string, any>,
  options: RequestInit = {}
): Promise<T> {
  const config = CACHE_CONFIG[category];
  const cacheKey = generateCacheKey(url, params);
  
  // Invalidar cache existente
  invalidateCacheByKey(cacheKey);
  
  // Fazer requisição sem cache
  const fetchOptions: RequestInit = {
    ...options,
    cache: 'no-store'
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as T;
    
    // Armazenar no cache
    setCache(cacheKey, data, config);
    
    return data;
  } catch (error) {
    console.error(`❌ Erro ao buscar dados com revalidação para ${category}:`, error);
    throw error;
  }
}
