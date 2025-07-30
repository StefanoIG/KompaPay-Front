// src/hooks/useSync.ts

import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useApi } from './useAPI';
import {
    OfflineAction,
    SyncConflicto,
    ResolveConflictRequest,
    SyncData,
    STORAGE_KEYS,
    ENDPOINTS
} from '../config/config';

// --- Hook 1: useOfflineQueue ---
/**
 * Gestiona la cola de acciones pendientes de sincronizar.
 * Se encarga de leer, escribir y modificar la cola en el almacenamiento seguro.
 */
export const useOfflineQueue = () => {
    const [actions, setActions] = useState<OfflineAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadActions = useCallback(async () => {
        setIsLoading(true);
        try {
            const actionsJson = await SecureStore.getItemAsync(STORAGE_KEYS.OFFLINE_ACTIONS);
            setActions(actionsJson ? JSON.parse(actionsJson) : []);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActions();
    }, [loadActions]);

    const saveActions = useCallback(async (updatedActions: OfflineAction[]) => {
        setActions(updatedActions);
        await SecureStore.setItemAsync(STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(updatedActions));
    }, []);

    const addAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
        const newAction: OfflineAction = {
            id: `offline_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...action
        };
        saveActions([...actions, newAction]);
    }, [actions, saveActions]);

    const clearQueue = useCallback(() => {
        saveActions([]);
    }, [saveActions]);

    return { actions, isLoading, addAction, clearQueue, hasPendingChanges: actions.length > 0 };
};

// --- Hook 2: useConflicts ---
/**
 * Gestiona la obtención y resolución de conflictos de sincronización.
 */
export const useConflicts = () => {
    const { request, loading, error } = useApi();
    const [conflicts, setConflicts] = useState<SyncConflicto[]>([]);

    const fetchConflicts = useCallback(async () => {
        const data = await request<SyncConflicto[]>(ENDPOINTS.SYNC.RESOLVE_CONFLICT);
        if (data) {
            setConflicts(data);
        }
    }, [request]);

    const resolveConflict = useCallback(async (conflictId: string, resolution: ResolveConflictRequest) => {
        const result = await request<any>(`${ENDPOINTS.SYNC.RESOLVE_CONFLICT}/${conflictId}`, {
            method: 'POST',
            body: JSON.stringify(resolution),
        });
        if (result) {
            setConflicts(prev => prev.filter(c => c.id !== conflictId));
        }
        return !!result;
    }, [request]);

    useEffect(() => {
        fetchConflicts();
    }, [fetchConflicts]);
    
    return { conflicts, loading, error, fetchConflicts, resolveConflict, hasConflicts: conflicts.length > 0 };
};


// --- Hook 3: useSyncManager ---
/**
 * Orquesta el proceso de sincronización completo, utilizando otros hooks y servicios.
 */
export const useSyncManager = () => {
    const { request, loading, error } = useApi();
    const { actions: offlineActions, clearQueue } = useOfflineQueue();
    const [lastSync, setLastSync] = useState<string | null>(null);

    const loadLastSync = useCallback(async () => {
        const time = await SecureStore.getItemAsync(STORAGE_KEYS.LAST_SYNC);
        setLastSync(time);
    }, []);

    const updateLastSync = useCallback(async () => {
        const now = new Date().toISOString();
        setLastSync(now);
        await SecureStore.setItemAsync(STORAGE_KEYS.LAST_SYNC, now);
    }, []);

    useEffect(() => {
        loadLastSync();
    }, [loadLastSync]);
    
    const performFullSync = useCallback(async () => {
        // 1. Enviar cambios locales al servidor
        if (offlineActions.length > 0) {
            await request(ENDPOINTS.SYNC.PUSH, {
                method: 'POST',
                body: JSON.stringify({ actions: offlineActions }),
            });
            // Si no hubo error, limpiamos la cola
            if (!error) {
                clearQueue();
            }
        }
        
        // 2. Traer cambios del servidor
        const params = lastSync ? `?since=${encodeURIComponent(lastSync)}` : '';
        const newData = await request<SyncData>(`${ENDPOINTS.SYNC.PULL}${params}`);
        
        // 3. Actualizar el timestamp si todo fue bien
        if (newData && !error) {
            await updateLastSync();
            // Aquí deberías procesar 'newData' y actualizar tu base de datos local o estado global
            console.log("Nuevos datos recibidos:", newData);
        }

        return { success: !!newData && !error, newData };

    }, [request, error, offlineActions, clearQueue, lastSync, updateLastSync]);

    return { loading, error, lastSync, performFullSync };
};