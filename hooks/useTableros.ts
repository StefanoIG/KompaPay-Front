import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useAPI';
import { useWebSocket } from '@/providers/WebSocketProvider'; 
import {
    Tablero,
    CreateTableroRequest,
    UpdateTableroRequest,
    ReorderRequest,
    ENDPOINTS
} from '../config/config';

// -----------------------------------------------------------------------------
// Hook 1: useTableros - Para la lista de tableros de un grupo
// -----------------------------------------------------------------------------

export const useTableros = (groupId: string) => {
    const { request, loading, error } = useApi();
    // Corregido: Ahora usamos el hook del WebSocketProvider
    const { subscribeToGroup } = useWebSocket();
    const [tableros, setTableros] = useState<Tablero[]>([]);

    const fetchTableros = useCallback(async () => {
        if (!groupId) return;
        const endpoint = ENDPOINTS.TABLEROS.LIST.replace('{grupoId}', groupId);
        const data = await request<Tablero[]>(endpoint);
        if (data) {
            setTableros(data.sort((a, b) => a.orden - b.orden));
        }
    }, [request, groupId]);

    useEffect(() => {
        fetchTableros();
    }, [fetchTableros]);
    
    // Efecto para la suscripción a WebSockets (lógica simplificada)
    useEffect(() => {
        if (!groupId) return;

        // La función subscribeToGroup ahora devuelve la función de limpieza.
        const cleanup = subscribeToGroup(groupId, {
            onTableroCreated: ({ tablero: newTablero }) => {
                setTableros(prev => [...prev, newTablero].sort((a, b) => a.orden - b.orden));
            },
            onTableroUpdated: ({ tablero: updatedTablero }) => {
                setTableros(prev => prev.map(t => t.id === updatedTablero.id ? updatedTablero : t).sort((a, b) => a.orden - b.orden));
            },
            onTableroDeleted: ({ tablero_id }) => {
                setTableros(prev => prev.filter(t => t.id !== tablero_id));
            }
        });

        // React llamará a esta función de limpieza automáticamente cuando el componente se desmonte.
        return cleanup;
    }, [groupId, subscribeToGroup]);


    const createTablero = useCallback(async (tableroData: CreateTableroRequest) => {
        const endpoint = ENDPOINTS.TABLEROS.CREATE.replace('{grupoId}', groupId);
        // La UI se actualizará vía WebSocket, no es necesario hacer nada más aquí.
        return await request<Tablero>(endpoint, {
            method: 'POST',
            body: JSON.stringify(tableroData),
        });
    }, [request, groupId]);

    const reorderTableros = useCallback(async (orderedIds: string[]) => {
        const endpoint = ENDPOINTS.TABLEROS.REORDER.replace('{grupoId}', groupId);
        const payload: ReorderRequest = { ids: orderedIds };
        
        // Actualización optimista: reordenamos el estado local inmediatamente.
        const reorderedTableros = orderedIds.map((id, index) => {
            const tablero = tableros.find(t => t.id === id);
            // Aseguramos que tablero no sea undefined antes de hacer spread
            if (tablero) {
                return { ...tablero, orden: index };
            }
            return null;
        }).filter(Boolean) as Tablero[]; // Filtramos posibles nulos
        
        setTableros(reorderedTableros);

        // Luego enviamos la petición al backend.
        return await request(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }, [request, groupId, tableros]);

    const updateTablero = useCallback(async (tableroId: string, updates: UpdateTableroRequest) => {
        const endpoint = ENDPOINTS.TABLEROS.UPDATE
            .replace('{grupoId}', groupId)
            .replace('{tableroId}', tableroId);

        const updatedTablero = await request<Tablero>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });

        if (updatedTablero) {
            // Actualización optimista en la lista
            setTableros(prev => prev.map(t => t.id === tableroId ? updatedTablero : t));
        }
        return updatedTablero;
    }, [request, groupId]);

    const deleteTablero = useCallback(async (tableroId: string) => {
        const endpoint = ENDPOINTS.TABLEROS.DELETE
            .replace('{grupoId}', groupId)
            .replace('{tableroId}', tableroId);
        
        const result = await request(endpoint, { method: 'DELETE' });
        if (result) {
            // Actualización optimista en la lista
            setTableros(prev => prev.filter(t => t.id !== tableroId));
        }
        return !!result;
    }, [request, groupId]);

    return { tableros, loading, error, fetchTableros, createTablero, reorderTableros, updateTablero, deleteTablero };
};


// -----------------------------------------------------------------------------
// Hook 2: useTableroDetails - (No necesita cambios)
// -----------------------------------------------------------------------------

export const useTableroDetails = (groupId: string, tableroId: string) => {
    const { request, loading, error } = useApi();
    const [tablero, setTablero] = useState<Tablero | null>(null);

    const fetchDetails = useCallback(async () => {
        if (!groupId || !tableroId) return;
        const endpoint = ENDPOINTS.TABLEROS.SHOW
            .replace('{grupoId}', groupId)
            .replace('{tableroId}', tableroId);
        
        const data = await request<Tablero>(endpoint);
        if (data) {
            setTablero(data);
        }
    }, [request, groupId, tableroId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const updateTablero = useCallback(async (updates: UpdateTableroRequest) => {
        const endpoint = ENDPOINTS.TABLEROS.UPDATE
            .replace('{grupoId}', groupId)
            .replace('{tableroId}', tableroId);

        const updatedTablero = await request<Tablero>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });

        if (updatedTablero) {
            setTablero(updatedTablero);
        }
        return updatedTablero;
    }, [request, groupId, tableroId]);

    const deleteTablero = useCallback(async () => {
        const endpoint = ENDPOINTS.TABLEROS.DELETE
            .replace('{grupoId}', groupId)
            .replace('{tableroId}', tableroId);
        
        const result = await request(endpoint, { method: 'DELETE' });
        if (result) {
            setTablero(null);
        }
        return !!result;
    }, [request, groupId, tableroId]);

    return { tablero, loading, error, refetch: fetchDetails, updateTablero, deleteTablero };
};