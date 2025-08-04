// config/config.ts

// Detectar si estás en desarrollo o producción
const __DEV__ = process.env.NODE_ENV === 'development';

// Configuraciones por entorno
const CONFIG = {
  development: {
    API_URL: 'https://kompapay.onrender.com/api',
    PUSHER: {
      key: '78f7dc9da405f17d9e93', // Tu key real de Pusher
      cluster: 'us2',
      authEndpoint: 'https://kompapay.onrender.com/broadcasting/auth',
    }
  },
  production: {
    API_URL: 'https://kompapay.onrender.com/api',
    PUSHER: {
      key: '78f7dc9da405f17d9e93', // La misma key para producción
      cluster: 'us2',
      authEndpoint: 'https://kompapay.onrender.com/broadcasting/auth',
    }
  }
};

// Exportar la configuración actual
export const API_URL = __DEV__ ? CONFIG.development.API_URL : CONFIG.production.API_URL;
export const PUSHER_CONFIG = __DEV__ ? CONFIG.development.PUSHER : CONFIG.production.PUSHER;

// Configuración para el hook useApi
export const API_CONFIG = {
  BASE_URL: API_URL,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  TIMEOUT: 30000, // 30 segundos
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
    PAY_DEBT: '/gastos/pay-debt',
    RESOLVE_CONFLICT: '/gastos/{id}/resolver',
    HISTORY: '/gastos/{gastoId}/history',
  },
  AUDIT: {
    USER_LOGS: '/audit/user',
    GROUP_LOGS: '/audit/groups/{grupoId}',
  },
  TABLEROS: { // Funcionalidad tipo Trello, anidada en grupos
    LIST: '/grupos/{grupoId}/tableros',
    CREATE: '/grupos/{grupoId}/tableros',
    SHOW: '/grupos/{grupoId}/tableros/{tableroId}',
    UPDATE: '/grupos/{grupoId}/tableros/{tableroId}',
    DELETE: '/grupos/{grupoId}/tableros/{tableroId}',
    REORDER: '/grupos/{grupoId}/tableros/reorder',
  },
  NOTAS: { // Endpoints para notas colaborativas
    LIST: '/grupos/{grupoId}/notas',
    CREATE: '/grupos/{grupoId}/notas',
    SHOW: '/grupos/{grupoId}/notas/{notaId}',
    UPDATE: '/notas/{notaId}',
    DELETE: '/notas/{notaId}',
    LOCK: '/notas/{notaId}/lock',
    UNLOCK: '/notas/{notaId}/unlock',
  },
  TYPING: { // Endpoints para eventos de typing
    SEND: '/api/typing-events',
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
  password: string; // Cambiado de password_digest a password
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string; // Cambiado de password_digest a password
}

export interface Grupo {
  id: string;
  nombre: string;
  descripcion?: string;
  creado_por: string;
  id_publico: string;
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
  creador?: User;
  miembros?: User[];
  pivot?: {
    user_id: string;
    grupo_id: string;
  };
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
    monto: number; // Alias para compatibilidad
    categoria?: string;
    fecha: string;
    pagado_por: string;
    pagador: User;
    participantes: Participante[];
    grupo?: Grupo;
}

export interface Participante {
    id: string;
    usuario_id: string;
    usuario?: User;
    monto_proporcional: number;
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
    categoria?: string;
    pagado_por: string;
    participantes: { id_usuario: string; monto_proporcional: number }[];
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

// Interfaces para validación de datos
export interface ExpenseValidationData {
    descripcion: string;
    monto: number;
    categoria: string;
    participantes: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// Interface para cálculo de divisiones
export interface SplitCalculation {
    amountPerPerson: number;
    remainder: number;
}

// Interface para cálculo de deudas
export interface DebtCalculation {
    owes: { to: string; amount: number }[];
    owedBy: { from: string; amount: number }[];
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

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

// --- Interfaz para el Log de Auditoría (useUtils) ---

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string; // Para mostrar fácilmente quién hizo la acción
  action: string; // Ej: 'created_group', 'added_expense', 'deleted_member'
  entity_type: string; // Ej: 'App\Models\Grupo', 'App\Models\Gasto'
  entity_id: string;
  details?: Record<string, any>; // Para guardar datos adicionales, como el nombre del grupo creado
  created_at: string;
}

// Interfaces para eventos de notificaciones
export interface Notification {
  id: string;
  user_id: string;
  type: string; // Ej: 'expense_created', 'group_joined'
  message: string;
  isRead: boolean;
  createdAt: string;
}



// --- Interfaces para eventos de typing ---

export interface TypingEventRequest {
  grupo_id: string;
  nota_id: string;
  event_type: 'user-typing' | 'user-stopped-typing';
  user_name: string;
}

// --- Interfaces para manejo de conexión y estado ---

export interface ConnectionStatus {
  isOnline: boolean;
  lastSync?: string;
  pendingActions: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime?: string;
  hasConflicts: boolean;
  conflictCount: number;
}


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