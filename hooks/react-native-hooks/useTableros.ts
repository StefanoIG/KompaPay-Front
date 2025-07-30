import { useState, useCallback, useEffect } from 'react';
import { 
  Tablero, 
  ApiListState, 
  ApiState, 
  CreateTableroRequest, 
  UpdateTableroRequest,
  ReorderRequest,
  BASE_URL 
} from './types';
import { useWebSocket } from './useWebSocket';

// Hook principal para manejar tableros (Trello boards)
export const useTableros = (groupId: string, authToken: string) => {
  const [state, setState] = useState<ApiListState<Tablero>>({
    data: [],
    loading: false,
    error: null,
    hasMore: false,
    page: 1,
  });

  const { subscribeToGroup, unsubscribeFromGroup } = useWebSocket();

  // Cargar tableros del grupo
  const loadTableros = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}/grupos/${groupId}/tableros`, {
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
        error: error.message || 'Error al cargar tableros',
      }));
    }
  }, [groupId, authToken]);

  // Crear nuevo tablero
  const createTablero = useCallback(async (tableroData: CreateTableroRequest): Promise<Tablero | null> => {
    try {
      const response = await fetch(`${BASE_URL}/grupos/${groupId}/tableros`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableroData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al crear tablero',
      }));
      return null;
    }
  }, [groupId, authToken]);

  // Actualizar tablero
  const updateTablero = useCallback(async (tableroId: string, tableroData: UpdateTableroRequest): Promise<Tablero | null> => {
    try {
      const response = await fetch(`${BASE_URL}/tableros/${tableroId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableroData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar tablero',
      }));
      return null;
    }
  }, [authToken]);

  // Eliminar tablero
  const deleteTablero = useCallback(async (tableroId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/tableros/${tableroId}`, {
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
        error: error.message || 'Error al eliminar tablero',
      }));
      return false;
    }
  }, [authToken]);

  // Reordenar tableros
  const reorderTableros = useCallback(async (orderedIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/grupos/${groupId}/tableros/reorder`, {
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
        error: error.message || 'Error al reordenar tableros',
      }));
      return false;
    }
  }, [groupId, authToken]);

  // Manejar eventos WebSocket
  useEffect(() => {
    if (!groupId || !authToken) return;

    const channel = subscribeToGroup(groupId, {
      onTableroCreated: (data) => {
        setState(prev => ({
          ...prev,
          data: [...prev.data, data.tablero].sort((a, b) => a.orden - b.orden),
        }));
      },
      onTableroUpdated: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.map(tablero => 
            tablero.id === data.tablero.id ? data.tablero : tablero
          ).sort((a, b) => a.orden - b.orden),
        }));
      },
      onTableroDeleted: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.filter(tablero => tablero.id !== data.tablero_id),
        }));
      },
    });

    return () => {
      unsubscribeFromGroup(groupId);
    };
  }, [groupId, authToken, subscribeToGroup, unsubscribeFromGroup]);

  // Cargar tableros al montar
  useEffect(() => {
    if (groupId && authToken) {
      loadTableros();
    }
  }, [groupId, authToken, loadTableros]);

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
    tableros: state.data,
    loading: state.loading,
    error: state.error,
    loadTableros,
    createTablero,
    updateTablero,
    deleteTablero,
    reorderTableros,
  };
};

// Hook para un tablero específico
export const useTablero = (tableroId: string, authToken: string) => {
  const [state, setState] = useState<ApiState<Tablero>>({
    data: null,
    loading: false,
    error: null,
  });

  const loadTablero = useCallback(async () => {
    if (!tableroId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}/tableros/${tableroId}`, {
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
        error: error.message || 'Error al cargar tablero',
      });
    }
  }, [tableroId, authToken]);

  useEffect(() => {
    if (tableroId && authToken) {
      loadTablero();
    }
  }, [tableroId, authToken, loadTablero]);

  return {
    tablero: state.data,
    loading: state.loading,
    error: state.error,
    reload: loadTablero,
  };
};
