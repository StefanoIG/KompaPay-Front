import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Nota, 
  ApiListState, 
  ApiState, 
  CreateNotaRequest, 
  UpdateNotaRequest,
  TypingUser,
  BASE_URL 
} from './types';
import { useWebSocket } from './useWebSocket';

// Hook para manejar notas colaborativas de un grupo
export const useNotas = (groupId: string, authToken: string) => {
  const [state, setState] = useState<ApiListState<Nota>>({
    data: [],
    loading: false,
    error: null,
    hasMore: false,
    page: 1,
  });

  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser[]>>(new Map());
  const { subscribeToGroup, unsubscribeFromGroup, sendTypingEvent, sendStoppedTypingEvent } = useWebSocket();
  const typingTimeoutRef = useRef<Map<string, any>>(new Map());

  // Cargar notas del grupo
  const loadNotas = useCallback(async () => {
    if (!groupId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}/grupos/${groupId}/notas`, {
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
        error: error.message || 'Error al cargar notas',
      }));
    }
  }, [groupId, authToken]);

  // Crear nueva nota
  const createNota = useCallback(async (notaData: CreateNotaRequest): Promise<Nota | null> => {
    if (!groupId) return null;

    try {
      const response = await fetch(`${BASE_URL}/grupos/${groupId}/notas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al crear nota',
      }));
      return null;
    }
  }, [groupId, authToken]);

  // Actualizar nota
  const updateNota = useCallback(async (notaId: string, notaData: UpdateNotaRequest): Promise<Nota | null> => {
    try {
      const response = await fetch(`${BASE_URL}/notas/${notaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar nota',
      }));
      return null;
    }
  }, [authToken]);

  // Eliminar nota
  const deleteNota = useCallback(async (notaId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/notas/${notaId}`, {
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
        error: error.message || 'Error al eliminar nota',
      }));
      return false;
    }
  }, [authToken]);

  // Bloquear nota para edición
  const lockNota = useCallback(async (notaId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/notas/${notaId}/lock`, {
        method: 'POST',
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
        error: error.message || 'Error al bloquear nota',
      }));
      return false;
    }
  }, [authToken]);

  // Desbloquear nota
  const unlockNota = useCallback(async (notaId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/notas/${notaId}/unlock`, {
        method: 'POST',
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
        error: error.message || 'Error al desbloquear nota',
      }));
      return false;
    }
  }, [authToken]);

  // Indicar que el usuario está escribiendo
  const startTyping = useCallback((notaId: string, userName: string) => {
    sendTypingEvent(groupId, notaId, userName);
    
    // Limpiar timeout anterior si existe
    const timeoutKey = `${notaId}-${userName}`;
    const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Configurar nuevo timeout para parar de escribir automáticamente
    const newTimeout = setTimeout(() => {
      stopTyping(notaId, userName);
    }, 3000); // 3 segundos sin escribir

    typingTimeoutRef.current.set(timeoutKey, newTimeout);
  }, [groupId, sendTypingEvent]);

  // Indicar que el usuario paró de escribir
  const stopTyping = useCallback((notaId: string, userName: string) => {
    sendStoppedTypingEvent(groupId, notaId, userName);
    
    // Limpiar timeout
    const timeoutKey = `${notaId}-${userName}`;
    const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeoutRef.current.delete(timeoutKey);
    }
  }, [groupId, sendStoppedTypingEvent]);

  // Obtener usuarios escribiendo en una nota específica
  const getTypingUsers = useCallback((notaId: string): TypingUser[] => {
    return typingUsers.get(notaId) || [];
  }, [typingUsers]);

  // Verificar si una nota está bloqueada por otro usuario
  const isNotaLocked = useCallback((notaId: string, currentUserId: string): boolean => {
    const nota = state.data.find(n => n.id === notaId);
    return nota?.bloqueada_por !== null && nota?.bloqueada_por !== currentUserId;
  }, [state.data]);

  // Obtener el historial de versiones de una nota
  const getNotaHistory = useCallback(async (notaId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/notas/${notaId}/history`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar historial',
      }));
      return [];
    }
  }, [authToken]);

  // Manejar eventos WebSocket
  useEffect(() => {
    if (!groupId || !authToken) return;

    const channel = subscribeToGroup(groupId, {
      onNotaCreated: (data) => {
        setState(prev => ({
          ...prev,
          data: [data.nota, ...prev.data],
        }));
      },
      onNotaUpdated: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.map(nota => 
            nota.id === data.nota.id ? data.nota : nota
          ),
        }));
      },
      onNotaDeleted: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.filter(nota => nota.id !== data.nota_id),
        }));
      },
      onNotaLocked: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.map(nota => 
            nota.id === data.nota_id 
              ? { ...nota, bloqueada_por: data.locked_by.id, bloqueador: data.locked_by }
              : nota
          ),
        }));
      },
      onNotaUnlocked: (data) => {
        setState(prev => ({
          ...prev,
          data: prev.data.map(nota => 
            nota.id === data.nota_id 
              ? { ...nota, bloqueada_por: null, bloqueador: null }
              : nota
          ),
        }));
      },
      onUserTyping: (data) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const currentTyping = newMap.get(data.nota_id) || [];
          
          // Verificar si el usuario ya está en la lista
          const existingIndex = currentTyping.findIndex(u => u.user_name === data.user_name);
          
          if (existingIndex >= 0) {
            // Actualizar timestamp
            currentTyping[existingIndex] = data;
          } else {
            // Agregar nuevo usuario
            currentTyping.push(data);
          }
          
          newMap.set(data.nota_id, currentTyping);
          return newMap;
        });
      },
      onUserStoppedTyping: (data) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const currentTyping = newMap.get(data.nota_id) || [];
          
          // Remover usuario de la lista
          const filteredTyping = currentTyping.filter(u => u.user_name !== data.user_name);
          
          if (filteredTyping.length === 0) {
            newMap.delete(data.nota_id);
          } else {
            newMap.set(data.nota_id, filteredTyping);
          }
          
          return newMap;
        });
      },
    });

    return () => {
      unsubscribeFromGroup(groupId);
      // Limpiar timeouts al desmontar
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, [groupId, authToken, subscribeToGroup, unsubscribeFromGroup]);

  // Cargar notas al montar
  useEffect(() => {
    if (groupId && authToken) {
      loadNotas();
    }
  }, [groupId, authToken, loadNotas]);

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
    notas: state.data,
    loading: state.loading,
    error: state.error,
    loadNotas,
    createNota,
    updateNota,
    deleteNota,
    lockNota,
    unlockNota,
    startTyping,
    stopTyping,
    getTypingUsers,
    isNotaLocked,
    getNotaHistory,
  };
};

// Hook para una nota específica con edición colaborativa
export const useNotaColaborativa = (notaId: string, authToken: string, userName: string, groupId: string) => {
  const [state, setState] = useState<ApiState<Nota>>({
    data: null,
    loading: false,
    error: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState('');
  const typingTimeoutRef = useRef<any>(null);
  const { startTyping, stopTyping, getTypingUsers, lockNota, unlockNota } = useNotas(groupId, authToken);

  const loadNota = useCallback(async () => {
    if (!notaId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}/notas/${notaId}`, {
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

      setLocalContent(data.data.contenido);
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Error al cargar nota',
      });
    }
  }, [notaId, authToken]);

  // Iniciar edición
  const startEditing = useCallback(async () => {
    const success = await lockNota(notaId);
    if (success) {
      setIsEditing(true);
    }
    return success;
  }, [notaId, lockNota]);

  // Terminar edición
  const stopEditing = useCallback(async () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(notaId, userName);
    
    const success = await unlockNota(notaId);
    if (success) {
      setIsEditing(false);
    }
    return success;
  }, [notaId, userName, unlockNota, stopTyping]);

  // Manejar cambios en el contenido
  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
    
    if (isEditing) {
      // Indicar que está escribiendo
      startTyping(notaId, userName);
      
      // Limpiar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Configurar nuevo timeout
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(notaId, userName);
      }, 2000);
    }
  }, [isEditing, notaId, userName, startTyping, stopTyping]);

  // Guardar cambios
  const saveChanges = useCallback(async () => {
    if (!state.data || !isEditing) return false;

    try {
      const response = await fetch(`${BASE_URL}/notas/${notaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contenido: localContent,
          version: state.data.version,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        data: data.data,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al guardar cambios',
      }));
      return false;
    }
  }, [notaId, authToken, localContent, state.data, isEditing]);

  useEffect(() => {
    if (notaId && authToken) {
      loadNota();
    }
  }, [notaId, authToken, loadNota]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (isEditing) {
        stopEditing();
      }
    };
  }, [isEditing, stopEditing]);

  return {
    nota: state.data,
    loading: state.loading,
    error: state.error,
    isEditing,
    localContent,
    typingUsers: getTypingUsers(notaId),
    startEditing,
    stopEditing,
    handleContentChange,
    saveChanges,
    reload: loadNota,
  };
};
