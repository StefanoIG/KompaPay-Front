// src/hooks/useAuth.ts

import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
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
                SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN),
                SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA),
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
                SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, authToken),
                SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
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
                SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
                SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
                SecureStore.deleteItemAsync(STORAGE_KEYS.OFFLINE_ACTIONS),
                SecureStore.deleteItemAsync(STORAGE_KEYS.LAST_SYNC),
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
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
                method: 'POST',
                headers: API_CONFIG.DEFAULT_HEADERS,
                body: JSON.stringify(credentials),
            });
            
            const data: APIResponse<AuthResponse> = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Credenciales inválidas');
            }
            
            if (!data.data) {
                throw new Error('Respuesta del servidor inválida');
            }

            const { user: userData, token: authToken } = data.data;
            await setAndStoreAuth(userData, authToken);
            return userData;
        } catch (error) {
            console.error("Login failed:", error);
            throw error; // Propagar el error para que el provider lo maneje
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