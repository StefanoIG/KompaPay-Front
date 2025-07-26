// Archivo índice para exportar todos los hooks de KompaPay
// Permite importar todos los hooks desde un solo lugar

// Configuración y tipos
export * from './config';
export * from './types';

// Hooks principales
export { useAPI } from './useAPI';
export { useAuth } from './useAuth';
export { useExpense, useExpenses, useGroupDebts } from './useExpenses';
export { useGroup, useGroups } from './useGroups';
export { useConflicts, useOffline, useSync } from './useSync';

// Hooks de UI y validación
export { useDashboardUI, useExploreUI } from './useUI';
export { useUtilities } from './useUtilities';
export { useAuthValidation, useFormValidation, usePasswordStrength } from './useValidation';

// Hooks de utilidades existentes
export {
    useAudit, useCache, useNetworkStatus, useUtils
} from './useUtils';

// Re-exportar tipos importantes para fácil acceso
export type {
    APIResponse, AuthState, CreateGastoRequest, CreateGrupoRequest, CreateUserRequest, DeudaResumen, ExpensesState, Gasto, GroupsState, Grupo, LoginRequest, PayDebtRequest, SyncConflicto, SyncState, User
} from './types';

// Re-exportar configuraciones importantes
export {
    APIErrorType, API_CONFIG,
    APP_CONFIG, BASE_URL,
    ENDPOINTS, EXPENSE_CATEGORIES, STORAGE_KEYS
} from './config';

// Constantes útiles para la aplicación
export const HOOK_VERSION = '1.0.0';
export const SUPPORTED_FEATURES = [
  'authentication',
  'groups_management',
  'expenses_tracking',
  'debt_calculation',
  'offline_sync',
  'conflict_resolution',
  'audit_logging',
  'data_caching',
] as const;

// Configuraciones por defecto recomendadas
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
} as const;

export const DEFAULT_CURRENCY = 'USD' as const;

// Métodos de utilidad para configuración rápida
export const createHookConfig = (options?: {
  baseUrl?: string;
  timeout?: number;
  currency?: string;
}) => ({
  baseUrl: options?.baseUrl || BASE_URL,
  timeout: options?.timeout || API_CONFIG.TIMEOUT,
  currency: options?.currency || DEFAULT_CURRENCY,
});

// Información del paquete
export const HOOK_INFO = {
  name: 'KompaPay React Native Hooks',
  version: HOOK_VERSION,
  description: 'Complete hook library for KompaPay expense management app',
  features: SUPPORTED_FEATURES,
  author: 'KompaPay Development Team',
  license: 'MIT',
} as const;
