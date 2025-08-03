// src/hooks/useNetworkStatus.ts
import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ConnectionStatus } from '@/config/config';

/**
 * Hook para monitorizar el estado de la conexión de red del dispositivo.
 * Proporciona información en tiempo real sobre si hay conexión a internet.
 */
export const useNetworkStatus = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        isOnline: true,
        pendingActions: 0,
    });

    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

    useEffect(() => {
        // La primera vez, obtenemos el estado actual
        NetInfo.fetch().then(state => {
            const connected = !!state.isConnected;
            const reachable = state.isInternetReachable;
            
            setIsConnected(connected);
            setIsInternetReachable(reachable);
            setConnectionStatus(prev => ({
                ...prev,
                isOnline: connected && (reachable !== false),
            }));
        });

        // Nos suscribimos a los cambios en el estado de la red
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = !!state.isConnected;
            const reachable = state.isInternetReachable;
            
            setIsConnected(connected);
            setIsInternetReachable(reachable);
            setConnectionStatus(prev => ({
                ...prev,
                isOnline: connected && (reachable !== false),
            }));
        });

        // La función de limpieza se encarga de remover el listener
        return () => {
            unsubscribe();
        };
    }, []);

    const updatePendingActions = useCallback((count: number) => {
        setConnectionStatus(prev => ({
            ...prev,
            pendingActions: count,
        }));
    }, []);

    const updateLastSync = useCallback((timestamp: string) => {
        setConnectionStatus(prev => ({
            ...prev,
            lastSync: timestamp,
        }));
    }, []);

    return {
        isConnected,
        isInternetReachable,
        connectionStatus,
        updatePendingActions,
        updateLastSync,
        isOnline: connectionStatus.isOnline,
    };
};