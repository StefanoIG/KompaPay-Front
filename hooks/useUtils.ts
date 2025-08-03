import { useCallback, useEffect, useState } from 'react';
import { APP_CONFIG, ENDPOINTS } from '../config/config';
import { storage } from './storage';
import {
    APIResponse,
    AuditLog,
    Gasto,
    ExpenseValidationData,
    ValidationResult,
    SplitCalculation,
    DebtCalculation
} from '@/config/config';
import { useApi } from './useAPI';

// Hook para utilidades generales
export const useUtils = () => {
  const { get } = useApi();

  // Formatear números como moneda
  const formatCurrency = useCallback((amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }, []);

  // Formatear fechas
  const formatDate = useCallback((dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    const date = new Date(dateString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options || defaultOptions);
  }, []);

  // Formatear fecha y hora
  const formatDateTime = useCallback((dateString: string): string => {
    return formatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [formatDate]);

  // Validar email
  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Generar ID único
  const generateUniqueId = useCallback((): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Debounce para búsquedas
  const useDebounce = useCallback((value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }, []);

  // Calcular dividir gastos equitativamente
  const calculateEqualSplit = useCallback((
    totalAmount: number,
    participantCount: number
  ): SplitCalculation => {
    const amountPerPerson = Math.floor((totalAmount * 100) / participantCount) / 100;
    const remainder = totalAmount - (amountPerPerson * participantCount);
    
    return {
      amountPerPerson,
      remainder: Math.round(remainder * 100) / 100,
    };
  }, []);

  // Calcular deudas entre usuarios
  const calculateDebts = useCallback((expenses: Gasto[], userId: string): DebtCalculation => {
    const debts = new Map<string, number>();

    expenses.forEach(expense => {
      if (expense.participantes && expense.participantes.length > 0) {
        // Usar monto_total si está disponible, si no usar monto
        const totalAmount = expense.monto_total || expense.monto || 0;
        
        expense.participantes.forEach(participant => {
          // Verificar que el participante no sea quien pagó
          const participantUserId = participant.usuario_id || participant.usuario?.id;
          const payerId = expense.pagador?.id || expense.pagado_por;
          
          if (participantUserId && participantUserId !== payerId) {
            // Usar monto_proporcional si está disponible, si no dividir equitativamente
            const shareAmount = participant.monto_proporcional || 
                               (totalAmount / expense.participantes.length);
            
            const key = `${participantUserId}-${payerId}`;
            debts.set(key, (debts.get(key) || 0) + shareAmount);
          }
        });
      }
    });

    const owes: { to: string; amount: number }[] = [];
    const owedBy: { from: string; amount: number }[] = [];

    debts.forEach((amount, key) => {
      const [debtorId, creditorId] = key.split('-');
      
      if (debtorId === userId) {
        owes.push({ to: creditorId, amount: Math.round(amount * 100) / 100 });
      } else if (creditorId === userId) {
        owedBy.push({ from: debtorId, amount: Math.round(amount * 100) / 100 });
      }
    });

    return { owes, owedBy };
  }, []);

  // Validar datos de gasto
  const validateExpenseData = useCallback((data: ExpenseValidationData): ValidationResult => {
    const errors: string[] = [];

    if (!data.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    }

    if (!data.monto || data.monto <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (!data.categoria?.trim()) {
      errors.push('La categoría es requerida');
    }

    if (!data.participantes || data.participantes.length === 0) {
      errors.push('Debe haber al menos un participante');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    isValidEmail,
    generateUniqueId,
    calculateEqualSplit,
    calculateDebts,
    validateExpenseData,
  };
};

// Hook para debounce (separado del hook principal)
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para gestión de caché local
export const useCache = () => {
  const [cacheState, setCacheState] = useState<Map<string, { data: any; timestamp: number }>>(new Map());

  // Guardar en caché
  const setCacheData = useCallback(async (key: string, data: any): Promise<void> => {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };

    setCacheState(prev => new Map(prev.set(key, cacheItem)));
    
    try {
      await storage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error guardando en caché:', error);
    }
  }, []);

  // Obtener del caché
  const getCacheData = useCallback(async (key: string): Promise<any | null> => {
    // Primero verificar en memoria
    const memoryItem = cacheState.get(key);
    if (memoryItem) {
      const isExpired = Date.now() - memoryItem.timestamp > APP_CONFIG.CACHE_DURATION;
      if (!isExpired) {
        return memoryItem.data;
      }
    }

    // Verificar en storage
    try {
      const cachedItem = await storage.getItem(`cache_${key}`);
      if (cachedItem) {
        const parsed = JSON.parse(cachedItem);
        const isExpired = Date.now() - parsed.timestamp > APP_CONFIG.CACHE_DURATION;
        
        if (!isExpired) {
          // Actualizar caché en memoria
          setCacheState(prev => new Map(prev.set(key, parsed)));
          return parsed.data;
        } else {
          // Limpiar caché expirado
          await storage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.error('Error leyendo caché:', error);
    }

    return null;
  }, [cacheState]);

  // Limpiar caché
  const clearCacheData = useCallback(async (key?: string): Promise<void> => {
    if (key) {
      setCacheState(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      
      try {
        await storage.removeItem(`cache_${key}`);
      } catch (error) {
        console.error('Error limpiando caché:', error);
      }
    } else {
      // Limpiar todo el caché
      setCacheState(new Map());
      
      try {
        const keys = await storage.getAllKeys();
        const cacheKeys = keys.filter((k: string) => k.startsWith('cache_'));
        await storage.multiRemove(cacheKeys);
      } catch (error) {
        console.error('Error limpiando todo el caché:', error);
      }
    }
  }, []);

  // Verificar si existe en caché
  const hasCacheData = useCallback(async (key: string): Promise<boolean> => {
    const cachedData = await getCacheData(key);
    return cachedData !== null;
  }, [getCacheData]);

  return {
    setCache: setCacheData,
    getCache: getCacheData,
    clearCache: clearCacheData,
    hasCache: hasCacheData,
  };
};

// Hook para logs de auditoría
export const useAudit = () => {
  const { get } = useApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener logs del usuario
  const fetchUserLogs = useCallback(async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await get<{
        data: AuditLog[];
        current_page: number;
        last_page: number;
      }>(`${ENDPOINTS.AUDIT.USER_LOGS}?page=${page}`);

      if (response) {
        setLogs(page === 1 ? response.data : [...logs, ...response.data]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar logs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [get, logs]);

  // Obtener logs de un grupo
  const fetchGroupLogs = useCallback(async (
    groupId: string,
    page: number = 1
  ): Promise<AuditLog[]> => {
    try {
      const endpoint = ENDPOINTS.AUDIT.GROUP_LOGS.replace('{grupoId}', groupId);
      const response = await get<{
        data: AuditLog[];
        current_page: number;
        last_page: number;
      }>(`${endpoint}?page=${page}`);

      if (response) {
        return response.data;
      }
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar logs del grupo';
      throw new Error(errorMessage);
    }
  }, [get]);

  return {
    logs,
    loading,
    error,
    fetchUserLogs,
    fetchGroupLogs,
  };
};
