// Kompapay/Front/src/hooks/index.ts

/**
 * =============================================================================
 * ARCHIVO DE BARRIL PARA HOOKS (HOOKS BARREL FILE)
 * =============================================================================
 * Este archivo es el punto de entrada único para todos los hooks de la aplicación.
 * Centraliza las exportaciones para simplificar las importaciones en los componentes
 * y otros hooks.
 *
 * La estructura es:
 * 1. Re-exportación de toda la configuración y tipos globales.
 * 2. Exportación de hooks de bajo nivel (Core, Datos, Colaboración).
 * 3. Exportación de hooks de orquestación (combinan otros hooks).
 * 4. Exportación de hooks de UI y utilidades.
 * 5. Exportación de metadatos y constantes de la librería de hooks.
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// SECCIÓN 1: RE-EXPORTACIÓN DE CONFIGURACIÓN Y TIPOS GLOBALES
// -----------------------------------------------------------------------------
// Exporta todo desde el archivo de configuración central:
// - Interfaces (User, Gasto, Tablero, etc.)
// - Enums (APIErrorType)
// - Endpoints (ENDPOINTS)
// - Constantes (API_CONFIG, APP_CONFIG, STORAGE_KEYS)
export * from '../config/config';


// -----------------------------------------------------------------------------
// SECCIÓN 2: EXPORTACIÓN DE HOOKS INDIVIDUALES POR DOMINIO
// -----------------------------------------------------------------------------

// -- Core & Autenticación --
export * from './useAPI';       // Hook base para interactuar con la API
export * from './useAuth';      // Manejo de sesión, login, logout

// -- Finanzas y Grupos --
export * from './useExpenses';  // Lógica para gastos y deudas
export * from './useGroups';    // Lógica para grupos

// -- Sincronización y Offline --
export * from './useSync';      // Sincronización de datos con el servidor
export * from './useOffline';   // Manejo de acciones offline
export { useConflicts } from './useConflicts'; // Resolución de conflictos de datos

// -- Colaboración (Tableros, Notas, Tareas) --
export * from './useTableros';  // Lógica para los tableros tipo Trello
export * from './useTareas';    // Lógica para las tareas dentro de los tableros
export * from './useNotas';     // Lógica para las notas colaborativas

// -- UI, Validación y Utilidades --
export * from './useValidation';// Hooks para validación de formularios
export * from './useUtils';     // Hooks con funciones de utilidad general
export * from './useCache';     // Manejo de caché
export * from './useNetworkStatus';// Detección del estado de la red

// -----------------------------------------------------------------------------
// SECCIÓN 3: METADATOS Y CONSTANTES DE LA LIBRERÍA DE HOOKS
// -----------------------------------------------------------------------------

export const HOOK_INFO = {
  name: 'KompaPay React Native Hooks',
  version: '1.0.0',
  description: 'Librería completa de hooks para la aplicación de gestión de gastos KompaPay',
  author: 'KompaPay Development Team',
  license: 'MIT',
  features: [
    'authentication',
    'groups_management',
    'expenses_tracking',
    'debt_calculation',
    'offline_sync',
    'conflict_resolution',
    'collaboration_features', // Trello, Notes
  ],
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
} as const;

export const DEFAULT_CURRENCY = 'USD' as const;