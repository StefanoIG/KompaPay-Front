// src/hooks/useCache.ts
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

// Duración de la caché en milisegundos (ej. 15 minutos)
const CACHE_DURATION = 15 * 60 * 1000;

/**
 * Hook de utilidad para gestionar una caché simple en AsyncStorage.
 * Permite guardar y recuperar datos con un tiempo de expiración.
 */
export const useCache = <T>() => {
    const getCachedItem = useCallback(async (key: string): Promise<T | null> => {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            if (!jsonValue) return null;

            const item: CacheItem<T> = JSON.parse(jsonValue);
            const isExpired = (Date.now() - item.timestamp) > CACHE_DURATION;

            if (isExpired) {
                await AsyncStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error(`Error getting cached item for key "${key}":`, error);
            return null;
        }
    }, []);

    const setCachedItem = useCallback(async (key: string, data: T): Promise<void> => {
        try {
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
            };
            const jsonValue = JSON.stringify(item);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error(`Error setting cached item for key "${key}":`, error);
        }
    }, []);

    return { getCachedItem, setCachedItem };
};