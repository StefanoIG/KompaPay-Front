// app/(auth)/login_new.tsx

import React, { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider'; // 1. Usar el nuevo AuthProvider
import { useAuthValidation } from '@/hooks/useValidation';
import { authStyles } from '@/styles/auth.styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const { login, isLoading: isAuthLoading } = useAuthContext(); // 2. Usar el estado de carga del contexto
    const { validateLoginForm, showValidationAlert } = useAuthValidation();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    
    // 3. Ya no necesitamos los useEffect para redirección y errores.
    // El componente _layout.tsx y el hook useApi ahora manejan esto globalmente.

    const handleLogin = async () => {
        const validationError = validateLoginForm(email, password);
        if (validationError) {
            showValidationAlert(validationError);
            return;
        }
        
        try {
            const user = await login({ email: email.trim(), password });
            
            if (user) {
                // Éxito: El _layout se encargará de la redirección automática.
                // Opcionalmente, puedes forzarlo aquí si es necesario.
                // router.replace('/(tabs)/dashboard_refactored');
            } else {
                // El error de la API ya fue capturado por useApi,
                // pero mostramos una alerta genérica por si acaso.
                Alert.alert('Error de Inicio de Sesión', 'El correo electrónico o la contraseña son incorrectos.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Error Inesperado', 'Ocurrió un error. Verifica tu conexión a internet.');
        }
    };

    const navigateToRegister = () => {
        router.push('/(auth)/register');
    };

    return (
        <View style={authStyles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#2563EB', '#1D4ED8', '#1E40AF']}
                style={authStyles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
                >
                    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                        {/* El resto del JSX (Vistas, TextInputs, etc.) permanece igual */}
                        {/* ... */}
                        <TouchableOpacity 
                            style={[authStyles.button, isAuthLoading && authStyles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isAuthLoading}
                        >
                            <LinearGradient
                                colors={['#2563EB', '#1D4ED8']}
                                style={authStyles.buttonGradient}
                            >
                                <Text style={authStyles.buttonText}>
                                    {isAuthLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </Text>
                                {!isAuthLoading && <Ionicons name="arrow-forward" size={20} color="white" />}
                            </LinearGradient>
                        </TouchableOpacity>
                        {/* ... */}
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}