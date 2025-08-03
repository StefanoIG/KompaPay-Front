// src/providers/WebSocketProvider.tsx

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
    Pusher,
    PusherMember,
    PusherChannel,
    PusherEvent,
} from '@pusher/pusher-websocket-react-native';
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
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    // Función para limpiar la conexión
    const cleanupConnection = useCallback(async () => {
        if (pusherRef.current) {
            // Desconectar todos los canales primero
            channelsRef.current.forEach(async (channel, channelName) => {
                try {
                    await pusherRef.current?.unsubscribe({ channelName });
                } catch (error) {
                    console.warn('Error unsubscribing from channel:', channelName, error);
                }
            });
            channelsRef.current.clear();

            // Desconectar pusher
            try {
                await pusherRef.current.disconnect();
            } catch (error) {
                console.warn('Error disconnecting pusher:', error);
            }
            
            pusherRef.current = null;
        }
        
        setIsConnected(false);
        
        // Limpiar timeout de reconexión
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    // Función para inicializar la conexión
    const initializeConnection = useCallback(async () => {
        if (!isAuthenticated || !token || pusherRef.current) {
            return;
        }

        try {
            const pusher = Pusher.getInstance();
            
            await pusher.init({
                apiKey: PUSHER_CONFIG.key,
                cluster: PUSHER_CONFIG.cluster,
                // Para canales privados, configuramos la autenticación
                onAuthorizer: async (channelName: string, socketId: string) => {
                    try {
                        const response = await fetch(PUSHER_CONFIG.authEndpoint, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({
                                socket_id: socketId,
                                channel_name: channelName,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }

                        return await response.json();
                    } catch (error) {
                        console.error('Auth error:', error);
                        throw error;
                    }
                },
                onConnectionStateChange: (currentState: string, previousState: string) => {
                    console.log(`Pusher connection state changed from ${previousState} to ${currentState}`);
                    setIsConnected(currentState === 'CONNECTED');
                    
                    if (currentState === 'CONNECTED') {
                        // Limpiar timeout de reconexión si existe
                        if (reconnectTimeoutRef.current) {
                            clearTimeout(reconnectTimeoutRef.current);
                            reconnectTimeoutRef.current = null;
                        }
                    }
                },
                onError: (message: string, code: Number, error: any) => {
                    console.error('Pusher Error:', { message, code, error });
                    setIsConnected(false);
                    
                    // Si es un error de autenticación, limpiar todo
                    if (code === 4001 || code === 4004) {
                        console.log('Authentication error, cleaning up connection');
                        cleanupConnection();
                    }
                },
            });

            await pusher.connect();
            pusherRef.current = pusher;
            
        } catch (error) {
            console.error('Error initializing Pusher:', error);
            setIsConnected(false);
        }
    }, [isAuthenticated, token, cleanupConnection]);

    // Efecto principal para manejar la conexión
    useEffect(() => {
        // Evitar inicialización múltiple
        if (isInitializedRef.current) {
            return;
        }

        if (isAuthenticated && token) {
            isInitializedRef.current = true;
            initializeConnection();
        }

        return () => {
            isInitializedRef.current = false;
            cleanupConnection();
        };
    }, [isAuthenticated, token, initializeConnection, cleanupConnection]);

    // Efecto para manejar cambios en el token
    useEffect(() => {
        if (!isAuthenticated || !token) {
            cleanupConnection();
            isInitializedRef.current = false;
        } else if (isAuthenticated && token && !pusherRef.current) {
            // Solo reconectar si no hay conexión activa
            reconnectTimeoutRef.current = setTimeout(() => {
                initializeConnection();
            }, 1000) as unknown as NodeJS.Timeout; // Pequeño delay para evitar reconexiones rápidas
        }
    }, [token, isAuthenticated, cleanupConnection, initializeConnection]);

    const subscribeToGroup = useCallback((groupId: string, callbacks: WebSocketCallbacks) => {
        const pusher = pusherRef.current;
        if (!pusher || !isConnected) {
            console.warn('Pusher not connected, cannot subscribe to group:', groupId);
            return () => {};
        }

        const channelName = `private-grupo.${groupId}`;
        let channel = channelsRef.current.get(channelName);

        if (!channel) {
            try {
                // Subscripción usando la nueva API
                pusher.subscribe({
                    channelName,
                    onSubscriptionSucceeded: (data: any) => {
                        console.log(`Successfully subscribed to ${channelName}`, data);
                        channelsRef.current.set(channelName, true); // Marcar como suscrito
                    },
                    onSubscriptionError: (channelName: string, message: string, error: any) => {
                        console.error(`Subscription error for ${channelName}:`, message, error);
                    },
                    onEvent: (event: PusherEvent) => {
                        // Manejar eventos aquí
                        handleWebSocketEvent(event, callbacks);
                    },
                });
                
            } catch (error) {
                console.error('Error subscribing to channel:', channelName, error);
                return () => {};
            }
        }

        // Devuelve una función de limpieza
        return () => {
            try {
                if (channelsRef.current.has(channelName)) {
                    pusher.unsubscribe({ channelName });
                    channelsRef.current.delete(channelName);
                }
            } catch (error) {
                console.warn('Error cleaning up subscription:', error);
            }
        };
    }, [isConnected]);

    // Función para manejar eventos de WebSocket
    const handleWebSocketEvent = useCallback((event: PusherEvent, callbacks: WebSocketCallbacks) => {
        try {
            const eventData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            // Mapear nombres de eventos de Pusher a callbacks
            switch (event.eventName) {
                case 'tablero.created':
                    callbacks.onTableroCreated?.(eventData);
                    break;
                case 'tablero.updated':
                    callbacks.onTableroUpdated?.(eventData);
                    break;
                case 'tablero.deleted':
                    callbacks.onTableroDeleted?.(eventData);
                    break;
                case 'tarea.created':
                    callbacks.onTareaCreated?.(eventData);
                    break;
                case 'tarea.updated':
                    callbacks.onTareaUpdated?.(eventData);
                    break;
                case 'tarea.deleted':
                    callbacks.onTareaDeleted?.(eventData);
                    break;
                case 'tarea.moved':
                    callbacks.onTareaMoved?.(eventData);
                    break;
                case 'nota.created':
                    callbacks.onNotaCreated?.(eventData);
                    break;
                case 'nota.updated':
                    callbacks.onNotaUpdated?.(eventData);
                    break;
                case 'nota.deleted':
                    callbacks.onNotaDeleted?.(eventData);
                    break;
                case 'nota.locked':
                    callbacks.onNotaLocked?.(eventData);
                    break;
                case 'nota.unlocked':
                    callbacks.onNotaUnlocked?.(eventData);
                    break;
                case 'user.typing':
                    callbacks.onUserTyping?.(eventData);
                    break;
                case 'user.stopped-typing':
                    callbacks.onUserStoppedTyping?.(eventData);
                    break;
                default:
                    console.log('Unhandled event:', event.eventName, eventData);
            }
        } catch (error) {
            console.error('Error handling WebSocket event:', error);
        }
    }, []);
    
    const unsubscribeFromGroup = useCallback((groupId: string) => {
        const pusher = pusherRef.current;
        const channelName = `private-grupo.${groupId}`;
        
        if (pusher && channelsRef.current.has(channelName)) {
            try {
                pusher.unsubscribe({ channelName });
                channelsRef.current.delete(channelName);
            } catch (error) {
                console.warn('Error unsubscribing from group:', error);
            }
        }
    }, []);

    const value = { 
        pusher: pusherRef.current, 
        isConnected, 
        subscribeToGroup, 
        unsubscribeFromGroup 
    };

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