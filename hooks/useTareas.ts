import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useAPI';
import { useWebSocket } from '@/providers/WebSocketProvider'; // Corregido: Importar desde el provider
import {
    Tarea,
    CreateTareaRequest,
    UpdateTareaRequest,
    MoveTareaRequest,
    ReorderRequest,
    ENDPOINTS
} from '../config/config';

// -----------------------------------------------------------------------------
// Hook 1: useTareas - Para la lista de tareas de un tablero
// -----------------------------------------------------------------------------

export const useTareas = (groupId: string, tableroId: string) => {
    const { request, loading, error } = useApi();
    const { subscribeToGroup } = useWebSocket(); // Corregido: Usar el hook del provider
    const [tareas, setTareas] = useState<Tarea[]>([]);

    const fetchTareas = useCallback(async () => {
        if (!tableroId) return;
        // Asumiendo que el endpoint es /tableros/{id}/tareas
        const endpoint = `${ENDPOINTS.TABLEROS.SHOW.replace('{grupoId}', groupId).replace('{tableroId}', tableroId)}/tareas`;
        const data = await request<Tarea[]>(endpoint);
        if (data) {
            setTareas(data.sort((a, b) => a.orden - b.orden));
        }
    }, [request, groupId, tableroId]);

    useEffect(() => {
        fetchTareas();
    }, [fetchTareas]);

    // WebSocket para actualizaciones en tiempo real (lógica simplificada)
    useEffect(() => {
        if (!groupId) return;

        // La función subscribeToGroup ahora devuelve la función de limpieza.
        const cleanup = subscribeToGroup(groupId, {
            onTareaCreated: ({ tarea }) => {
                if (tarea.tablero_id === tableroId) {
                    setTareas(prev => [...prev, tarea].sort((a, b) => a.orden - b.orden));
                }
            },
            onTareaUpdated: ({ tarea: updatedTarea }) => {
                 setTareas(prev => prev.map(t => t.id === updatedTarea.id ? updatedTarea : t).sort((a, b) => a.orden - b.orden));
            },
            onTareaDeleted: ({ tarea_id }) => {
                setTareas(prev => prev.filter(t => t.id !== tarea_id));
            },
            onTareaMoved: ({ tarea, old_tablero_id, new_tablero_id }) => {
                // Si la tarea se movió a nuestro tablero
                if (new_tablero_id === tableroId && old_tablero_id !== tableroId) {
                    setTareas(prev => [...prev, tarea].sort((a, b) => a.orden - b.orden));
                } 
                // Si la tarea se fue de nuestro tablero
                else if (old_tablero_id === tableroId && new_tablero_id !== tableroId) {
                    setTareas(prev => prev.filter(t => t.id !== tarea.id));
                }
            }
        });

        // React llamará a esta función de limpieza automáticamente.
        return cleanup;
    }, [groupId, tableroId, subscribeToGroup]);

    const createTarea = useCallback(async (tareaData: CreateTareaRequest) => {
        if (!tableroId) return null;
        const endpoint = `${ENDPOINTS.TABLEROS.SHOW.replace('{grupoId}', groupId).replace('{tableroId}', tableroId)}/tareas`;
        // La UI se actualizará vía WebSocket
        return await request<Tarea>(endpoint, {
            method: 'POST',
            body: JSON.stringify(tareaData),
        });
    }, [request, groupId, tableroId]);

    const reorderTareas = useCallback(async (orderedIds: string[]) => {
        const endpoint = `${ENDPOINTS.TABLEROS.SHOW.replace('{grupoId}', groupId).replace('{tableroId}', tableroId)}/tareas/reorder`;
        
        // Actualización optimista
        setTareas(prev => {
            const map = new Map(prev.map(t => [t.id, t]));
            return orderedIds.map(id => map.get(id)!).filter(Boolean);
        });

        return request(endpoint, {
            method: 'POST',
            body: JSON.stringify({ ids: orderedIds } as ReorderRequest),
        });
    }, [request, groupId, tableroId]);

    return { tareas, loading, error, fetchTareas, createTarea, reorderTareas };
};

// -----------------------------------------------------------------------------
// Hook 2: useTareaDetails - (No necesita cambios)
// -----------------------------------------------------------------------------

export const useTareaDetails = (tareaId: string) => {
    const { request, loading, error } = useApi();
    const [tarea, setTarea] = useState<Tarea | null>(null);

    const fetchDetails = useCallback(async () => {
        if (!tareaId) return;
        const data = await request<Tarea>(`/tareas/${tareaId}`);
        setTarea(data);
    }, [request, tareaId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const updateTarea = useCallback(async (updates: UpdateTareaRequest) => {
        const updatedTarea = await request<Tarea>(`/tareas/${tareaId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        if (updatedTarea) setTarea(updatedTarea);
        return updatedTarea;
    }, [request, tareaId]);

    const deleteTarea = useCallback(async () => {
        const result = await request(`/tareas/${tareaId}`, { method: 'DELETE' });
        if(result) setTarea(null);
        return !!result;
    }, [request, tareaId]);

    const moveTarea = useCallback(async (moveData: MoveTareaRequest) => {
        return request<Tarea>(`/tareas/${tareaId}/move`, {
            method: 'POST',
            body: JSON.stringify(moveData),
        });
    }, [request, tareaId]);

    return { tarea, loading, error, refetch: fetchDetails, updateTarea, deleteTarea, moveTarea };
};

// -----------------------------------------------------------------------------
// Hook 3: useTareasStats - (No necesita cambios)
// -----------------------------------------------------------------------------

export const useTareasStats = (tareas: Tarea[]) => {
    const stats = useMemo(() => {
        if (!tareas || tareas.length === 0) {
            return { total: 0, pendientes: 0, enProgreso: 0, completadas: 0, vencidas: 0, porcentajeCompletado: 0 };
        }

        const completadas = tareas.filter(t => t.estado === 'completada').length;
        const now = new Date();

        return {
            total: tareas.length,
            pendientes: tareas.filter(t => t.estado === 'pendiente').length,
            enProgreso: tareas.filter(t => t.estado === 'en_progreso').length,
            completadas: completadas,
            vencidas: tareas.filter(t => t.fecha_vencimiento && new Date(t.fecha_vencimiento) < now && t.estado !== 'completada').length,
            porcentajeCompletado: Math.round((completadas / tareas.length) * 100),
        };
    }, [tareas]);

    return stats;
};