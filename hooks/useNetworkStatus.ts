// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook para monitorizar el estado de la conexión de red del dispositivo.
 * Proporciona información en tiempo real sobre si hay conexión a internet.
 */
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        // La primera vez, obtenemos el estado actual
        NetInfo.fetch().then(state => {
            setIsOnline(!!state.isConnected && !!state.isInternetReachable);
        });

        // Nos suscribimos a los cambios en el estado de la red
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(!!state.isConnected && !!state.isInternetReachable);
        });

        // La función de limpieza se encarga de remover el listener
        return () => {
            unsubscribe();
        };
    }, []);

    return { isOnline };
};