// src/hooks/useSync.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { secureStorage } from './secureStorage';
import { useApi } from './useAPI';
import { useNetworkStatus } from './useNetworkStatus';
import { useAuthContext } from '@/providers/AuthProvider';
import {
    OfflineAction,
    SyncConflicto,
    ResolveConflictRequest,
    SyncData,
    SyncStatus,
    STORAGE_KEYS,
    ENDPOINTS,
    APP_CONFIG
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
            const actionsJson = await secureStorage.getItemAsync(STORAGE_KEYS.OFFLINE_ACTIONS);
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
        await secureStorage.setItemAsync(STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(updatedActions));
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
        const time = await secureStorage.getItemAsync(STORAGE_KEYS.LAST_SYNC);
        setLastSync(time);
    }, []);

    const updateLastSync = useCallback(async () => {
        const now = new Date().toISOString();
        setLastSync(now);
        await secureStorage.setItemAsync(STORAGE_KEYS.LAST_SYNC, now);
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
    }, [request, offlineActions, clearQueue, error, lastSync, updateLastSync]);

    return { performFullSync, loading, error, lastSync, hasPendingActions: offlineActions.length > 0 };
};

// --- Hook 4: useSync (Principal) ---
/**
 * Hook principal que combina todas las funcionalidades de sincronización
 */
export const useSync = () => {
    const { isOnline } = useNetworkStatus();
    const { isAuthenticated } = useAuthContext();
    const { request } = useApi();
    
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSyncing: false,
        hasConflicts: false,
        conflictCount: 0,
    });

    const { actions: offlineActions, addAction, clearQueue } = useOfflineQueue();
    const { conflicts, resolveConflict } = useConflicts();
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sincronizar con el servidor
    const sync = useCallback(async (): Promise<boolean> => {
        if (!isOnline || !isAuthenticated || syncStatus.isSyncing) {
            return false;
        }

        setSyncStatus(prev => ({ ...prev, isSyncing: true }));

        try {
            // 1. Enviar acciones offline al servidor
            if (offlineActions.length > 0) {
                const pushResult = await request<{ conflicts: SyncConflicto[] }>(ENDPOINTS.SYNC.PUSH, {
                    method: 'POST',
                    body: JSON.stringify({ actions: offlineActions }),
                });

                if (pushResult?.conflicts && pushResult.conflicts.length > 0) {
                    setSyncStatus(prev => ({
                        ...prev,
                        hasConflicts: true,
                        conflictCount: pushResult.conflicts.length,
                    }));
                    return false; // No continuar hasta resolver conflictos
                }

                // Si no hay conflictos, limpiar acciones offline
                clearQueue();
            }

            // 2. Obtener datos actualizados del servidor
            const lastSync = await secureStorage.getItemAsync(STORAGE_KEYS.LAST_SYNC);
            const pullResult = await request<SyncData>(ENDPOINTS.SYNC.PULL, {
                method: 'POST',
                body: JSON.stringify({ 
                    last_sync: lastSync || new Date(0).toISOString() 
                }),
            });

            if (pullResult) {
                // Actualizar timestamp de última sincronización
                await secureStorage.setItemAsync(STORAGE_KEYS.LAST_SYNC, pullResult.server_timestamp);
                
                setSyncStatus(prev => ({
                    ...prev,
                    lastSyncTime: pullResult.server_timestamp,
                }));
            }

            return true;

        } catch (error) {
            console.error('Sync error:', error);
            return false;
        } finally {
            setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        }
    }, [isOnline, isAuthenticated, syncStatus.isSyncing, offlineActions, request, clearQueue]);

    // Auto-sync cuando vuelve la conexión
    useEffect(() => {
        if (isOnline && isAuthenticated && offlineActions.length > 0) {
            sync();
        }
    }, [isOnline, isAuthenticated, sync, offlineActions.length]);

    // Auto-sync periódico
    useEffect(() => {
        if (isOnline && isAuthenticated) {
            syncIntervalRef.current = setInterval(() => {
                sync();
            }, APP_CONFIG.AUTO_SYNC_INTERVAL) as unknown as NodeJS.Timeout;

            return () => {
                if (syncIntervalRef.current) {
                    clearInterval(syncIntervalRef.current);
                }
            };
        }
    }, [isOnline, isAuthenticated, sync]);

    // Actualizar estado de conflictos
    useEffect(() => {
        setSyncStatus(prev => ({
            ...prev,
            hasConflicts: conflicts.length > 0,
            conflictCount: conflicts.length,
        }));
    }, [conflicts]);

    return {
        syncStatus,
        offlineActions,
        conflicts,
        addOfflineAction: addAction,
        sync,
        resolveConflict,
        hasOfflineActions: offlineActions.length > 0,
    };
};