// src/providers/WebSocketProvider.tsx

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
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
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    // Función para limpiar la conexión
    const cleanupConnection = useCallback(() => {
        if (pusherRef.current) {
            // Desconectar todos los canales primero
            channelsRef.current.forEach((channel, channelName) => {
                try {
                    channel.unbind_all();
                    pusherRef.current?.unsubscribe(channelName);
                } catch (error) {
                    console.warn('Error unsubscribing from channel:', channelName, error);
                }
            });
            channelsRef.current.clear();

            // Desconectar pusher
            try {
                pusherRef.current.disconnect();
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
    const initializeConnection = useCallback(() => {
        if (!isAuthenticated || !token || pusherRef.current) {
            return;
        }

        try {
            const pusher = new Pusher(PUSHER_CONFIG.key, {
                cluster: PUSHER_CONFIG.cluster,
                authEndpoint: PUSHER_CONFIG.authEndpoint,
                auth: { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                },
                enabledTransports: ['ws', 'wss'],
                // Configuraciones adicionales para estabilidad
                activityTimeout: 30000,
                pongTimeout: 6000,
                unavailableTimeout: 10000,
                // Configuración de autenticación más robusta
                authorizer: (channel, options) => {
                    return {
                        authorize: (socketId, callback) => {
                            fetch(PUSHER_CONFIG.authEndpoint, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                },
                                body: JSON.stringify({
                                    socket_id: socketId,
                                    channel_name: channel.name,
                                }),
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                callback(null, data);
                            })
                            .catch(error => {
                                console.error('Auth error:', error);
                                callback(error, null);
                            });
                        }
                    };
                }
            });

            // Event listeners para el estado de la conexión
            pusher.connection.bind('connected', () => {
                console.log('Pusher connected');
                setIsConnected(true);
                // Limpiar timeout de reconexión si existe
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            });

            pusher.connection.bind('disconnected', () => {
                console.log('Pusher disconnected');
                setIsConnected(false);
            });

            pusher.connection.bind('unavailable', () => {
                console.log('Pusher unavailable');
                setIsConnected(false);
            });

            pusher.connection.bind('failed', () => {
                console.log('Pusher connection failed');
                setIsConnected(false);
            });

            pusher.connection.bind('error', (err) => {
                console.error('Pusher Error:', err);
                setIsConnected(false);
                
                // Si es un error de autenticación, limpiar todo
                if (err?.error?.code === 4001 || err?.error?.code === 4004) {
                    console.log('Authentication error, cleaning up connection');
                    cleanupConnection();
                }
            });

            // Listener para errores de autenticación en canales
            pusher.bind('pusher:subscription_error', (err) => {
                console.error('Subscription error:', err);
                if (err?.status === 401 || err?.status === 403) {
                    console.log('Channel auth error, cleaning up connection');
                    cleanupConnection();
                }
            });

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
            }, 1000); // Pequeño delay para evitar reconexiones rápidas
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
                channel = pusher.subscribe(channelName);
                channelsRef.current.set(channelName, channel);
                
                // Listener para errores de suscripción
                channel.bind('pusher:subscription_error', (err) => {
                    console.error(`Subscription error for ${channelName}:`, err);
                });

                channel.bind('pusher:subscription_succeeded', () => {
                    console.log(`Successfully subscribed to ${channelName}`);
                });
                
            } catch (error) {
                console.error('Error subscribing to channel:', channelName, error);
                return () => {};
            }
        }
        
        // Limpiar bindings anteriores para evitar duplicados
        try {
            channel.unbind_all();
        } catch (error) {
            console.warn('Error unbinding previous events:', error);
        }
        
        // Bind de los nuevos callbacks
        Object.entries(callbacks).forEach(([eventName, callback]) => {
            try {
                // Convierte 'onNotaCreated' a 'nota.created'
                const pusherEvent = eventName.replace('on', '').replace(/([A-Z])/g, '.$1').toLowerCase().substring(1);
                channel.bind(pusherEvent, callback);
            } catch (error) {
                console.error(`Error binding event ${eventName}:`, error);
            }
        });

        // Devuelve una función de limpieza
        return () => {
            try {
                if (channel && channelsRef.current.has(channelName)) {
                    channel.unbind_all();
                    pusher.unsubscribe(channelName);
                    channelsRef.current.delete(channelName);
                }
            } catch (error) {
                console.warn('Error cleaning up subscription:', error);
            }
        };
    }, [isConnected]);
    
    const unsubscribeFromGroup = useCallback((groupId: string) => {
        const pusher = pusherRef.current;
        const channelName = `private-grupo.${groupId}`;
        
        if (pusher && channelsRef.current.has(channelName)) {
            try {
                const channel = channelsRef.current.get(channelName);
                if (channel) {
                    channel.unbind_all();
                }
                pusher.unsubscribe(channelName);
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