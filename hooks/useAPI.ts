// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth'; // Suponiendo que tienes un hook de autenticación
import { API_CONFIG } from '../config/config';

export function useApi() {
  const { token } = useAuth(); // Obtiene el token del contexto de autenticación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Error HTTP ${response.status}` }));
          throw new Error(errorData.message || `Error en la petición`);
        }
        
        // Si el body está vacío, devuelve null en lugar de fallar al parsear JSON
        const text = await response.text();
        return text ? JSON.parse(text).data : null;

      } catch (err: any) {
        setError(err.message || 'Ha ocurrido un error inesperado');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { request, loading, error };
}