// src/hooks/useApi.ts

import { useState, useCallback } from 'react';
import { useAuthContext } from '../providers/AuthProvider'; // Usar el contexto correcto
import { API_CONFIG } from '@/config/config'; // Importación corregida

export function useApi() {
  const { token } = useAuthContext(); // Usar el contexto de autenticación correcto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        console.log('API Request:', url, options); // Para debugging

        const response = await fetch(url, {
          ...options,
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` }), // Solo agregar si hay token
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `Error HTTP ${response.status}`
          }));
          throw new Error(errorData.message || `Error en la petición: ${response.status}`);
        }

        // Si el body está vacío, devuelve null en lugar de fallar al parsear JSON
        const text = await response.text();
        if (!text) return null;

        const jsonData = JSON.parse(text);
        // Retorna data si existe, si no retorna todo el objeto
        return jsonData.data || jsonData;

      } catch (err: any) {
        console.error('API Error:', err); // Para debugging
        setError(err.message || 'Ha ocurrido un error inesperado');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Métodos de conveniencia para HTTP
  const get = useCallback(<T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }), [request]
  );

  const post = useCallback(<T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }), [request]
  );

  const put = useCallback(<T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }), [request]
  );

  const del = useCallback(<T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }), [request]
  );

  return {
    request,
    get,
    post,
    put,
    delete: del,
    loading,
    error,
    clearError: () => setError(null)
  };
}