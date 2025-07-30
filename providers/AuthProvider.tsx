// src/providers/AuthProvider.tsx

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '../config/config';

// 1. Definir el tipo del Contexto
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: any) => Promise<User | null>;
    register: (userData: any) => Promise<User | null>;
    logout: () => Promise<void>;
    updateProfile: (updates: any) => Promise<User | null>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

// 2. Crear el Contexto con un valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Crear el componente Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useAuth(); // Llama al hook que contiene la lógica

    // El valor proveído al contexto es el retorno del hook
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// 4. Crear un hook personalizado para consumir el contexto fácilmente
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};