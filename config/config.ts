// Kompapay/Front/src/config/index.ts

import Constants from 'expo-constants';

/**
 * =============================================================================
 * ARCHIVO DE CONFIGURACIÓN GLOBAL
 * =============================================================================
 * Este archivo centraliza toda la configuración de la aplicación KompaPay.
 * Incluye:
 * - Configuración de API y entorno.
 * - Endpoints de la API.
 * - Claves de almacenamiento local.
 * - Constantes y configuraciones de la aplicación.
 * - Enumeraciones (Enums).
 * - Tipos e interfaces de TypeScript para todo el proyecto.
 *
 * La configuración prioriza el uso de variables de entorno (.env) para
 * mayor seguridad y flexibilidad entre entornos de desarrollo y producción.
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// SECCIÓN 1: CONFIGURACIÓN DE ENTORNO Y API
// -----------------------------------------------------------------------------

const { manifest } = Constants;

// Lectura segura de variables de entorno
const EXPO_PUBLIC_API_URL = manifest?.extra?.EXPO_PUBLIC_API_URL;
const EXPO_PUBLIC_PUSHER_KEY = manifest?.extra?.EXPO_PUBLIC_PUSHER_KEY;
const EXPO_PUBLIC_PUSHER_CLUSTER = manifest?.extra?.EXPO_PUBLIC_PUSHER_CLUSTER;

/**
 * Obtiene la URL base de la API de forma segura desde las variables de entorno.
 * Lanza un error si la variable no está configurada para evitar problemas en tiempo de ejecución.
 * @returns {string} La URL base de la API.
 */
function getApiBaseUrl(): string {
  if (EXPO_PUBLIC_API_URL) {
    return EXPO_PUBLIC_API_URL;
  }
  throw new Error(
    'FATAL: La variable EXPO_PUBLIC_API_URL no está definida en tu archivo .env. Por favor, crea un archivo .env en la raíz del proyecto y añade la IP de tu servidor. Ejemplo: EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api'
  );
}

// URL base para uso directo en toda la aplicación
export const BASE_URL = getApiBaseUrl();

// Configuración principal del cliente de API (ej. Axios)
export const API_CONFIG = {
  BASE_URL,
  TIMEOUT: 10000, // 10 segundos
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Configuración de Pusher para WebSockets y broadcasting
export const PUSHER_CONFIG = {
  key: EXPO_PUBLIC_PUSHER_KEY || 'default_pusher_key', // Fallback por si no está en .env
  cluster: EXPO_PUBLIC_PUSHER_CLUSTER || 'mt1',
  authEndpoint: `${BASE_URL}/broadcasting/auth`,
};

// -----------------------------------------------------------------------------
// SECCIÓN 2: CONSTANTES Y CLAVES DE LA APLICACIÓN
// -----------------------------------------------------------------------------

// Claves para el almacenamiento local seguro (AsyncStorage)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'kompapay_auth_token',
  USER_DATA: 'kompapay_user_data',
  OFFLINE_ACTIONS: 'kompapay_offline_actions',
  LAST_SYNC: 'kompapay_last_sync',
};

// Configuraciones generales de la lógica de la aplicación
export const APP_CONFIG = {
  MAX_OFFLINE_RETRIES: 3,
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutos
  CACHE_DURATION: 15 * 60 * 1000, // 15 minutos
  PAGINATION: {
    INITIAL_PAGE: 1,
    PAGE_SIZE: 20,
  },
};

// Categorías de gastos predefinidas
export const EXPENSE_CATEGORIES = [
  'Comida', 'Transporte', 'Entretenimiento', 'Compras', 'Servicios',
  'Viajes', 'Salud', 'Educación', 'Hogar', 'Otros',
];


// -----------------------------------------------------------------------------
// SECCIÓN 3: ENDPOINTS DE LA API
// -----------------------------------------------------------------------------

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    PROFILE: '/user',
  },
  USERS: {
    FIND_BY_PUBLIC_ID: '/users/find',
  },
  GROUPS: {
    LIST: '/grupos',
    CREATE: '/grupos',
    SHOW: '/grupos', // Se completa con /grupos/{id}
    UPDATE: '/grupos', // Se completa con /grupos/{id}
    DELETE: '/grupos', // Se completa con /grupos/{id}
    JOIN: '/grupos/join',
    INVITE_MEMBER: '/grupos/{grupoId}/invitar',
    ADD_MEMBER: '/grupos/{grupoId}/members',
    REMOVE_MEMBER: '/grupos/{grupoId}/members/{usuarioId}',
    EXPENSES: '/grupos/{grupoId}/gastos',
  },
  EXPENSES: {
    CREATE: '/gastos',
    SHOW: '/gastos', // Se completa con /gastos/{id}
    UPDATE: '/gastos', // Se completa con /gastos/{id}
    DELETE: '/gastos', // Se completa con /gastos/{id}
    MY_EXPENSES: '/user/gastos',
    MY_DEBTS: '/user/deudas',
    MARK_PAID: '/gastos/{id}/pagar',
    RESOLVE_CONFLICT: '/gastos/{id}/resolver',
    HISTORY: '/gastos/{gastoId}/history',
  },
  TABLEROS: { // Funcionalidad tipo Trello, anidada en grupos
    LIST: '/grupos/{grupoId}/tableros',
    CREATE: '/grupos/{grupoId}/tableros',
    SHOW: '/grupos/{grupoId}/tableros/{tableroId}',
    UPDATE: '/grupos/{grupoId}/tableros/{tableroId}',
    DELETE: '/grupos/{grupoId}/tableros/{tableroId}',
    REORDER: '/grupos/{grupoId}/tableros/reorder',
  },
  SYNC: {
    PULL: '/sync/pull',
    PUSH: '/sync/push',
    RESOLVE_CONFLICT: '/sync/conflicts',
  },
  REPORTS: {
    BALANCE_PDF: '/reportes/balance/pdf',
    BALANCE_SUMMARY: '/reportes/balance/resumen',
  },
};

// -----------------------------------------------------------------------------
// SECCIÓN 4: TIPOS, INTERFACES Y ENUMS
// -----------------------------------------------------------------------------

// -- Enums --

export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// -- Interfaces de Estado de API --

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

// -- Interfaces de Modelos de Datos (la forma de los datos de la API) --

export interface User {
  id: string;
  name: string;
  email: string;
}

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
  asignado?: User;
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
  editor?: User;
  bloqueador?: User;
}

export interface TypingUser {
  nota_id: string;
  user_name: string;
  timestamp: string;
}

// -- Interfaces para Payloads de Peticiones a la API --

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

export interface UpdateTareaRequest extends Partial<CreateTareaRequest> {
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

export interface LoginRequest {
  email: string;
  password_digest: string; // O el nombre del campo que use tu backend
}

export interface RegisterRequest {
  name: string;
  email: string;
  password_digest: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  descripcion?: string;
  id_publico: string;
  miembros?: User[];
}

export interface CreateGrupoRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdateGrupoRequest extends Partial<CreateGrupoRequest> {}

export interface JoinGroupRequest {
  id_publico: string;
}

export interface InviteMemberRequest {
  email: string;
}

export interface Gasto {
    id: string;
    grupo_id: string;
    descripcion: string;
    monto_total: number;
    pagado_por: string;
    fecha: string;
    grupo?: Grupo;
    // ...otros campos de tu modelo Gasto
}

export interface Deuda {
    id: string;
    deudor: User;
    acreedor: User;
    monto: number;
    gasto: Gasto;
}

export interface Acreencia {
    id: string;
    deudor: User;
    acreedor: User;
    monto: number;
    gasto: Gasto;
}

export interface DeudaResumen {
    total_debes: number;
    total_te_deben: number;
    balance: number;
}

export interface CreateGastoRequest {
    grupo_id: string;
    descripcion: string;
    monto_total: number;
    pagado_por: string;
    participantes: { id_usuario: string; monto_proporcional: number }[];
    // ...otros campos necesarios
}

export interface UpdateGastoRequest extends Partial<CreateGastoRequest> {}

export interface PayDebtRequest {
    acreedor_id: string;
    monto: number;
}

export interface GroupExpensesParams {
    desde?: string;
    hasta?: string;
    categoria?: string;
    pagador_id?: string;
    participante_id?: string;
}

export interface FiltrosReporte {
  grupo_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface GastoReporte {
  descripcion: string;
  monto: string;
  fecha: string;
  pagador: string;
  participacion_usuario: number;
}

export interface GrupoReporte {
  nombre: string;
  total_gastos: number;
  balance_usuario: number;
  gastos: GastoReporte[];
}

export interface ResumenReporte {
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  grupos: GrupoReporte[];
  resumen: {
    total_pagado: number;
    total_adeudado: number;
    balance_general: number;
  };
}

export type OfflineActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface OfflineAction {
  id: string;
  timestamp: string;
  type: OfflineActionType;
  endpoint: string;
  payload: any;
}

export interface SyncData {
  updated: any[];
  deleted: { entity: string, id: string }[];
  server_timestamp: string;
}

export interface SyncConflicto {
  id: string;
  entity_id: string;
  local_data: any;
  server_data: any;
  conflict_type: string;
}

export interface ResolveConflictRequest {
    resolution_strategy: 'TAKE_SERVER' | 'TAKE_LOCAL' | 'MERGE';
    merged_data?: any;
}

export interface UpdateUserRequest extends Partial<Omit<User, 'id' | 'email'>> {}

// -- Interfaces para Callbacks de WebSockets --

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