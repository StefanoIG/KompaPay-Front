// src/hooks/useOffline.ts
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from './useAPI';
import { OfflineAction, STORAGE_KEYS, ENDPOINTS } from '@/config/config';

/**
 * Gestiona la cola de acciones realizadas sin conexión.
 * Permite añadir acciones a la cola y enviarlas al servidor.
 */
export const useOffline = () => {
    const { request, loading } = useApi();
    const [actions, setActions] = useState<OfflineAction[]>([]);

    useEffect(() => {
        const loadActionsFromStorage = async () => {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_ACTIONS);
            setActions(jsonValue ? JSON.parse(jsonValue) : []);
        };
        loadActionsFromStorage();
    }, []);

    const saveActionsToStorage = async (updatedActions: OfflineAction[]) => {
        setActions(updatedActions);
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(updatedActions));
    };

    const addAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
        const newAction: OfflineAction = {
            id: `offline_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...action
        };
        saveActionsToStorage([...actions, newAction]);
    };

    const pushPendingChanges = async (): Promise<boolean> => {
        if (actions.length === 0) return true;
        
        const result = await request(ENDPOINTS.SYNC.PUSH, {
            method: 'POST',
            body: JSON.stringify({ actions }),
        });

        if (result) {
            // Si la petición fue exitosa, limpiamos la cola
            await saveActionsToStorage([]);
            return true;
        }
        return false;
    };

    return {
        offlineActions: actions,
        hasPendingChanges: actions.length > 0,
        addAction,
        pushPendingChanges,
        isPushing: loading,
    };
};