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
    API_CONFIG // Importamos la configuración de la API
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
    // Para login/register, usamos fetch directamente para romper el ciclo de dependencias.
    // useApi se usará para peticiones autenticadas en otros hooks.
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ... (loadAuthFromStorage, setAndStoreAuth, clearAuth permanecen igual)

    const login = useCallback(async (credentials: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
                method: 'POST',
                headers: API_CONFIG.DEFAULT_HEADERS,
                body: JSON.stringify(credentials),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Credenciales inválidas');
            }
            
            const { user, token } = data.data as AuthResponse;
            await setAndStoreAuth(user, token);
            return user;
        } catch (error) {
            console.error("Login failed:", error);
            // El AuthProvider se encargará de mostrar el error al usuario
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [setAndStoreAuth]);
    
    // ... (register y logout se modifican de forma similar usando fetch)

    return {
        user,
        token,
        login,
        // register,
        // logout,
        // updateProfile,
        isLoading,
        isAuthenticated: !!token,
    };
};