import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from './useAPI';
import { useWebSocket } from '@/providers/WebSocketProvider';
import {
    Nota,
    CreateNotaRequest,
    UpdateNotaRequest,
    TypingUser,
    ENDPOINTS,
    User,
} from '@/config/config';
import { useAuthContext } from '@/providers/AuthProvider';

/**
 * Hook para la gestión integral de notas colaborativas de un grupo.
 */
export const useNotas = (groupId: string) => {
    const { request, loading: apiLoading, error: apiError } = useApi();
    const { user } = useAuthContext();
    const { subscribeToGroup, pusher } = useWebSocket();

    const [notas, setNotas] = useState<Nota[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser[]>>(new Map());
    const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const loadNotas = useCallback(async () => {
        if (!groupId || groupId.trim() === '') {
            console.warn('loadNotas: groupId is empty or undefined');
            return;
        }
        const endpoint = ENDPOINTS.NOTAS.LIST.replace('{grupoId}', groupId);
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
            cleanup();
            typingTimeoutRef.current.forEach(clearTimeout);
        };
    }, [groupId, subscribeToGroup]);

    // --- Funciones CRUD ---

    const createNota = useCallback(async (data: CreateNotaRequest) => {
        if (!groupId || groupId.trim() === '') {
            console.error('createNota: groupId is empty or undefined');
            return null;
        }
        const endpoint = ENDPOINTS.NOTAS.CREATE.replace('{grupoId}', groupId);
        return request<Nota>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }, [groupId, request]);

    const updateNota = useCallback(async (notaId: string, data: UpdateNotaRequest) => {
        return request<Nota>(`/notas/${notaId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }, [request]);
    
    // --- Lógica de "Está Escribiendo" ---
    
    // Nota: Para eventos de cliente (typing), necesitaríamos implementar 
    // un endpoint específico en el servidor o usar presence channels
    // Por ahora, comentamos esta funcionalidad hasta implementar la solución correcta
    
    const sendTypingEvent = useCallback(async (eventName: string, notaId: string) => {
        if (!user) return;
        
        // En lugar de client events, enviar al servidor que rebroadcast
        try {
            await request('/api/typing-events', {
                method: 'POST',
                body: JSON.stringify({
                    grupo_id: groupId,
                    nota_id: notaId,
                    event_type: eventName,
                    user_name: user.name,
                }),
            });
        } catch (error) {
            console.error('Error sending typing event:', error);
        }
    }, [groupId, user, request]);

    const startTyping = useCallback((notaId: string) => {
        if (!user) return;
        sendTypingEvent('user-typing', notaId);
        
        const timeoutKey = `${notaId}-${user.name}`;
        if (typingTimeoutRef.current.has(timeoutKey)) {
            const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
            if (existingTimeout) clearTimeout(existingTimeout);
        }

        const newTimeout = setTimeout(() => stopTyping(notaId), 3000) as unknown as NodeJS.Timeout;
        typingTimeoutRef.current.set(timeoutKey, newTimeout);

    }, [user, sendTypingEvent]);

    const stopTyping = useCallback((notaId: string) => {
        if (!user) return;
        sendTypingEvent('user-stopped-typing', notaId);

        const timeoutKey = `${notaId}-${user.name}`;
        if (typingTimeoutRef.current.has(timeoutKey)) {
            const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
                typingTimeoutRef.current.delete(timeoutKey);
            }
        }
    }, [user, sendTypingEvent]);


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