/**
 * Hook personalizado para cache inteligente
 * Facilita o uso do sistema de cache em componentes React
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchWithCache, fetchWithRevalidation, invalidateCacheByTag, CACHE_CONFIG } from '../utils/cache';

export interface UseCacheOptions {
  category: keyof typeof CACHE_CONFIG;
  params?: Record<string, any>;
  enabled?: boolean;
  revalidateOnMount?: boolean;
}

export interface UseCacheReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  invalidateByTag: (tag: string) => void;
}

/**
 * Hook para buscar dados com cache inteligente
 */
export function useCache<T>(
  url: string,
  options: UseCacheOptions
): UseCacheReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRevalidate = false) => {
    if (!options.enabled) return;

    try {
      setLoading(true);
      setError(null);

      const fetchFunction = forceRevalidate ? fetchWithRevalidation : fetchWithCache;
      const result = await fetchFunction<T>(url, options.category, options.params);
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, [url, options.category, options.params, options.enabled]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  
  const invalidate = useCallback(() => {
    setData(null);
  }, []);
  
  const invalidateByTag = useCallback((tag: string) => {
    invalidateCacheByTag(tag);
    setData(null);
  }, []);

  useEffect(() => {
    fetchData(options.revalidateOnMount);
  }, [fetchData, options.revalidateOnMount]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    invalidateByTag
  };
}

/**
 * Hook para dados de dashboard com cache otimizado
 */
export function useDashboardCache<T>(endpoint: string, params?: Record<string, any>) {
  return useCache<T>(`/api/dashboard/${endpoint}`, {
    category: 'dashboard',
    params,
    enabled: true,
    revalidateOnMount: true
  });
}

/**
 * Hook para relatórios com cache de médio prazo
 */
export function useRelatoriosCache<T>(endpoint: string, params?: Record<string, any>) {
  return useCache<T>(`/api/relatorios/${endpoint}`, {
    category: 'relatorios',
    params,
    enabled: true,
    revalidateOnMount: false
  });
}

/**
 * Hook para mapas com cache espacial
 */
export function useMapasCache<T>(endpoint: string, params?: Record<string, any>) {
  return useCache<T>(`/api/${endpoint}`, {
    category: 'mapas',
    params,
    enabled: true,
    revalidateOnMount: true
  });
}

/**
 * Hook para entidades (CRUD) com cache de curto prazo
 */
export function useEntidadesCache<T>(endpoint: string, params?: Record<string, any>) {
  return useCache<T>(`/api/${endpoint}`, {
    category: 'entidades',
    params,
    enabled: true,
    revalidateOnMount: false
  });
}

/**
 * Hook para notificações com cache em tempo real
 */
export function useNotificacoesCache<T>(endpoint: string, params?: Record<string, any>) {
  return useCache<T>(`/api/${endpoint}`, {
    category: 'notificacoes',
    params,
    enabled: true,
    revalidateOnMount: true
  });
}
