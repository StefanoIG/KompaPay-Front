import { useState, useCallback, useEffect } from 'react';
import { 
  Tarea, 
  ApiListState, 
  ApiState, 
  CreateTareaRequest, 
  UpdateTareaRequest,
  MoveTareaRequest,
  BASE_URL 
} from './types';
import { useWebSocket } from './useWebSocket';

// Hook para manejar tareas de un tablero específico
export const useTareas = (tableroId: string, authToken: string, groupId?: string) => {
  const [state, setState] = useState<ApiListState<Tarea>>({
    data: [],
    loading: false,
    error: null,
    hasMore: false,
    page: 1,
  });

  const { subscribeToGroup, unsubscribeFromGroup } = useWebSocket();

  // Cargar tareas del tablero
  const loadTareas = useCallback(async () => {
    if (!tableroId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}/tableros/${tableroId}/tareas`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        data: data.data || [],
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar tareas',
      }));
    }
  }, [tableroId, authToken]);

  // Crear nueva tarea
  const createTarea = useCallback(async (tareaData: CreateTareaRequest): Promise<Tarea | null> => {
    if (!tableroId) return null;

    try {
      const response = await fetch(`${BASE_URL}/tableros/${tableroId}/tareas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tareaData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al crear tarea',
      }));
      return null;
    }
  }, [tableroId, authToken]);

  // Actualizar tarea
  const updateTarea = useCallback(async (tareaId: string, tareaData: UpdateTareaRequest): Promise<Tarea | null> => {
    try {
      const response = await fetch(`${BASE_URL}/tareas/${tareaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tareaData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar tarea',
      }));
      return null;
    }
  }, [authToken]);

  // Mover tarea a otro tablero
  const moveTarea = useCallback(async (tareaId: string, moveData: MoveTareaRequest): Promise<Tarea | null> => {
    try {
      const response = await fetch(`${BASE_URL}/tareas/${tareaId}/move`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moveData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al mover tarea',
      }));
      return null;
    }
  }, [authToken]);

  // Eliminar tarea
  const deleteTarea = useCallback(async (tareaId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/tareas/${tareaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al eliminar tarea',
      }));
      return false;
    }
  }, [authToken]);

  // Reordenar tareas dentro del tablero
  const reorderTareas = useCallback(async (orderedIds: string[]): Promise<boolean> => {
    if (!tableroId) return false;

    try {
      const response = await fetch(`${BASE_URL}/tableros/${tableroId}/tareas/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: orderedIds }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al reordenar tareas',
      }));
      return false;
    }
  }, [tableroId, authToken]);

  // Filtrar tareas por estado
  const getTasksByEstado = useCallback((estado: 'pendiente' | 'en_progreso' | 'completada') => {
    return state.data.filter(tarea => tarea.estado === estado);
  }, [state.data]);

  // Filtrar tareas por prioridad
  const getTasksByPrioridad = useCallback((prioridad: 'baja' | 'media' | 'alta') => {
    return state.data.filter(tarea => tarea.prioridad === prioridad);
  }, [state.data]);

  // Obtener tareas asignadas a un usuario
  const getTasksByUser = useCallback((userId: string) => {
    return state.data.filter(tarea => tarea.asignado_a === userId);
  }, [state.data]);

  // Obtener tareas vencidas
  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return state.data.filter(tarea => {
      if (!tarea.fecha_vencimiento) return false;
      const vencimiento = new Date(tarea.fecha_vencimiento);
      return vencimiento < now && tarea.estado !== 'completada';
    });
  }, [state.data]);

  // Manejar eventos WebSocket
  useEffect(() => {
    if (!groupId || !authToken) return;

    const channel = subscribeToGroup(groupId, {
      onTareaCreated: (data) => {
        // Solo agregar si pertenece a este tablero
        if (data.tarea.tablero_id === tableroId) {
          setState(prev => ({
            ...prev,
            data: [...prev.data, data.tarea].sort((a, b) => a.orden - b.orden),
          }));
        }
      },
      onTareaUpdated: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.map(tarea => 
            tarea.id === data.tarea.id ? data.tarea : tarea
          ).sort((a, b) => a.orden - b.orden),
        }));
      },
      onTareaDeleted: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.filter(tarea => tarea.id !== data.tarea_id),
        }));
      },
      onTareaMoved: (data) => {
        // Si la tarea se movió hacia este tablero
        if (data.new_tablero_id === tableroId && data.old_tablero_id !== tableroId) {
          setState(prev => ({
            ...prev,
            data: [...prev.data, data.tarea].sort((a, b) => a.orden - b.orden),
          }));
        }
        // Si la tarea se movió desde este tablero
        else if (data.old_tablero_id === tableroId && data.new_tablero_id !== tableroId) {
          setState(prev => ({
            ...prev,
            data: prev.data.filter(tarea => tarea.id !== data.tarea.id),
          }));
        }
        // Si se reordenó dentro del mismo tablero
        else if (data.new_tablero_id === tableroId && data.old_tablero_id === tableroId) {
          setState(prev => ({
            ...prev,
            data: prev.data.map(tarea => 
              tarea.id === data.tarea.id ? data.tarea : tarea
            ).sort((a, b) => a.orden - b.orden),
          }));
        }
      },
    });

    return () => {
      unsubscribeFromGroup(groupId);
    };
  }, [groupId, authToken, tableroId, subscribeToGroup, unsubscribeFromGroup]);

  // Cargar tareas al montar
  useEffect(() => {
    if (tableroId && authToken) {
      loadTareas();
    }
  }, [tableroId, authToken, loadTareas]);

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    tareas: state.data,
    loading: state.loading,
    error: state.error,
    loadTareas,
    createTarea,
    updateTarea,
    moveTarea,
    deleteTarea,
    reorderTareas,
    getTasksByEstado,
    getTasksByPrioridad,
    getTasksByUser,
    getOverdueTasks,
  };
};

// Hook para una tarea específica
export const useTarea = (tareaId: string, authToken: string) => {
  const [state, setState] = useState<ApiState<Tarea>>({
    data: null,
    loading: false,
    error: null,
  });

  const loadTarea = useCallback(async () => {
    if (!tareaId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}/tareas/${tareaId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState({
        data: data.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Error al cargar tarea',
      });
    }
  }, [tareaId, authToken]);

  useEffect(() => {
    if (tareaId && authToken) {
      loadTarea();
    }
  }, [tareaId, authToken, loadTarea]);

  return {
    tarea: state.data,
    loading: state.loading,
    error: state.error,
    reload: loadTarea,
  };
};

// Hook para estadísticas de tareas
export const useTareasStats = (tableroId: string, authToken: string) => {
  const { tareas, loading, error } = useTareas(tableroId, authToken);

  const stats = {
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    enProgreso: tareas.filter(t => t.estado === 'en_progreso').length,
    completadas: tareas.filter(t => t.estado === 'completada').length,
    vencidas: tareas.filter(t => {
      if (!t.fecha_vencimiento) return false;
      const vencimiento = new Date(t.fecha_vencimiento);
      return vencimiento < new Date() && t.estado !== 'completada';
    }).length,
    porPrioridad: {
      alta: tareas.filter(t => t.prioridad === 'alta').length,
      media: tareas.filter(t => t.prioridad === 'media').length,
      baja: tareas.filter(t => t.prioridad === 'baja').length,
    },
    porcentajeCompletado: tareas.length > 0 
      ? Math.round((tareas.filter(t => t.estado === 'completada').length / tareas.length) * 100)
      : 0,
  };

  return {
    stats,
    loading,
    error,
  };
};
