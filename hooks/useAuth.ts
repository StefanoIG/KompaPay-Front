import { useCallback, useEffect, useState } from 'react';
import { ENDPOINTS, STORAGE_KEYS } from './config';
import { storage } from './storage';
import {
  APIResponse,
  AuthState,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  User,
} from './types';
import { useAPI } from './useAPI';

// Hook para autenticación
export const useAuth = () => {
  const { post, put, clearError } = useAPI();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    success: false,
  });

  // Cargar datos de autenticación desde AsyncStorage al inicializar
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const [storedToken, storedUser] = await Promise.all([
        storage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        storage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (storedToken && storedUser) {
        const user: User = JSON.parse(storedUser);
        setAuthState(prev => ({
          ...prev,
          user,
          token: storedToken,
          isAuthenticated: true,
          loading: false,
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          isAuthenticated: false,
        }));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar sesión guardada',
      }));
    }
  }, []);

  // Guardar datos de autenticación en AsyncStorage
  const saveAuthData = useCallback(async (user: User, token: string) => {
    try {
      await Promise.all([
        storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }, []);

  // Limpiar datos de autenticación
  const clearAuthData = useCallback(async () => {
    try {
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        storage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response: APIResponse<LoginResponse> = await post(
        ENDPOINTS.AUTH.LOGIN,
        credentials,
        false // No requiere autenticación
      );

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await saveAuthData(user, token);
        
        setAuthState(prev => ({
          ...prev,
          user,
          token,
          isAuthenticated: true,
          loading: false,
          success: true,
        }));
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al iniciar sesión',
        isAuthenticated: false,
      }));
      throw error;
    }
  }, [post, saveAuthData]);

  // Registro
  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response: APIResponse<LoginResponse> = await post(
        ENDPOINTS.AUTH.REGISTER,
        userData,
        false // No requiere autenticación
      );

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await saveAuthData(user, token);
        
        setAuthState(prev => ({
          ...prev,
          user,
          token,
          isAuthenticated: true,
          loading: false,
          success: true,
        }));
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al registrar usuario',
        isAuthenticated: false,
      }));
      throw error;
    }
  }, [post, saveAuthData]);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('Starting logout process in useAuth...'); // Debug log
      setAuthState(prev => ({ ...prev, loading: true }));

      // Intentar logout en el servidor (opcional, no bloquear si falla)
      try {
        console.log('Sending logout request to server...'); // Debug log
        await post(ENDPOINTS.AUTH.LOGOUT);
        console.log('Server logout successful'); // Debug log
      } catch (error) {
        console.warn('Error logging out from server:', error);
      }

      // Limpiar datos locales siempre
      console.log('Clearing local auth data...'); // Debug log
      await clearAuthData();
      console.log('Local auth data cleared'); // Debug log
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        success: true,
      });
      
      console.log('Logout process completed successfully'); // Debug log
    } catch (error) {
      console.error('Error during logout:', error);
      // Incluso si hay error, limpiar datos locales
      try {
        await clearAuthData();
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          success: true,
        });
        console.log('Forced logout completed despite error'); // Debug log
      } catch (clearError) {
        console.error('Error clearing auth data during forced logout:', clearError);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cerrar sesión',
        }));
      }
    }
  }, [post, clearAuthData]);

  // Actualizar perfil
  const updateProfile = useCallback(async (updates: UpdateUserRequest): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response: APIResponse<User> = await put(
        ENDPOINTS.AUTH.UPDATE_PROFILE,
        updates
      );

      if (response.success && response.data) {
        const updatedUser = response.data;
        
        // Actualizar AsyncStorage
        await storage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(updatedUser)
        );
        
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
          loading: false,
          success: true,
        }));
      } else {
        throw new Error(response.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al actualizar perfil',
      }));
      throw error;
    }
  }, [put]);

  // Obtener perfil actual del servidor
  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response: APIResponse<User> = await post(ENDPOINTS.AUTH.ME);

      if (response.success && response.data) {
        const user = response.data;
        
        // Actualizar AsyncStorage
        await storage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(user)
        );
        
        setAuthState(prev => ({
          ...prev,
          user,
          loading: false,
          success: true,
        }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al actualizar perfil',
      }));
      throw error;
    }
  }, [post]);

  // Limpiar errores y estados
  const clearAuthError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
    clearError();
  }, [clearError]);

  const clearAuthSuccess = useCallback(() => {
    setAuthState(prev => ({ ...prev, success: false }));
  }, []);

  return {
    // Estado
    ...authState,
    
    // Acciones
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    
    // Utils
    clearAuthError,
    clearAuthSuccess,
    loadStoredAuth,
  };
};

// Hook para verificar si el usuario está autenticado
export const useAuthStatus = () => {
  const { isAuthenticated, loading, user } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: loading,
    user,
    isGuest: !isAuthenticated && !loading,
  };
};
