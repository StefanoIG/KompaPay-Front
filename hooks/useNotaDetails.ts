import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useAPI';
import { useWebSocket } from '@/providers/WebSocketProvider'; // Corregido: Importar desde el provider
import { Nota, UpdateNotaRequest, User } from '../config/config';

/**
 * Gestiona los detalles, el contenido y el estado de bloqueo de una única nota.
 * @param groupId - El ID del grupo al que pertenece la nota (para WebSockets).
 * @param notaId - El ID de la nota a gestionar.
 */
export const useNotaDetails = (groupId: string, notaId: string) => {
    const { request, loading, error } = useApi();
    const { subscribeToGroup } = useWebSocket(); // Corregido: Usar el hook del provider
    const [nota, setNota] = useState<Nota | null>(null);

    const fetchDetails = useCallback(async () => {
        if (!notaId) return;
        const data = await request<Nota>(`/notas/${notaId}`);
        if (data) {
            setNota(data);
        }
    }, [request, notaId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    // Suscripción a WebSockets para actualizaciones en tiempo real
    useEffect(() => {
        if (!groupId || !notaId) return;

        // La función subscribeToGroup ahora devuelve la función de limpieza.
        const cleanup = subscribeToGroup(groupId, {
            onNotaUpdated: ({ nota: updatedNota }) => {
                if (updatedNota.id === notaId) {
                    setNota(updatedNota);
                }
            },
            onNotaLocked: ({ nota_id, locked_by }) => {
                if (nota_id === notaId) {
                    setNota(prev => prev ? { ...prev, bloqueada_por: locked_by.id, bloqueador: locked_by as User } : null);
                }
            },
            onNotaUnlocked: ({ nota_id }) => {
                if (nota_id === notaId) {
                    setNota(prev => prev ? { ...prev, bloqueada_por: undefined, bloqueador: undefined } : null);
                }
            }
        });

        // React llamará a esta función de limpieza automáticamente.
        return cleanup;
    }, [groupId, notaId, subscribeToGroup]);

    const updateNota = useCallback(async (updates: UpdateNotaRequest) => {
        const updatedNota = await request<Nota>(`/notas/${notaId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        if (updatedNota) {
            setNota(updatedNota);
        }
        return updatedNota;
    }, [request, notaId]);

    return { nota, loading, error, refetch: fetchDetails, updateNota };
};