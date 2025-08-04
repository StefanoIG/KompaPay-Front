// src/hooks/useAuth.ts

import { useState, useCallback, useEffect } from 'react';
import { secureStorage } from './secureStorage';
import {
    User,
    LoginRequest,
    RegisterRequest,
    UpdateUserRequest,
    STORAGE_KEYS,
    ENDPOINTS,
    API_CONFIG,
    APIResponse
} from '../config/config';

interface AuthResponse {
    token: string;
    user: User;
}

/**
 * Hook para gestionar la lógica de autenticación.
 * Diseñado para ser consumido por un AuthProvider.
 */
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Función para cargar los datos de autenticación desde el storage
    const loadAuthFromStorage = useCallback(async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                secureStorage.getItemAsync(STORAGE_KEYS.AUTH_TOKEN),
                secureStorage.getItemAsync(STORAGE_KEYS.USER_DATA),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading auth from storage:', error);
            await clearAuth();
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función para establecer y almacenar los datos de autenticación
    const setAndStoreAuth = useCallback(async (userData: User, authToken: string) => {
        try {
            await Promise.all([
                secureStorage.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, authToken),
                secureStorage.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
            ]);
            setUser(userData);
            setToken(authToken);
        } catch (error) {
            console.error('Error storing auth data:', error);
            throw new Error('Error al guardar los datos de autenticación');
        }
    }, []);

    // Función para limpiar los datos de autenticación
    const clearAuth = useCallback(async () => {
        try {
            await Promise.all([
                secureStorage.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
                secureStorage.deleteItemAsync(STORAGE_KEYS.USER_DATA),
                secureStorage.deleteItemAsync(STORAGE_KEYS.OFFLINE_ACTIONS),
                secureStorage.deleteItemAsync(STORAGE_KEYS.LAST_SYNC),
            ]);
        } catch (error) {
            console.error('Error clearing auth data:', error);
        } finally {
            setUser(null);
            setToken(null);
        }
    }, []);

    // Cargar datos de autenticación al inicializar
    useEffect(() => {
        loadAuthFromStorage();
    }, [loadAuthFromStorage]);

    const login = useCallback(async (credentials: LoginRequest): Promise<User | null> => {
        setIsLoading(true);
        try {
            console.log('Login attempt with:', { email: credentials.email, url: `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}` });
            
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
                method: 'POST',
                headers: API_CONFIG.DEFAULT_HEADERS,
                body: JSON.stringify(credentials),
            });
            
            console.log('Login response status:', response.status);
            console.log('Login response ok:', response.ok);
            
            // Intentar parsear la respuesta
            let data: any; // Cambiar tipo para manejar la respuesta de debug
            try {
                data = await response.json();
                console.log('Login response data:', data);
            } catch (parseError) {
                console.error('Error parsing response JSON:', parseError);
                throw new Error('Respuesta del servidor inválida - no es JSON válido');
            }

            // Verificar si es el endpoint debug/login (respuesta diferente)
            if (data.usuario_encontrado !== undefined) {
                // Respuesta del endpoint /debug/login
                if (!response.ok || !data.usuario_encontrado || !data.password_correcto) {
                    const errorMessage = 'Credenciales inválidas';
                    console.error('Login error from debug endpoint:', errorMessage);
                    throw new Error(errorMessage);
                }
                
                if (!data.user_data || !data.user_data.id) {
                    throw new Error('Respuesta del servidor inválida - datos de usuario faltantes');
                }

                // Adaptar la respuesta del debug endpoint al formato esperado
                const userData: User = {
                    id: data.user_data.id,
                    name: data.user_data.nombre || data.nombre,
                    email: data.user_data.email || data.email,
                };
                
                // Para debug, generar un token temporal (el endpoint debug no devuelve token)
                const authToken = `debug_token_${userData.id}_${Date.now()}`;
                
                await setAndStoreAuth(userData, authToken);
                return userData;
            } else {
                // Respuesta del endpoint normal /login
                if (!response.ok || !data.success) {
                    const errorMessage = data.message || `Error del servidor (${response.status})`;
                    console.error('Login error from server:', errorMessage);
                    throw new Error(errorMessage);
                }
                
                if (!data.data) {
                    throw new Error('Respuesta del servidor inválida - datos faltantes');
                }

                const { user: userData, token: authToken } = data.data;
                await setAndStoreAuth(userData, authToken);
                return userData;
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);
            
            // Mejorar el manejo de errores específicos
            if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
                throw new Error('Error de conexión - verifica tu conexión a internet');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de red - no se puede conectar al servidor');
            } else if (error.message) {
                // Si ya tiene un mensaje específico, usarlo
                throw error;
            } else {
                // Error genérico como último recurso
                throw new Error('Error desconocido durante el login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [setAndStoreAuth]);

    const register = useCallback(async (userData: RegisterRequest): Promise<User | null> => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, {
                method: 'POST',
                headers: API_CONFIG.DEFAULT_HEADERS,
                body: JSON.stringify(userData),
            });
            
            const data: APIResponse<AuthResponse> = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error en el registro');
            }
            
            if (!data.data) {
                throw new Error('Respuesta del servidor inválida');
            }

            const { user: newUser, token: authToken } = data.data;
            await setAndStoreAuth(newUser, authToken);
            return newUser;
        } catch (error) {
            console.error("Register failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [setAndStoreAuth]);

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            if (token) {
                // Intentar logout en el servidor
                await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, {
                    method: 'POST',
                    headers: {
                        ...API_CONFIG.DEFAULT_HEADERS,
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error("Logout request failed:", error);
            // No lanzar error porque queremos limpiar los datos locales de todos modos
        } finally {
            await clearAuth();
            setIsLoading(false);
        }
    }, [token, clearAuth]);

    const updateProfile = useCallback(async (updates: UpdateUserRequest): Promise<User | null> => {
        if (!token || !user) {
            throw new Error('No hay usuario autenticado');
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.PROFILE}`, {
                method: 'PUT',
                headers: {
                    ...API_CONFIG.DEFAULT_HEADERS,
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });
            
            const data: APIResponse<User> = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al actualizar el perfil');
            }
            
            if (!data.data) {
                throw new Error('Respuesta del servidor inválida');
            }

            const updatedUser = data.data;
            await setAndStoreAuth(updatedUser, token);
            return updatedUser;
        } catch (error) {
            console.error("Update profile failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [token, user, setAndStoreAuth]);

    return {
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        isLoading,
        isAuthenticated: !!token && !!user,
    };
};