import { useEffect } from 'react';
// Hook principal que integra todos los hooks del sistema de colaboración
import { useWebSocket } from './useWebSocket';
import { useTableros } from './useTableros';
import { useTareas, useTareasStats } from './useTareas';
import { useNotas, useNotaColaborativa } from './useNotas';
import { 
  Tablero, 
  Tarea, 
  Nota, 
  User,
  CreateTableroRequest,
  UpdateTableroRequest,
  CreateTareaRequest,
  UpdateTareaRequest,
  MoveTareaRequest,
  CreateNotaRequest,
  UpdateNotaRequest
} from './types';

// Hook principal para el sistema completo de colaboración
export const useColaboracion = (groupId: string, authToken: string, currentUser: User) => {
  const webSocket = useWebSocket();
  const tableros = useTableros(groupId, authToken);
  const notas = useNotas(groupId, authToken);

  // Conectar WebSocket automáticamente
  useEffect(() => {
    if (authToken && !webSocket.connected) {
      webSocket.connect(authToken);
    }

    return () => {
      webSocket.disconnect();
    };
  }, [authToken, webSocket]);

  // Métodos para tableros
  const createTablero = async (data: CreateTableroRequest) => {
    return await tableros.createTablero(data);
  };

  const updateTablero = async (tableroId: string, data: UpdateTableroRequest) => {
    return await tableros.updateTablero(tableroId, data);
  };

  const deleteTablero = async (tableroId: string) => {
    return await tableros.deleteTablero(tableroId);
  };

  const reorderTableros = async (orderedIds: string[]) => {
    return await tableros.reorderTableros(orderedIds);
  };

  // Métodos para notas
  const createNota = async (data: CreateNotaRequest) => {
    return await notas.createNota(data);
  };

  const updateNota = async (notaId: string, data: UpdateNotaRequest) => {
    return await notas.updateNota(notaId, data);
  };

  const deleteNota = async (notaId: string) => {
    return await notas.deleteNota(notaId);
  };

  const lockNota = async (notaId: string) => {
    return await notas.lockNota(notaId);
  };

  const unlockNota = async (notaId: string) => {
    return await notas.unlockNota(notaId);
  };

  const startTyping = (notaId: string) => {
    notas.startTyping(notaId, currentUser.name);
  };

  const stopTyping = (notaId: string) => {
    notas.stopTyping(notaId, currentUser.name);
  };

  // Recargar todo
  const reloadAll = async () => {
    await Promise.all([
      tableros.loadTableros(),
      notas.loadNotas(),
    ]);
  };

  return {
    // Estados
    connected: webSocket.connected,
    connectionError: webSocket.error,
    tableros: tableros.tableros,
    tablerosLoading: tableros.loading,
    tablerosError: tableros.error,
    notas: notas.notas,
    notasLoading: notas.loading,
    notasError: notas.error,

    // Métodos de tableros
    createTablero,
    updateTablero,
    deleteTablero,
    reorderTableros,

    // Métodos de notas
    createNota,
    updateNota,
    deleteNota,
    lockNota,
    unlockNota,
    startTyping,
    stopTyping,
    getTypingUsers: notas.getTypingUsers,
    isNotaLocked: notas.isNotaLocked,
    getNotaHistory: notas.getNotaHistory,

    // Métodos generales
    reloadAll,
    connectWebSocket: webSocket.connect,
    disconnectWebSocket: webSocket.disconnect,
  };
};

// Hook para un tablero específico con sus tareas
export const useTableroCompleto = (tableroId: string, authToken: string, groupId: string) => {
  const tareas = useTareas(tableroId, authToken, groupId);
  const stats = useTareasStats(tableroId, authToken);

  const createTarea = async (data: CreateTareaRequest) => {
    return await tareas.createTarea(data);
  };

  const updateTarea = async (tareaId: string, data: UpdateTareaRequest) => {
    return await tareas.updateTarea(tareaId, data);
  };

  const moveTarea = async (tareaId: string, data: MoveTareaRequest) => {
    return await tareas.moveTarea(tareaId, data);
  };

  const deleteTarea = async (tareaId: string) => {
    return await tareas.deleteTarea(tareaId);
  };

  const reorderTareas = async (orderedIds: string[]) => {
    return await tareas.reorderTareas(orderedIds);
  };

  // Filtros y utilidades
  const getPendientes = () => tareas.getTasksByEstado('pendiente');
  const getEnProgreso = () => tareas.getTasksByEstado('en_progreso');
  const getCompletadas = () => tareas.getTasksByEstado('completada');
  const getVencidas = () => tareas.getOverdueTasks();
  const getByUser = (userId: string) => tareas.getTasksByUser(userId);
  const getByPrioridad = (prioridad: 'baja' | 'media' | 'alta') => 
    tareas.getTasksByPrioridad(prioridad);

  return {
    tareas: tareas.tareas,
    loading: tareas.loading,
    error: tareas.error,
    stats: stats.stats,
    statsLoading: stats.loading,
    statsError: stats.error,

    // Métodos CRUD
    createTarea,
    updateTarea,
    moveTarea,
    deleteTarea,
    reorderTareas,

    // Filtros
    getPendientes,
    getEnProgreso,
    getCompletadas,
    getVencidas,
    getByUser,
    getByPrioridad,

    // Utilidades
    reload: tareas.loadTareas,
  };
};

// Exportar todos los hooks individuales también
export {
  useWebSocket,
  useTableros,
  useTareas,
  useTareasStats,
  useNotas,
  useNotaColaborativa,
};

// Exportar tipos
export type {
  Tablero,
  Tarea,
  Nota,
  User,
  CreateTableroRequest,
  UpdateTableroRequest,
  CreateTareaRequest,
  UpdateTareaRequest,
  MoveTareaRequest,
  CreateNotaRequest,
  UpdateNotaRequest,
};
