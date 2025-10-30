/**
 * Cache System - Index
 * Exporta todas as funcionalidades de cache de forma organizada
 */

// Exportar funções principais do cache
export {
  fetchWithCache,
  fetchWithRevalidation,
  getFromCache,
  setCache,
  invalidateCacheByTag,
  invalidateCacheByKey,
  clearCache,
  getCacheStats,
  CACHE_CONFIG
} from './cache';

// Exportar hooks personalizados
export {
  useCache,
  useDashboardCache,
  useRelatoriosCache,
  useMapasCache,
  useEntidadesCache,
  useNotificacoesCache
} from './useCache';

// Exportar tipos
export type {
  CacheConfig,
  CacheEntry
} from './cache';

export type {
  UseCacheOptions,
  UseCacheReturn
} from './useCache';


