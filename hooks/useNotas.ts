import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from './useAPI';
import { useWebSocket } from '@/providers/WebSocketProvider'; // Corregido: Importar desde el provider
import {
    Nota,
    CreateNotaRequest,
    UpdateNotaRequest,
    TypingUser,
    ENDPOINTS,
    User,
} from '@/config/config';
import { useAuthContext } from '@/providers/AuthProvider'; // Necesario para obtener el nombre de usuario

/**
 * Hook para la gestión integral de notas colaborativas de un grupo.
 */
export const useNotas = (groupId: string) => {
    const { request, loading: apiLoading, error: apiError } = useApi();
    const { user } = useAuthContext(); // Obtener el usuario actual del contexto
    const { subscribeToGroup, pusher } = useWebSocket(); // Obtener el pusher y la función de suscripción

    const [notas, setNotas] = useState<Nota[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser[]>>(new Map());
    const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const loadNotas = useCallback(async () => {
        const endpoint = ENDPOINTS.TABLEROS.LIST.replace('{grupoId}', groupId) + '/notas'; // Asumiendo endpoint
        const data = await request<Nota[]>(endpoint);
        if (data) {
            setNotas(data);
        }
    }, [groupId, request]);

    useEffect(() => {
        if (groupId) {
            loadNotas();
        }
    }, [groupId, loadNotas]);

    // --- WebSockets ---
    useEffect(() => {
        if (!groupId) return;

        // La función subscribeToGroup ahora devuelve la función de limpieza directamente.
        const cleanup = subscribeToGroup(groupId, {
            onNotaCreated: ({ nota }) => setNotas(prev => [nota, ...prev]),
            onNotaUpdated: ({ nota: updatedNota }) =>
                setNotas(prev => prev.map(n => n.id === updatedNota.id ? updatedNota : n)),
            onNotaDeleted: ({ nota_id }) =>
                setNotas(prev => prev.filter(n => n.id !== nota_id)),
            onNotaLocked: ({ nota_id, locked_by }) => {
                setNotas(prev => prev.map(n =>
                    n.id === nota_id ? { ...n, bloqueada_por: locked_by.id, bloqueador: locked_by as User } : n
                ));
            },
            onNotaUnlocked: ({ nota_id }) => {
                setNotas(prev => prev.map(n =>
                    n.id === nota_id ? { ...n, bloqueada_por: undefined, bloqueador: undefined } : n
                ));
            },
            onUserTyping: (data) => {
                setTypingUsers(prev => {
                    const newMap = new Map(prev);
                    const current = newMap.get(data.nota_id) || [];
                    if (!current.some(u => u.user_name === data.user_name)) {
                        newMap.set(data.nota_id, [...current, data]);
                    }
                    return newMap;
                });
            },
            onUserStoppedTyping: (data) => {
                setTypingUsers(prev => {
                    const newMap = new Map(prev);
                    const current = newMap.get(data.nota_id) || [];
                    const filtered = current.filter(u => u.user_name !== data.user_name);
                    if (filtered.length > 0) {
                        newMap.set(data.nota_id, filtered);
                    } else {
                        newMap.delete(data.nota_id);
                    }
                    return newMap;
                });
            },
        });

        return () => {
            cleanup(); // Llama a la función de limpieza devuelta por subscribeToGroup
            typingTimeoutRef.current.forEach(clearTimeout);
        };
    }, [groupId, subscribeToGroup]);

    // --- Funciones CRUD ---

    const createNota = (data: CreateNotaRequest) => {
         const endpoint = ENDPOINTS.TABLEROS.LIST.replace('{grupoId}', groupId) + '/notas';
        return request<Nota>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    };

    const updateNota = (notaId: string, data: UpdateNotaRequest) => {
        return request<Nota>(`/notas/${notaId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    };
    
    // --- Lógica de "Está Escribiendo" ---
    
    const sendClientEvent = (eventName: string, notaId: string) => {
        const channelName = `private-grupo.${groupId}`;
        const channel = pusher?.channel(channelName);
        if (channel && user) {
            channel.trigger(eventName, {
                nota_id: notaId,
                user_name: user.name, // Usar el nombre del usuario del contexto
            });
        }
    };

    const startTyping = useCallback((notaId: string) => {
        if (!user) return;
        sendClientEvent('client-user-typing', notaId);
        
        const timeoutKey = `${notaId}-${user.name}`;
        if (typingTimeoutRef.current.has(timeoutKey)) {
            clearTimeout(typingTimeoutRef.current.get(timeoutKey));
        }

        const newTimeout = setTimeout(() => stopTyping(notaId), 3000);
        typingTimeoutRef.current.set(timeoutKey, newTimeout);

    }, [groupId, pusher, user]);

    const stopTyping = useCallback((notaId: string) => {
        if (!user) return;
        sendClientEvent('client-user-stopped-typing', notaId);

        const timeoutKey = `${notaId}-${user.name}`;
         if (typingTimeoutRef.current.has(timeoutKey)) {
            clearTimeout(typingTimeoutRef.current.get(timeoutKey));
            typingTimeoutRef.current.delete(timeoutKey);
        }
    }, [groupId, pusher, user]);


    return {
        notas,
        loading: apiLoading,
        error: apiError,
        typingUsers,
        loadNotas,
        createNota,
        updateNota,
        startTyping,
        stopTyping,
        // ...resto de funciones que no cambian...
        isNotaLocked: (notaId: string, currentUserId: string) => {
            const nota = notas.find(n => n.id === notaId);
            return !!nota?.bloqueada_por && nota.bloqueada_por !== currentUserId;
        },
    };
};