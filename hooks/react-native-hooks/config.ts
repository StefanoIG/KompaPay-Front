// Configuración para los hooks de React Native
export const BASE_URL = 'http://192.168.1.100:8000/api'; // Ajustar según tu IP local

// Configuración de Pusher (estas variables vendrán del .env de React Native)
export const PUSHER_CONFIG = {
  key: 'your_pusher_key', // Reemplazar con EXPO_PUBLIC_PUSHER_KEY
  cluster: 'mt1', // Reemplazar con EXPO_PUBLIC_PUSHER_CLUSTER
  authEndpoint: `${BASE_URL}/broadcasting/auth`,
};

// Para usar con Expo Constants:
// import Constants from 'expo-constants';
// export const BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.1.100:8000/api';
// export const PUSHER_CONFIG = {
//   key: Constants.expoConfig?.extra?.PUSHER_KEY || 'your_pusher_key',
//   cluster: Constants.expoConfig?.extra?.PUSHER_CLUSTER || 'mt1',
//   authEndpoint: `${BASE_URL}/broadcasting/auth`,
// };

// Tipos TypeScript para los datos
export interface Tablero {
  id: string;
  grupo_id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Tarea {
  id: string;
  tablero_id: string;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta';
  fecha_vencimiento?: string;
  asignado_a?: string;
  etiquetas?: string[];
  orden: number;
  created_at: string;
  updated_at: string;
  asignado?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Nota {
  id: string;
  grupo_id: string;
  titulo: string;
  contenido: string;
  version: number;
  bloqueada_por?: string;
  ultimo_editor: string;
  created_at: string;
  updated_at: string;
  editor?: {
    id: string;
    name: string;
    email: string;
  };
  bloqueador?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TypingUser {
  nota_id: string;
  user_name: string;
  timestamp: string;
}

// Eventos WebSocket
export interface WebSocketCallbacks {
  onTableroCreated?: (data: { tablero: Tablero }) => void;
  onTableroUpdated?: (data: { tablero: Tablero }) => void;
  onTableroDeleted?: (data: { tablero_id: string }) => void;
  onTareaCreated?: (data: { tarea: Tarea }) => void;
  onTareaUpdated?: (data: { tarea: Tarea }) => void;
  onTareaDeleted?: (data: { tarea_id: string }) => void;
  onTareaMoved?: (data: { tarea: Tarea; old_tablero_id: string; new_tablero_id: string }) => void;
  onNotaCreated?: (data: { nota: Nota }) => void;
  onNotaUpdated?: (data: { nota: Nota }) => void;
  onNotaDeleted?: (data: { nota_id: string }) => void;
  onNotaLocked?: (data: { nota_id: string; locked_by: User }) => void;
  onNotaUnlocked?: (data: { nota_id: string }) => void;
  onUserTyping?: (data: TypingUser) => void;
  onUserStoppedTyping?: (data: TypingUser) => void;
}

// Estados de API
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

// Request types
export interface CreateTableroRequest {
  nombre: string;
  descripcion?: string;
  color?: string;
}

export interface UpdateTableroRequest {
  nombre?: string;
  descripcion?: string;
  color?: string;
  orden?: number;
}

export interface CreateTareaRequest {
  titulo: string;
  descripcion?: string;
  estado?: 'pendiente' | 'en_progreso' | 'completada';
  prioridad?: 'baja' | 'media' | 'alta';
  fecha_vencimiento?: string;
  asignado_a?: string;
  etiquetas?: string[];
}

export interface UpdateTareaRequest {
  titulo?: string;
  descripcion?: string;
  estado?: 'pendiente' | 'en_progreso' | 'completada';
  prioridad?: 'baja' | 'media' | 'alta';
  fecha_vencimiento?: string;
  asignado_a?: string;
  etiquetas?: string[];
  orden?: number;
}

export interface MoveTareaRequest {
  tablero_id: string;
  orden: number;
}

export interface CreateNotaRequest {
  titulo: string;
  contenido: string;
}

export interface UpdateNotaRequest {
  titulo?: string;
  contenido?: string;
}

export interface ReorderRequest {
  ids: string[];
}
