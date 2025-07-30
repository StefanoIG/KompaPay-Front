import { useState, useCallback, useEffect, useRef } from 'react';
import Pusher from 'pusher-js/react-native';
import { BASE_URL, PUSHER_CONFIG } from './types';

// Hook para conexión WebSocket con Pusher
export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelsRef = useRef<Map<string, any>>(new Map());

  // Inicializar conexión Pusher
  const connect = useCallback((authToken: string) => {
    try {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }

      pusherRef.current = new Pusher(PUSHER_CONFIG.key, {
        cluster: PUSHER_CONFIG.cluster,
        authEndpoint: PUSHER_CONFIG.authEndpoint,
        auth: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
        enabledTransports: ['ws', 'wss'],
      });

      pusherRef.current.connection.bind('connected', () => {
        setConnected(true);
        setError(null);
      });

      pusherRef.current.connection.bind('disconnected', () => {
        setConnected(false);
      });

      pusherRef.current.connection.bind('error', (error: any) => {
        setError(error.message || 'Error de conexión WebSocket');
        setConnected(false);
      });

    } catch (err) {
      setError(err.message || 'Error al conectar WebSocket');
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    if (pusherRef.current) {
      // Desuscribirse de todos los canales
      channelsRef.current.forEach((channel, channelName) => {
        pusherRef.current?.unsubscribe(channelName);
      });
      channelsRef.current.clear();

      pusherRef.current.disconnect();
      pusherRef.current = null;
      setConnected(false);
    }
  }, []);

  // Suscribirse a un canal privado de grupo
  const subscribeToGroup = useCallback((groupId: string, callbacks: {
    onTableroCreated?: (data: any) => void;
    onTableroUpdated?: (data: any) => void;
    onTableroDeleted?: (data: any) => void;
    onTareaCreated?: (data: any) => void;
    onTareaUpdated?: (data: any) => void;
    onTareaDeleted?: (data: any) => void;
    onTareaMoved?: (data: any) => void;
    onNotaUpdated?: (data: any) => void;
    onNotaCreated?: (data: any) => void;
    onNotaDeleted?: (data: any) => void;
    onNotaLocked?: (data: any) => void;
    onNotaUnlocked?: (data: any) => void;
    onUserTyping?: (data: any) => void;
    onUserStoppedTyping?: (data: any) => void;
  }) => {
    if (!pusherRef.current) {
      console.warn('WebSocket no conectado');
      return null;
    }

    const channelName = `private-grupo.${groupId}`;
    
    // Si ya estamos suscritos a este canal, lo actualizamos
    if (channelsRef.current.has(channelName)) {
      const existingChannel = channelsRef.current.get(channelName);
      // Desuscribir eventos anteriores
      existingChannel.unbind_all();
    }

    const channel = pusherRef.current.subscribe(channelName);
    channelsRef.current.set(channelName, channel);

    // Eventos de Tableros
    if (callbacks.onTableroCreated) {
      channel.bind('tablero.created', callbacks.onTableroCreated);
    }
    if (callbacks.onTableroUpdated) {
      channel.bind('tablero.updated', callbacks.onTableroUpdated);
    }
    if (callbacks.onTableroDeleted) {
      channel.bind('tablero.deleted', callbacks.onTableroDeleted);
    }

    // Eventos de Tareas
    if (callbacks.onTareaCreated) {
      channel.bind('tarea.created', callbacks.onTareaCreated);
    }
    if (callbacks.onTareaUpdated) {
      channel.bind('tarea.updated', callbacks.onTareaUpdated);
    }
    if (callbacks.onTareaDeleted) {
      channel.bind('tarea.deleted', callbacks.onTareaDeleted);
    }
    if (callbacks.onTareaMoved) {
      channel.bind('tarea.moved', callbacks.onTareaMoved);
    }

    // Eventos de Notas
    if (callbacks.onNotaCreated) {
      channel.bind('nota.created', callbacks.onNotaCreated);
    }
    if (callbacks.onNotaUpdated) {
      channel.bind('nota.updated', callbacks.onNotaUpdated);
    }
    if (callbacks.onNotaDeleted) {
      channel.bind('nota.deleted', callbacks.onNotaDeleted);
    }
    if (callbacks.onNotaLocked) {
      channel.bind('nota.locked', callbacks.onNotaLocked);
    }
    if (callbacks.onNotaUnlocked) {
      channel.bind('nota.unlocked', callbacks.onNotaUnlocked);
    }

    // Eventos de typing (para notas colaborativas)
    if (callbacks.onUserTyping) {
      channel.bind('user.typing', callbacks.onUserTyping);
    }
    if (callbacks.onUserStoppedTyping) {
      channel.bind('user.stopped-typing', callbacks.onUserStoppedTyping);
    }

    return channel;
  }, []);

  // Desuscribirse de un canal de grupo
  const unsubscribeFromGroup = useCallback((groupId: string) => {
    const channelName = `private-grupo.${groupId}`;
    
    if (channelsRef.current.has(channelName)) {
      const channel = channelsRef.current.get(channelName);
      channel.unbind_all();
      pusherRef.current?.unsubscribe(channelName);
      channelsRef.current.delete(channelName);
    }
  }, []);

  // Enviar evento de typing
  const sendTypingEvent = useCallback((groupId: string, notaId: string, userName: string) => {
    const channelName = `private-grupo.${groupId}`;
    const channel = channelsRef.current.get(channelName);
    
    if (channel) {
      channel.trigger('client-user-typing', {
        nota_id: notaId,
        user_name: userName,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  // Enviar evento de parar de escribir
  const sendStoppedTypingEvent = useCallback((groupId: string, notaId: string, userName: string) => {
    const channelName = `private-grupo.${groupId}`;
    const channel = channelsRef.current.get(channelName);
    
    if (channel) {
      channel.trigger('client-user-stopped-typing', {
        nota_id: notaId,
        user_name: userName,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    error,
    connect,
    disconnect,
    subscribeToGroup,
    unsubscribeFromGroup,
    sendTypingEvent,
    sendStoppedTypingEvent,
  };
};

// Hook para presencia de usuarios en tiempo real
export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; name: string }>>([]);
  const pusherRef = useRef<Pusher | null>(null);
  const presenceChannelRef = useRef<any>(null);

  const joinPresence = useCallback((groupId: string, user: { id: string; name: string }, authToken: string) => {
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(PUSHER_CONFIG.key, {
        cluster: PUSHER_CONFIG.cluster,
        authEndpoint: PUSHER_CONFIG.authEndpoint,
        auth: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      });
    }

    const channelName = `presence-grupo.${groupId}`;
    presenceChannelRef.current = pusherRef.current.subscribe(channelName);

    presenceChannelRef.current.bind('pusher:subscription_succeeded', (members: any) => {
      const users = Object.values(members.members).map((member: any) => ({
        id: member.id,
        name: member.name,
      }));
      setOnlineUsers(users);
    });

    presenceChannelRef.current.bind('pusher:member_added', (member: any) => {
      setOnlineUsers(prev => [...prev, { id: member.id, name: member.info.name }]);
    });

    presenceChannelRef.current.bind('pusher:member_removed', (member: any) => {
      setOnlineUsers(prev => prev.filter(user => user.id !== member.id));
    });
  }, []);

  const leavePresence = useCallback(() => {
    if (presenceChannelRef.current) {
      pusherRef.current?.unsubscribe(presenceChannelRef.current.name);
      presenceChannelRef.current = null;
      setOnlineUsers([]);
    }
  }, []);

  return {
    onlineUsers,
    joinPresence,
    leavePresence,
  };
};
