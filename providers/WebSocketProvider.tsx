// src/providers/WebSocketProvider.tsx

import React, { createContext, useContext, useEffect, useRef } from 'react';
import Pusher from 'pusher-js/react-native';
import { useAuthContext } from './AuthProvider';
import { PUSHER_CONFIG, WebSocketCallbacks } from '@/config/config';

// 1. Definir el tipo del Contexto
interface WebSocketContextType {
    pusher: Pusher | null;
    isConnected: boolean;
    subscribeToGroup: (groupId: string, callbacks: WebSocketCallbacks) => () => void;
    unsubscribeFromGroup: (groupId: string) => void;
}

// 2. Crear el Contexto
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// 3. Crear el componente Provider
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, isAuthenticated } = useAuthContext();
    const pusherRef = useRef<Pusher | null>(null);
    const channelsRef = useRef<Map<string, any>>(new Map());
    const [isConnected, setConnected] = React.useState(false);

    // Efecto para conectar/desconectar automáticamente
    useEffect(() => {
        if (isAuthenticated && token && !pusherRef.current) {
            const pusher = new Pusher(PUSHER_CONFIG.key, {
                cluster: PUSHER_CONFIG.cluster,
                authEndpoint: PUSHER_CONFIG.authEndpoint,
                auth: { headers: { Authorization: `Bearer ${token}` } },
                enabledTransports: ['ws', 'wss'],
            });

            pusher.connection.bind('connected', () => setConnected(true));
            pusher.connection.bind('disconnected', () => setConnected(false));
            pusher.connection.bind('error', (err) => console.error('Pusher Error:', err));

            pusherRef.current = pusher;
        } else if (!isAuthenticated && pusherRef.current) {
            pusherRef.current.disconnect();
            pusherRef.current = null;
            setConnected(false);
        }

        // Función de limpieza al desmontar el provider
        return () => {
            if (pusherRef.current) {
                pusherRef.current.disconnect();
            }
        };
    }, [isAuthenticated, token]);

    const subscribeToGroup = (groupId: string, callbacks: WebSocketCallbacks) => {
        const pusher = pusherRef.current;
        if (!pusher) return () => {};

        const channelName = `private-grupo.${groupId}`;
        let channel = channelsRef.current.get(channelName);

        if (!channel) {
            channel = pusher.subscribe(channelName);
            channelsRef.current.set(channelName, channel);
        }
        
        // Limpiar bindings anteriores para evitar duplicados
        channel.unbind_all();
        
        // Bind de los nuevos callbacks
        Object.entries(callbacks).forEach(([eventName, callback]) => {
            // Convierte 'onNotaCreated' a 'nota.created'
            const pusherEvent = eventName.replace('on', '').replace(/([A-Z])/g, '.$1').toLowerCase().substring(1);
            channel.bind(pusherEvent, callback);
        });

        // Devuelve una función de limpieza para que el componente que se suscribe la use
        return () => {
            channel.unbind_all();
            pusher.unsubscribe(channelName);
            channelsRef.current.delete(channelName);
        };
    };
    
    const unsubscribeFromGroup = (groupId: string) => {
        const pusher = pusherRef.current;
        const channelName = `private-grupo.${groupId}`;
        if (pusher && channelsRef.current.has(channelName)) {
            pusher.unsubscribe(channelName);
            channelsRef.current.delete(channelName);
        }
    };


    const value = { pusher: pusherRef.current, isConnected, subscribeToGroup, unsubscribeFromGroup };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

// 4. Crear un hook para consumir el contexto
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};